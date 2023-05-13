# cookie具有独立分区状态(CHIPS)

## 环境

- `HTTPS`环境

- `cookie属性Partitioned`：chrome v109+



## 项目地址

[Github项目： xqv-solution/cookie3th](https://github.com/JYbill/xqv-solution/tree/main/packages/cookie3th)



## 隐私问题

- 国外的隐私相比国内来说是很重要的，以前在站点中嵌套iframe，可以利用跨域iframe的第三方cookie完成埋点推荐数据采集与分析

```tsx
// 进入站点A
请求网站：site-a.com
iframe: site-3th.com // 嵌入站点C
// site-a.com的cookie、site-3th.com的cookie

// 进入站点B
请求网站：site-b.com
iframe: site-3th.com // 嵌入站点C
// site-b.com的cookie、site-3th.com的cookie
```

> 访问站点A记录了用户喜爱的商品，并将操作发送给`site-3th.com`，并记录cookie，访问站点B时site-3th.com的cookie随请求发送，从而`site-3th.com`可以通知`site-b.com`将用户喜爱的商品数据以合适的时机再次展示出现

- 问题：杜绝这种第三方cookie泄漏隐私的行为，但我们又可能需要第三方cookie的一些信息



## 广告隐私实现

- 进入项目地址
- 启动项目

```bash
npm i
nx sever cookie3th
```

- 开始之前，请确保https://127.0.0.1:3000和https://localhost:3000域名下的cookie清空

1. 访问：https://localhost:3000/site-b，不会被种上cookie

   ```tsx
   // site-b.html，跨域获取第三方cookie
   <iframe src="https://127.0.0.1:3000/ad?by=site-b"></iframe>
   ```

   ```ts
   // "/ad"
   // 返回ad html并根据GET"by"参数种上cookie
   @Get("ad")
   @Header("Content-Type", "text/html; charset=utf-8")
   getADPage(
     @Query("by") by: string,
     @Res({ passthrough: true }) res: Response
   ) {
     if (by === "site-a") {
       res.set("set-cookie", "name=xqv; SameSite=None; Secure;"); // 仅site-a页面会种上
     }
     const stream = createReadStream(resolve(__dirname, "assets/ad.html"));
     return new StreamableFile(stream);
   }
   ```

   ![image-20230513152846064](https://image.jybill.top/md/20230513152847.png)

2. 访问：https://192.168.1.10:3000/site-a（这是我的局域网IP，自行百度获取）此时ad第三方cookie被种在`127.0.0.1`这个域名下

   ```tsx
   // site-a html
   <iframe src="https://127.0.0.1:3000/ad?by=site-a"></iframe>
   ```

   ![image-20230513153415215](https://image.jybill.top/md/20230513153417.png)




- 这里解释一下cookie几个属性的含义

```ts
// nest设置cookie，这里必须将cookie显示设置sameSite为None，且具有Secure属性，才能发送第三方cookie
res.set("set-cookie", "name=xqv; SameSite=None; Secure;");
```

> ⚠️ chrome v51+之后，cookie默认都是SameSite=Lax(部分类型请求不携带第三方cookie)，SameSite还有Strict(所有请求都不携带第三方cookie，None(允许所有请求携带第三方cookie，但是必须设置Secure，在HTTPS环境下成立)，详细查看最后的参考标题内的链接`阮一峰：Cookie的SameSite属性`



3. 验证一：刷新重新访问https://localhost:3000/site-b，发现这个第三方cookie随着请求了

![image-20230513154322981](https://image.jybill.top/md/20230513154324.png)

4. 验证二：（清空cookie后）重新访问`site-a`后，此时我们在访问https://localhost:3000/site-b的界面中devtool刷新cookie；发现`127.0.0.1`的第三方cookie共享了。

![image-20230513153844673](https://image.jybill.top/md/20230513153846.png)

> 以上就是以iframe的第三方cookie追踪埋点的极简实现





## cookie独立分区状态

- 设置独立分区：`set-cookie`设置`Partitioned`属性
- 未设置之前的ad cookie key = https://127.0.0.1:3000（iframe）
- 设置之后的ad cookie key = {("https://192.168.1.10:3000")(主站点), ("https://127.0.0.1:3000")(iframe)}
- `Partitioned`作用：限制iframe下的第三方cookie的范围



- `演示`（前提：清空所涉及域名的所有cookie）
- `场景`：我允许你iframe的第三方cookie，但是我要限制iframe下的第三方cookie的范围；在A站点下可以发送iframe的第三方cookie；通过B站点无法直接发送、直接访问iframe url也无法发送

1. 访问站点b：https://127.0.0.1:3000/b，不会种cookie
1. 访问站点a：https://192.168.1.10:3000/a，种下cookie

![image-20230513155946499](https://image.jybill.top/md/20230513155947.png)

2. 校验一：访问b站点https://localhost:3000/b；发现不会携带第三方cookie，因为被独立分区了
2. 校验二：访问iframe url地址https://127.0.0.1:3000/partitioned?by=b；发现也不会携带，原因同样是因为分区

> 既保证了iframe第三方cookie共享，又保证了用户不同站点之间的隐私



## cookie第一方集(提案)

- `问题`：使用域名严格区分cookie独立分区过于严格，希望能通过设置一系列域名让这些独立分区下的域名能够共享cookie
- **例子一🌰**：公司有两个站点A和B，我们希望A和B应该能够共享才对
- **例子二🌰**：iframe.site.com、chat.site.com、login.site.com这三子域名都应该共享cookie才对





## 参考

- [MDN文档：具有独立状态的cookie(CHIPS)](https://developer.mozilla.org/en-US/docs/Web/Privacy/Partitioned_cookies)
- [阮一峰：Cookie的SameSite属性](https://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html)
- [MDN文档：有效的第三方cookie嵌入方案(第一方集提案的简单介绍)](https://developer.mozilla.org/en-US/docs/Web/Privacy/Partitioned_cookies#a_valid_third-party_embed_scenario)
- [Github：first-party-sets第一方集提案](https://github.com/WICG/first-party-sets)
- [wx文章：Cookie 的访问方式可能要有大变化了！](https://mp.weixin.qq.com/s/Gjn1GaOmOKaV7eu4v5Allw)

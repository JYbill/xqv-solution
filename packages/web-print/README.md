# web打印的奇技淫巧

## 背景

- 公司需要做一个报告打印，内容过长会分为多张纸打印，且每页都必须要有固定的`页眉`、`页脚`

![image-20230427205501406](https://image.jybill.top/md/20230427205503.png)



## 奇技淫巧一:控制台以打印媒体类型展示

- 在`devtool` -> `渲染/render` -> `模拟CSS媒体类型`中拥有`打印`模式，它可以显示你在打印下的样式

![image-20230427210302780](https://image.jybill.top/md/20230427210304.png)

```less
@media print {
  .header,
  .footer {
    position: fixed;
  }
}
```

![image-20230427210415756](https://image.jybill.top/md/20230427210418.png)



## 奇技淫巧二:打印背景

- 默认不打印背景

![image-20230428155815726](https://image.jybill.top/md/20230428155823.png)

- 设置打印背景

![image-20230428155911920](https://image.jybill.top/md/20230428155914.png)

## 实现

```ts
      <button onClick={print}>打印</button>
      <StyleWrapper className="wrapper" ref={wrapperRef}>
        <div className="header" ref={headerRef}>
          日记：GPT的一天
        </div>
        <div className="content">
         // ...
        </div>
        <table className="print-table" ref={tableRef}>
          <thead></thead>
          <tbody></tbody>
          <tfoot></tfoot>
        </table>
        <div className="footer" ref={footerRef}>
          作者：GPT3.5
        </div>
      </StyleWrapper>
      <iframe
        ref={iframeRef}
        title="打印iframe容器"
        width="100%"
        height="600px"
      />
    </>
```

- 🤔思路：`.content`用于html展示的数据，`table.print-table`（display: none）用于打印时显示，将content拷贝一份到table中，再将content隐藏，table显示就可以在打印预览中显示了
- 使用了`position: fixed`后头部和底部占位的解决方案：使用table的`thead`、`tfoot`，他们可以在每一页中都实现占位的作用

> 🪧 至于原理，希望大佬们知道的回复我，我在网上一直没有找到这块相关的内容...

```tsx
/**
  * 打印核心逻辑
  */
function print() {
  if (
    !tableRef.current ||
    !wrapperRef.current ||
    !headerRef.current ||
    !footerRef.current ||
    !iframeRef.current
  )
    return;
  const contentEl = wrapperRef.current.querySelector(
    ".content"
  ) as HTMLDivElement;

  const theadEl = tableRef.current.tHead as HTMLTableSectionElement;
  const tfootEl = tableRef.current.tFoot as HTMLTableSectionElement;
  const tbodyEl = tableRef.current.tBodies[0];
  tbodyEl.appendChild(contentEl.cloneNode(true)); // clone主体部分copy到table里
  contentEl.style.display = "none";

  // 设置thead、tfoot高度，占位
  const headerHeight = getElHeight(headerRef);
  const footerHeight = getElHeight(footerRef);
  theadEl.style.height = `${headerHeight + 10}px`;
  tfootEl.style.height = `${footerHeight + 10}px`;

  // 拷贝打印内容到iframe
  const header = document.head.innerHTML;
  console.log(wrapperRef.current);
  const copyNode = wrapperRef.current.cloneNode(true);
  const iframeDoc = iframeRef.current.contentDocument as Document;
  const iframeWin = iframeRef.current.contentWindow as Window;
  iframeDoc.head.innerHTML = header;
  iframeDoc.body.appendChild(copyNode);
  iframeWin.focus();
  iframeWin.print();
  
  // 复原
  contentEl.style.display = "block";
  iframeDoc.head.innerHTML = "";
  iframeDoc.body.innerHTML = "";
}
```



## 给孩子一点鼓励

- [web打印的奇技淫巧 Github地址](https://github.com/JYbill/xqv-solution/tree/main/packages/web-print)

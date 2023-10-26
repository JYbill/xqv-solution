import { AppModule } from "../../app.module";
import { UserService } from "../../user/user.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Auth", () => {
  let app: INestApplication;
  let userService: UserService;
  let testUid: string;
  let testAccessToken: string;
  let testRefreshToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    userService = moduleRef.get<UserService>(UserService);
    await app.init();
  });

  /**
   * 测试注册功能✅
   */
  async function registerTestFunc(count: number) {
    return request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "test@qq.com",
        name: "test",
        age: 24,
        password: "test",
        account: "1",
      })
      .expect((res: request.Response) => {
        // debug
        // const req = JSON.parse(JSON.stringify(res)).req;
        // console.log("/GET /auth/register Request", req);
        if (count === 1) {
          if (res.error) {
            throw new TypeError(res.error.text);
          }
        } else if (count === 2) {
          if (res.statusCode !== 400) {
            throw new TypeError("检查是否存在同email、同account的账号");
          }
        }
      });
  }
  it(`/POST /auth/register`, async () => {
    let count = 0;
    const res = await registerTestFunc(++count);
    await registerTestFunc(++count);

    // 删除测试用例
    testUid = res.body["data"]["id"] as string;
  });

  /**
   * 登录逻辑功能✅
   */
  it(`/POST /auth/login`, async () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@qq.com",
        password: "test",
      })
      .expect((res: request.Response) => {
        const body = res.body;
        testAccessToken = `Bearer ${body["data"]["accessToken"]}`;
        testRefreshToken = `Refresh ${body["data"]["refreshToken"]}`;
        if (res.statusCode !== 201 || body.code !== 1 || !testAccessToken) {
          console.log(res.error);
          throw new TypeError("不符合要求，请检查代码");
        }
      });
  });

  /**
   * 测试刷新Token ⚠️
   */
  it("/PUT /auth/refresh", async () => {
    return request(app.getHttpServer())
      .put("/auth/refresh")
      .set({
        Authorization: testAccessToken,
      })
      .send({
        refreshToken: testRefreshToken,
      })
      .expect((res: request.Response) => {
        const body = res.body;
        if (res.statusCode !== 200 || body.code !== 1) {
          console.error(res.error);
          throw new TypeError("不符合要求，请检查代码");
        }
        testAccessToken = `Bearer ${body["data"]["accessToken"]}`;
        const refreshToken = `Refresh ${body["data"]["refreshToken"]}`;
        if (refreshToken) {
          testRefreshToken = refreshToken;
        }
      });
  });

  /**
   * 登出逻辑功能 ✅
   */
  it(`/POST /auth/logout`, async () => {
    return request(app.getHttpServer())
      .delete("/auth/logout")
      .set({
        Authorization: testAccessToken,
      })
      .expect((res: request.Response) => {
        const body = res.body;
        if (res.statusCode !== 200 || body.code !== 1) {
          console.log(res.error);
          throw new TypeError("不符合要求，请检查代码");
        }
      });
  });

  /**
   * 测试JWT失效无法正常访问接口 ✅
   */
  it("/GET /user/self", async () => {
    return request(app.getHttpServer())
      .get("/user/self")
      .set({
        Authorization: testAccessToken,
      })
      .expect((res: request.Response) => {
        const body = res.body;
        if (res.statusCode !== 400 || body.code !== 0) {
          console.log(res.error);
          throw new TypeError("不符合要求，请检查代码");
        }
      });
  });

  /**
   * 最后会删除注册注册的用户 ✅
   */
  afterAll(async () => {
    const delUser = await userService.delUserByID(testUid);
    console.log("删除用户结果：", delUser); // debug
    await app.close();
  });
});

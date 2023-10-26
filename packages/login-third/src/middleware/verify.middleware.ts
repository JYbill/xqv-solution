import { ParamsErrorException } from "../exception/global.expectation";
import { MemoService } from "../memo/memo.service";
import { ResponseUtil } from "../util/response.util";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import passport from "passport";
import { Strategy as JWTStrategy, VerifiedCallback } from "passport-jwt";

/**
 * @Description: passport-jwt校验中间件
 * @Author: 小钦var
 * @Date: 2023/10/24 10:36
 */
@Injectable()
export default class VerifyMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly memoService: MemoService
  ) {
    passport.use(
      "jwt",
      new JWTStrategy(
        {
          // 1. 获取Token的方法
          jwtFromRequest: (req: Request) => {
            if (!req.headers["authorization"].includes("Bearer ")) {
              return null;
            }
            // 这里可以自定义，但是返回的结果一定是JWT，否则passport-jwt进行校验，失败则抛出异常
            return req.headers["authorization"].split("Bearer ")[1];
          },
          ignoreExpiration: false,
          secretOrKey: this.configService.get("JWT_SECRET"),
          passReqToCallback: true, // 钩子传入Request参数
        },

        // 2. 此策略的校验钩子（此时代表jwt是成功的，可以自己进行二次其他的校验）
        // TIP:
        // 同步：抛出异常回掉用passport.error()方法，该方法会触发下面的authCallback()。
        // 异步：控制权全凭我们调用done()
        // ⚠️ 在authCallback回调函数存在的情况下。本质上调用done相当于调用passport.success() -> authCallback()，抛出异常相当于调用passport.error() -> authCallback()
        async (req: Request, payload: IPayload, done: VerifiedCallback) => {
          if (!payload.userID || !payload.email || !payload.exp) {
            done(new JsonWebTokenError("伪造JWT"), null);
            return;
          }

          // 校验是否与redis中的accessToken一致
          const accessToken = req.headers["authorization"].split("Bearer ")[1];
          const loginInfo = await this.memoService.getLoginInfo(payload.userID);
          if (!loginInfo) {
            done(null, null, { message: "用户已登出" });
            return;
          } else if (loginInfo.accessToken !== accessToken) {
            done(null, null, { message: "JWT非最新" });
            return;
          }

          // 此处调用passport.success()的回调函数，即下面的`authCallback()`
          done(null, payload);
        }
      )
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "jwt",
      {
        failureMessage: true,
      },

      /**
       * 3. 认证完成回调
       * @param err 异常/错误（失败）
       * @param user payload（成功）
       * @param info 失败信息（失败）
       */
      function authCallback(
        err: Error,
        user: IPayload,
        info: { message: string }
      ) {
        // 错误处理
        const forbidden = err || info;
        if (forbidden) {
          let tip = "";
          if (info) {
            tip = info.message;
          } else {
            tip = err.message;
          }
          const errRet = ResponseUtil.error(tip);
          return res.status(400).json(errRet).end();
        }

        // 执行下一个中间件
        req.user = user;
        next();
      }
    )(req, res, next);
  }
}

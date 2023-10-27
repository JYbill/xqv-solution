import { TokenException } from "../exception/global.expectation";
import { MemoService } from "../memo/memo.service";
import { ResponseUtil } from "../util/response.util";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
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
    passport.serializeUser(function (user, cb) {
      console.log("serializeUser");
      cb(null, user);
    });

    passport.deserializeUser(function (user, cb) {
      console.log("deserializeUser");
      cb(null, user);
    });
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
            // 抛出异常就会执行passport.fail() -> 下一个策略，没有时调用认证回调函数()
            return req.headers["authorization"].split("Bearer ")[1];
          },
          ignoreExpiration: false,
          secretOrKey: this.configService.get("JWT_SECRET"),
          passReqToCallback: true, // 钩子传入Request参数
        },

        // 2. 此策略的校验钩子（此时代表jwt校验是成功的，可以自己进行二次其他的校验）
        // TIP:
        // 这里最好写同步写法，不要async/await，因为passport-jwt中并未对异步做支持，要用异步就用Promise
        // done(err) -> passport.error() -> 认证回调()
        // done(null, payload) -> passport.success() -> 认证回调()
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
        session: true,
      },
      // 3. 认证完成回调
      function authCallback(
        err: Error,
        user: IPayload,
        info: { message: string }
      ) {
        // 错误处理
        const forbidden = err || info;
        if (forbidden) {
          req.pass = false;
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
        req.logIn(user, { session: false }, (err: Error) => {
          if (err) throw new TokenException(err.message);
          req.pass = true;
          next();
        });
      }
    )(req, res, next);
  }
}

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

        // 2. 合法JWT Token钩子（此时代表jwt是成功的，可以自己进行二次其他的校验）
        // > TIP: 因为这里的控制权由callback：done函数决定，所以可以使用async/await函数，只需要在完成或找到异常时调用done方法即可
        async (req: Request, payload: IPayload, done: VerifiedCallback) => {
          if (!payload.userID || !payload.email || !payload.exp) {
            done(new JsonWebTokenError("伪造JWT"), null);
            return;
          }

          // 校验是否与redis中的accessToken一致
          const accessToken = req.headers["authorization"].split("Bearer ")[1];
          const loginInfo = await this.memoService.getLoginInfo(payload.userID);
          if (!loginInfo) {
            done(new JsonWebTokenError("用户已登出"), null);
            return;
          } else if (loginInfo.accessToken !== accessToken) {
            done(new JsonWebTokenError("JWT非最新"), null);
            return;
          }

          // 一致、合法、安全的JWT
          done(null, payload);
        }
      )
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    const verifyFn = passport.authenticate(
      "jwt",

      /**
       * 3.
       * - Strategy校验通过后，掉用done()，会执行该钩子
       * - Strategy校验钩子内抛出异常，则会掉用该钩子（同步代码下）
       * @param err 当Strategy校验通过后的钩子如果抛出了异常，此时err存在
       * @param user payload
       * @param info 可能是错误，也可能是成功信息（由第三方Strategy、以及自定第2步校验完成的钩子决定）
       */
      (err: Error, user: IPayload, info: Error) => {
        // 错误处理
        const forbidden = err || info instanceof Error;
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
    );
    verifyFn(req, res, next);
  }
}

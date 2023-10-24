import { ParamsErrorException } from "../exception/global.expectation";
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

/**
 * 校验信息
 */
interface IVerify {
  flag: boolean;
  message: string;
}

@Injectable()
export default class VerifyMiddleware {
  constructor(private readonly configService: ConfigService) {
    passport.use(
      "jwt",
      new JWTStrategy(
        {
          // 获取Token的方法
          jwtFromRequest: (req: Request) => {
            return req.headers["authorization"].split("Bearer ")[1];
          },
          ignoreExpiration: false,
          secretOrKey: this.configService.get("JWT_SECRET"),
        },

        // 合法JWT Token钩子
        (jwt_payload, done: VerifiedCallback): void => {
          done(null, jwt_payload, { flag: true, message: "校验成功" });
        }
      )
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    const verifyFn = passport.authenticate(
      "jwt",
      (err: unknown, user: IPayload, info: JsonWebTokenError | IVerify) => {
        if (
          err ||
          info instanceof JsonWebTokenError ||
          !(info as IVerify).flag
        ) {
          throw new ParamsErrorException(info.message);
        }
        req.user = user;
        next();
      }
    );
    verifyFn(req, res, next);
  }
}

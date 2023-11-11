import { Provider } from "../enum/app.enum";
import { OAuth2Exception } from "../exception/global.expectation";
import { HttpException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";

/**
 * @Description: Github认证授权中间件
 * @Author: 小钦var
 * @Date: 2023/11/2 10:12
 */

@Injectable()
export default class GithubMiddleware {
  private readonly logger = new Logger(GithubMiddleware.name);

  constructor(
    private readonly configService: ConfigService<IEnv>,
    @Inject(Provider.GOT) private readonly gotService: GotType
  ) {
    OAuth2Strategy.prototype.userProfile = function (
      accessToken: string,
      done: (err: Error | null, profile: object | null) => void
    ) {
      // TODO: 利用认证令牌获取用户基础信息, GET https://api.github.com/user
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      done(null, { name: "xqv" });
    };
    const strategy = new OAuth2Strategy(
      {
        clientID: this.configService.get("GITHUB_CLIENT_ID"),
        clientSecret: this.configService.get("GITHUB_SECRET"),
        authorizationURL: "https://github.com/login/oauth/authorize",
        tokenURL: "https://github.com/login/oauth/access_token",
        callbackURL: "http://localhost:3000/api/auth/github",
        passReqToCallback: true,
        state: true,
      },
      function (req, accessToken, refreshToken, results, profile, verified) {
        verified(null, results);
      }
    );
    passport.use("githubOAuth2.0", strategy);
  }

  use(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "githubOAuth2.0",
      { session: false },
      (err: Error, user: IPayload, info: { message: string }) => {
        req.session.destroy((err: Error) => {
          if (err) {
            throw new HttpException(err.message, 500);
          }
        });
        if (err) {
          this.logger.error(err.message);
          return next(new OAuth2Exception("认证失败，请重新发起认证授权"));
        }

        if (!user) {
          this.logger.error(info.message);
          return next(new OAuth2Exception(info.message));
        }
        res.clearCookie("connect.sid");
        res.json({ code: 0, msg: user });
      }
    )(req, res, next);
  }
}

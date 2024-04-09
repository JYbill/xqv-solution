import { Provider } from "../enum/app.enum";
import { OAuth2Exception } from "../exception/global.expectation";
import { RetGotType } from "../global/http-client.provider";
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
    @Inject(Provider.GOT) private readonly gotService: RetGotType
  ) {
    OAuth2Strategy.prototype.userProfile = function (
      accessToken: string,
      done: (err: Error | null, profile: UserGithub | null) => void
    ) {
      gotService
        .got("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .json()
        .then((res: UserGithub) => {
          done(null, res);
        });
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
      function (
        _req: Request,
        accessToken: string,
        _refreshToken: string | undefined,
        results,
        profile: UserGithub,
        verified
      ) {
        profile.tokenType = results["token_type"];
        profile.accessToken = accessToken;
        verified(null, profile);
      }
    );
    passport.use("githubOAuth2.0", strategy);
  }

  use(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "githubOAuth2.0",
      { session: false },
      (err: Error, user: UserGithub, info: { message: string }) => {
        if (err) {
          this.logger.error(err.message);
          return next(new OAuth2Exception("认证失败，请重新发起认证授权"));
        }

        if (!user) {
          this.logger.error(info.message);
          return next(new OAuth2Exception(info.message));
        }

        // 清理操作
        res.clearCookie("connect.sid");
        req.session.destroy((err: Error) => {
          if (err) {
            throw new HttpException(err.message, 500);
          }
          // GitHub登录成功逻辑
          req.github = user;
          next();
        });
      }
    )(req, res, next);
  }
}

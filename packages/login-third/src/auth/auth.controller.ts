import { GithubType } from "../dto/github.dto";
import { UserLogin, UserRegister } from "../dto/user.dto";
import {
  ParamsErrorException,
  ParamsMissedException,
  TokenException,
} from "../exception/global.expectation";
import { ResponseUtil } from "../util/response.util";
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Post,
  Put,
  Req,
  Res,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";

import { AuthService } from "./auth.service";

@Controller("/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post("/register")
  async register(@Body() user: UserRegister) {
    if (user.age >= 200) {
      throw new ParamsErrorException("请填写真实年龄");
    }
    const register = await this.authService.registerUser(user);
    return ResponseUtil.success(register, "注册成功，请登录！");
  }

  @Post("/login")
  async accountLogin(@Body() user: UserLogin) {
    if (!user.email && !user.account) {
      throw new ParamsMissedException();
    }
    const data = await this.authService.accountLogin(user);
    return ResponseUtil.success(data);
  }

  // TIP允许条件：JWT有效时间内、用户是登录状态下
  @Delete("/logout")
  async logout(@Req() req: Request) {
    await this.authService.logout(req.user.userID);
    return ResponseUtil.success(null, "登出成功");
  }

  @Put("/refresh")
  async refreshJWTToken(
    @Headers("authorization") authHead: string,
    @Body("refreshToken") refreshToken: string
  ) {
    // 非Token
    if (
      !authHead.startsWith("Bearer ") ||
      !refreshToken.startsWith("Refresh ")
    ) {
      throw new ParamsMissedException();
    }

    // 解码token
    const accessToken = authHead.split("Bearer ")[1];
    const freshToken = refreshToken.split("Refresh ")[1];
    const nestData = await this.authService.refreshAllToken(
      accessToken,
      freshToken
    );
    return ResponseUtil.success(nestData, "刷新成功");
  }

  @Get("/github")
  async githubLogin(@Req() req: Request, @Res() res: Response) {
    const github = req.github;
    const githubModel: Omit<GithubType, "id"> = {
      username: github.login,
      githubID: github.id,
      avatarURL: github.avatar_url,
      homepageURL: github.html_url,
      followers: github.followers,
      following: github.following,
      type: github.type,
      company: github.company,
      blog: github.blog,
      location: github.location,
      email: github.email,
      bio: github.bio,
      publicRepos: github.public_repos,
      createdAt: github.created_at,
      updatedAt: github.updated_at,
      tokenType: github.tokenType,
      accessToken: github.accessToken,
    };

    res.end("ok");
  }
}

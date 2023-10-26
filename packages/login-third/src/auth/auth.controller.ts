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
  Headers,
  Post,
  Put,
  Req,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

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
}

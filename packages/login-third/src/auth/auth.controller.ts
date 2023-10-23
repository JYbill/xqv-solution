import { UserLogin, UserRegister } from "../dto/user.dto";
import {
  ParamsErrorException,
  ParamsMissedException,
} from "../exception/global.expectation";
import { ResponseUtil } from "../util/response.util";
import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";

@Controller("/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    const token = await this.authService.accountLogin(user);
    return ResponseUtil.success(token);
  }
}

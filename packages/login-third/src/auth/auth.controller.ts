import { UserDTO, UserRegister } from "../dto/user.dto";
import { ResponseUtil } from "../util/response.util";
import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";

@Controller("/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  async register(@Body() user: UserRegister) {
    const userRet = await this.authService.registerUser(user);
    return ResponseUtil.success(userRet);
  }
}

import { ResponseUtil } from "../util/response.util";
import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";

import { UserService } from "./user.service";

@Controller("/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/self")
  async self(@Req() req: Request) {
    const user = await this.userService.findUserByID(req.user.userID);
    return ResponseUtil.success(user);
  }
}

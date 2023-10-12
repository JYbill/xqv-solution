import { Controller, Delete, Get, Post, Put, Scope } from "@nestjs/common";

import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}
  @Get("/")
  async getUsers() {
    return this.userService.findAll();
  }

  @Put("/")
  async updUser() {
    return this.userService.updUserById("6523ccb8f432e30ba2a48989", {
      name: "xqv",
      account: "xqv",
    });
  }

  @Post("/")
  async createUser() {
    return this.userService.insertUser({
      name: "abc",
      account: "abc",
      email: "abc@gmail.com",
      password: "123456",
    });
  }

  @Delete("/")
  async delUser() {
    return this.userService.delUserByID("65250d430f91b2433e6f4032");
  }
}

/**
 * @Description: 认证授权模块
 * @Author: 小钦var
 * @Date: 2023/10/9 14:05
 */
import { UserModule } from "../user/user.module";
import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

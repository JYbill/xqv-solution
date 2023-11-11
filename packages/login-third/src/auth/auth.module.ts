/**
 * @Description: 认证授权模块
 * @Author: 小钦var
 * @Date: 2023/10/9 14:05
 */
import { MemoModule } from "../memo/memo.module";
import { UserModule } from "../user/user.module";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    MemoModule,
    UserModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService<IEnv>) => {
        return {
          secret: configService.get("JWT_SECRET"),
          signOptions: { expiresIn: "60s" },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

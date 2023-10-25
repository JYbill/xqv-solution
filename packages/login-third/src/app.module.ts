import { RedisModule } from "@liaoliaots/nestjs-redis";
import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import process from "process";

import { AuthModule } from "./auth/auth.module";
import { validateConfig } from "./config/config.validate";
import { RedisNameSpace } from "./enum/app.enum";
import { MemoModule } from "./memo/memo.module";
import LoggerMiddleware from "./middleware/log.middleware";
import VerifyMiddleware from "./middleware/verify.middleware";
import { IPrismaModule } from "./prisma/prisma.builder";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: validateConfig,
    }),
    PrismaModule.forRootAsync({
      useFactory: (): IPrismaModule => {
        return {
          isGlobal: true,
          async prismaOptFactory() {
            const prismaOption: Prisma.PrismaClientOptions = {};
            if (process.env["NODE_ENV"] === "development") {
              prismaOption.log = ["query", "info", "warn", "error"];
            }
            return prismaOption;
          },
        };
      },
    }),
    AuthModule,
    UserModule,
    MemoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  async configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, VerifyMiddleware)
      .exclude("/auth/register", "/auth/login")
      .forRoutes("*");
  }
}

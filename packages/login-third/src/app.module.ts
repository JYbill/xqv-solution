import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import process from "process";

import { AuthModule } from "./auth/auth.module";
import { validateConfig } from "./config/config.validate";
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
      load: [
        () => ({
          REFRESH_EXPIRE: "7d",
        }),
      ],
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
    consumer.apply().forRoutes("*");
    consumer
      .apply(LoggerMiddleware)
      .forRoutes("*")
      .apply(VerifyMiddleware)
      .exclude("/auth/register", "/auth/login", "/auth/refresh")
      .forRoutes("*");
  }
}

import { RedisModule } from "@liaoliaots/nestjs-redis";
import { RedisModuleOptions } from "@liaoliaots/nestjs-redis/dist/redis/interfaces/redis-module-options.interface";
import { Inject, MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import RedisStore from "connect-redis";
import session from "express-session";
import Redis from "ioredis";
import process from "process";

import { AuthModule } from "./auth/auth.module";
import { validateConfig } from "./config/config.validate";
import { Provider, RedisNameSpace } from "./enum/app.enum";
import { RedisExpectation } from "./exception/global.expectation";
import { GlobalModule } from "./global/global.module";
import { MemoModule } from "./memo/memo.module";
import GithubMiddleware from "./middleware/github.middleware";
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
          SESSION_SECRET: "xqv",
          SESSION_KEY: "frog-sso:",
        }),
      ],
      validate: validateConfig,
    }),
    RedisModule.forRootAsync({
      useFactory(configService: ConfigService<IEnv>): RedisModuleOptions {
        const redisURL = configService.get<string>("REDIS_URL");
        const redisPWD = configService.get<string>("REDIS_PWD");
        return {
          readyLog: true,
          errorLog: true,
          commonOptions: {
            password: redisPWD,
            db: 0,
          },
          config: [
            {
              url: redisURL,
              namespace: RedisNameSpace.REDIS_0,
              onClientCreated(client: Redis) {
                client.on("error", (err: Error) => {
                  console.error(err);
                  throw new RedisExpectation();
                });
              },
            },
          ],
        };
      },
      inject: [ConfigService],
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
    GlobalModule,
    AuthModule,
    UserModule,
    MemoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(
    private readonly configService: ConfigService<IEnv>,
    @Inject(Provider.REDIS_SESSION) private readonly RedisSession: RedisStore
  ) {}

  async configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
    consumer
      .apply(VerifyMiddleware)
      .exclude("auth/register", "auth/login")
      .forRoutes("*", "auth/logout", "auth/refresh");
    consumer
      .apply(
        session({
          // name: cookie name默认connect.sid
          // rolling: 强制设置每个响应的cookie.maxAge，重制倒计时
          store: this.RedisSession,
          secret: this.configService.get("SESSION_SECRET"),
          resave: false,
          saveUninitialized: false,
        })
      )
      .forRoutes("/auth/github");
    consumer.apply(GithubMiddleware).forRoutes("/auth/github");
  }
}

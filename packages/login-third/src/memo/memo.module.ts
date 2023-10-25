import { RedisNameSpace } from "../enum/app.enum";
import {
  DBExpectation,
  RedisExpectation,
} from "../exception/global.expectation";
import { RedisModule } from "@liaoliaots/nestjs-redis";
import { RedisModuleOptions } from "@liaoliaots/nestjs-redis/dist/redis/interfaces/redis-module-options.interface";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

import { MemoService } from "./memo.service";

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync(
      {
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
      },
      false
    ),
  ],
  providers: [MemoService],
  exports: [MemoService],
})
export class MemoModule {}

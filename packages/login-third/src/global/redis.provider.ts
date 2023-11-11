import { Provider, RedisNameSpace } from "../enum/app.enum";
import { RedisService } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";

export const RedisClient = {
  provide: Provider.REDIS,
  useFactory(redisService: RedisService): Redis {
    return redisService.getClient(RedisNameSpace.REDIS_0);
  },
  inject: [RedisService],
};

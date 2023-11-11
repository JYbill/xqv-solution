import { Provider } from "../enum/app.enum";
import { FactoryProvider } from "@nestjs/common/interfaces/modules/provider.interface";
import { ConfigService } from "@nestjs/config";
import RedisStore from "connect-redis";
import Redis from "ioredis";

export const RedisSession: FactoryProvider<RedisStore> = {
  provide: Provider.REDIS_SESSION,
  useFactory: (redis: Redis, configService: ConfigService) => {
    return new RedisStore({
      client: redis,
      prefix: configService.get("SESSION_KEY"),
    });
  },
  inject: [Provider.REDIS, ConfigService],
};

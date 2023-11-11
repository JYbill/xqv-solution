import { Global, Module } from "@nestjs/common";

import { GotService } from "./http-client.provider";
import { RedisSession } from "./redis-session.provider";
import { RedisClient } from "./redis.provider";

@Global()
@Module({
  providers: [RedisClient, RedisSession, GotService],
  exports: [RedisClient, RedisSession, GotService],
})
export class GlobalModule {}

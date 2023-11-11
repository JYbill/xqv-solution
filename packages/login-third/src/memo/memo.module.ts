import { RedisSession } from "../global/redis-session.provider";
import { RedisClient } from "../global/redis.provider";
import { Global, Module } from "@nestjs/common";

import { MemoService } from "./memo.service";

@Module({
  providers: [MemoService, RedisClient, RedisSession],
  exports: [MemoService],
})
export class MemoModule {}

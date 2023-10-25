import { UserType } from "../dto/user.dto";
import { RedisKey, RedisNameSpace } from "../enum/app.enum";
import { RedisService } from "@liaoliaots/nestjs-redis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

export interface LoginInfo extends Record<string, string | number> {
  email: string;
  account: string;
  accessToken: string;
  loginStamp: number;
}

@Injectable()
export class MemoService {
  private readonly redisClient0: Redis;
  constructor(private readonly redisService: RedisService) {
    this.redisClient0 = this.redisService.getClient(RedisNameSpace.REDIS_0);
  }

  /**
   * 根据uid获取登录信息
   * @param uid
   */
  async getLoginInfo(uid: string) {
    const loginInfo = (await this.redisClient0.hgetall(
      RedisKey.USER + uid
    )) as LoginInfo;
    return loginInfo;
  }

  /**
   * 存储登录信息
   * @param user
   * @param accessToken
   */
  async storageLoginInfo(user: UserType, accessToken: string) {
    await this.redisClient0.hset(RedisKey.USER + user.id, {
      email: user.email,
      account: user.account,
      accessToken,
      loginStamp: Date.now(),
    });
  }
}

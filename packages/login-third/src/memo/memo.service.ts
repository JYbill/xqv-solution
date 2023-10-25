import { UserType } from "../dto/user.dto";
import { AccountType, RedisKey, RedisNameSpace } from "../enum/app.enum";
import { LogoutException } from "../exception/global.expectation";
import { RedisService } from "@liaoliaots/nestjs-redis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

export interface LoginInfo extends Record<string, string | number> {
  email: string;
  account: string;
  accessToken: string;
  type: AccountType;
  loginStamp: number;
}

@Injectable()
export class MemoService {
  readonly redisClient0: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redisClient0 = this.redisService.getClient(RedisNameSpace.REDIS_0);
  }

  /**
   * 根据uid获取登录信息
   * @param uid
   */
  async getLoginInfo(uid: string): Promise<LoginInfo | null> {
    let loginInfo = (await this.redisClient0.hgetall(
      RedisKey.USER + uid
    )) as LoginInfo;
    loginInfo = Object.keys(loginInfo).length <= 0 ? null : loginInfo;
    return loginInfo;
  }

  /**
   * 存储登录信息
   * @param user
   * @param accessToken
   * @param expire 过期时间(s)
   */
  async storageLoginInfo(user: UserType, accessToken: string, expire: number) {
    const redisKey = RedisKey.USER + user.id;
    await this.redisClient0
      .pipeline()
      .hset(redisKey, {
        email: user.email,
        account: user.account,
        accessToken,
        type: AccountType.ACCOUNT,
        loginStamp: Date.now(),
      })
      .expire(redisKey, expire)
      .exec();
  }

  /**
   * 根据用户id删除登录信息
   * @param uid
   */
  async delStorageByUid(uid: string) {
    const num = await this.redisClient0.del(RedisKey.USER + uid);
    if (num !== 1) {
      throw new LogoutException();
    }
    return num;
  }
}

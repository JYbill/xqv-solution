import { UserType } from "../dto/user.dto";
import { AccountType, RedisKey, RedisNameSpace } from "../enum/app.enum";
import {
  DBExpectation,
  LogoutException,
  RedisExpectation,
} from "../exception/global.expectation";
import { RedisService } from "@liaoliaots/nestjs-redis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

export interface LoginInfo extends Record<string, string | number> {
  email: string;
  account: string;
  accessToken: string;
  refreshToken: string;
  type: AccountType;
  updateStamp: number;
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
   * @param accessToken 认证令牌
   * @param refreshToken 刷新令牌
   * @param expire 过期时间(s)
   */
  async storageLoginInfo(
    user: UserType,
    accessToken: string,
    refreshToken: string,
    expire: number
  ) {
    const redisKey = RedisKey.USER + user.id;
    await this.redisClient0
      .pipeline()
      .hset(redisKey, {
        email: user.email,
        account: user.account,
        accessToken,
        refreshToken,
        type: AccountType.ACCOUNT,
        updateStamp: Date.now(),
      })
      .expire(redisKey, expire)
      .exec();
  }

  /**
   * 更新登录信息
   * @param uid
   * @param info
   */
  async updLoginInfo(
    uid: string,
    info: Pick<LoginInfo, "accessToken" | "refreshToken">
  ) {
    const redisKey = RedisKey.USER + uid;
    const pipe = this.redisClient0
      .pipeline()
      .hset(redisKey, "updateStamp", Date.now())
      .hset(redisKey, "accessToken", info.accessToken);
    if (info.refreshToken) {
      pipe.hset(redisKey, "refreshToken", info.refreshToken);
    }
    const resList = await pipe.exec();
    for (const [err] of resList) {
      if (err) {
        throw new RedisExpectation();
      }
    }
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

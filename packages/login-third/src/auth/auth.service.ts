import { GithubType } from "../dto/github.dto";
import { UserDTO, UserLogin, UserRegister, UserType } from "../dto/user.dto";
import {
  LoginException,
  TokenException,
} from "../exception/global.expectation";
import { MemoService } from "../memo/memo.service";
import { UserService } from "../user/user.service";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { JwtSignOptions } from "@nestjs/jwt/dist/interfaces/jwt-module-options.interface";
import CryptoJS from "crypto-js";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly memoService: MemoService,
    private readonly configService: ConfigService<IEnv>
  ) {}

  /**
   * 注册用户
   * @param user
   */
  async registerUser(user: UserRegister) {
    const userData = user as UserDTO;
    userData.salt = CryptoJS.lib.WordArray.random(32 / 8).toString();
    const pwdHash = this.hashPWD(userData.password, userData.salt);
    userData.password = pwdHash;

    const res = await this.userService.createUser(userData);
    return res;
  }

  /**
   * 账号登录
   * @param user
   */
  async accountLogin(user: UserLogin) {
    const userRes = await this.userService.findUserByLogin(user as UserType);
    const pwdHash = this.hashPWD(user.password, userRes.salt);
    if (userRes.password !== pwdHash) {
      throw new LoginException();
    }

    // 创建双令牌
    const { accessToken, refreshToken } = await this.createToken(userRes);
    return { accessToken, refreshToken };
  }

  /**
   * 退出登录：清理redis登录信息
   * @param uid
   */
  async logout(uid: string) {
    return this.memoService.delStorageByUid(uid);
  }

  /**
   * 刷新token
   * @param accessToken
   * @param refreshToken
   */
  async refreshAllToken(accessToken: string, refreshToken: string) {
    // 校验accessToken、refreshToken的关联性
    const accessPayload = this.jwtService.decode(accessToken) as IPayload;
    const refreshPayload = this.jwtService.decode(
      refreshToken
    ) as IRefreshPayload;
    if (
      !accessPayload ||
      !refreshPayload ||
      accessPayload.userID !== refreshPayload.userID
    ) {
      this.logger.error("双Token uid不相关联，疑似伪造");
      throw new TokenException();
    }

    // 校验token是否合法、且存在登录状态
    const uid = accessPayload.userID;
    const loginInfo = await this.memoService.getLoginInfo(uid);
    if (!loginInfo) {
      throw new LoginException("账号已登出");
    }
    if (
      accessToken !== loginInfo.accessToken ||
      refreshToken !== loginInfo.refreshToken
    ) {
      this.logger.error("双Token未存储在缓存内，疑似伪造");
      throw new TokenException();
    }

    // 创建双令牌
    const user = await this.userService.findUserByID(uid);
    const newestAccessToken = await this.createAccessToken(user);

    // 刷新令牌已经过去了一半，则刷新令牌
    // 认证令牌过期后，刷新令牌时长：7d，当后3.5d未访问，则刷新令牌过期，重新登录。当3.5d后调用刷新令牌，则进行刷新认证、刷新令牌。
    // 也就是说如果有后半段时间不访问刷新令牌，则需要重新登录
    let newestRefreshToken: string;
    const spendTime = Math.floor(Date.now() / 1000) - refreshPayload.iat;
    const totalTime = refreshPayload.exp - refreshPayload.iat;
    if (spendTime >= totalTime / 2) {
      newestRefreshToken = await this.createRefreshToken(user);
    }

    const info = {
      accessToken: newestAccessToken,
      refreshToken: newestRefreshToken,
    };
    await this.memoService.updLoginInfo(user.id, info);
    return info;
  }

  /**
   * 创建双令牌
   * @param user
   * @private
   */
  private async createToken(user: UserType) {
    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);
    const refreshPayload = this.jwtService.decode(
      refreshToken
    ) as IRefreshPayload;
    const expire = refreshPayload.exp - refreshPayload.iat;
    // 记录登录状态
    await this.memoService.storageLoginInfo(
      user,
      accessToken,
      refreshToken,
      expire
    );
    return { accessToken, refreshToken, expire };
  }

  /**
   * 创建认证令牌
   * @param user
   * @private
   */
  private async createAccessToken(user: UserType) {
    const payload = {
      userID: user.id,
      email: user.email,
    };
    const jwtOpt: JwtSignOptions = {};
    const token = await this.jwtService.signAsync(payload, jwtOpt);
    return token;
  }

  /**
   * 创建刷新令牌
   * @param user
   * @private
   */
  private async createRefreshToken(user: UserType) {
    const payload = {
      userID: user.id,
    };
    const jwtOpt: JwtSignOptions = {
      expiresIn: this.configService.get("REFRESH_EXPIRE"),
    };
    const token = await this.jwtService.signAsync(payload, jwtOpt);
    return token;
  }

  /**
   * 哈希密码
   * @private
   */
  private hashPWD(pwd: string, salt: string): string {
    const hash = CryptoJS.SHA3(pwd, { outputLength: 256 }).toString();
    const pwdHash = CryptoJS.SHA3(hash + salt, {
      outputLength: 256,
    }).toString();
    return pwdHash;
  }

  /**
   * 临时保存Github用户在Redis
   * @param github
   * @private
   */
  private async tempGithub(github: GithubType) {
    // 存入Redis
  }
}

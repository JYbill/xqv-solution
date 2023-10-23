import { UserDTO, UserLogin, UserRegister, UserType } from "../dto/user.dto";
import { LoginException } from "../exception/global.expectation";
import { UserService } from "../user/user.service";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtSignOptions } from "@nestjs/jwt/dist/interfaces/jwt-module-options.interface";
import CryptoJS from "crypto-js";

/**
 * 哈希化密码函数返回值
 */
type HashPWDFuncType = { salt: string; pwdHash: string };

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
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
    const res = await this.userService.findUserByLogin(user as UserType);
    const pwdHash = this.hashPWD(user.password, res.salt);
    if (res.password !== pwdHash) {
      throw new LoginException();
    }

    const token = await this.createJWT(res);
    return token;
  }

  /**
   * 根据DTO创建Token
   * @param user
   * @param expires 过期时间
   * @private
   */
  private async createJWT(user: UserDTO, expires?: string | number) {
    const payload = {
      userID: user.id,
      email: user.email,
    };
    const jwtOpt: JwtSignOptions = {};
    if (expires) {
      jwtOpt.expiresIn = expires;
    }
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
}

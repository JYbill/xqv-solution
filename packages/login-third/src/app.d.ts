import { RetGotType } from "./global/http-client.provider";

/**
 * @Description: 全局类型文件
 * @Author: 小钦var
 * @Date: 2023/10/24 10:42
 */
declare global {
  interface IEnv {
    URL: string;
    DATABASE_URL: string;
    JWT_SECRET: string; // JWT 密钥
    REDIS_URL: string;
    REDIS_PWD: string;
    REFRESH_EXPIRE: string; // 刷新token
    SESSION_SECRET: string; // session security
    SESSION_KEY: string; // session key

    // GitHub OAuth2.0
    GITHUB_CLIENT_ID: string;
    GITHUB_SECRET: string;
  }

  interface IPayload {
    userID: string;
    email: string;
    iat: number; // 创建时间(s)
    exp: number; // 失效时间(s)
  }

  type IRefreshPayload = Omit<IPayload, "email">;

  /**
   * 扩展Request.user类型
   */
  namespace Express {
    export interface Request {
      user?: IPayload;
      pass?: boolean;
    }
  }

  /**
   * 读取Got(ESM模块)类型声明文件
   */
  type GotType = RetGotType;
}

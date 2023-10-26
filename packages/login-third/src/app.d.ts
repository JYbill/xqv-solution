/**
 * @Description: 全局类型文件
 * @Author: 小钦var
 * @Date: 2023/10/24 10:42
 */
declare interface IEnv {
  URL: string;
  DATABASE_URL: string;
  JWT_SECRET: string; // JWT 密钥
  REDIS_URL: string;
  REDIS_PWD: string;
  REFRESH_EXPIRE: string; // 刷新token
}

declare interface IPayload {
  userID: string;
  email: string;
  iat: number; // 创建时间(s)
  exp: number; // 失效时间(s)
}

declare type IRefreshPayload = Omit<IPayload, "email">;

/**
 * 扩展Request.user类型
 */
declare namespace Express {
  export interface Request {
    user: IPayload | undefined;
  }
}

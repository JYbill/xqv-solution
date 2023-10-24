/**
 * @Description: 全局类型文件
 * @Author: 小钦var
 * @Date: 2023/10/24 10:42
 */
declare interface IEnv {
  URL: string;
  DATABASE_URL: string;
  JWT_SECRET: string; // JWT 密钥
}

declare interface IPayload {
  userID: string;
  email: string;
  iat: number; // 创建时间(s)
  exp: number; // 失效时间(s)
}

/**
 * 扩展Request.user类型
 */
declare namespace Express {
  export interface Request {
    user: IPayload | undefined;
  }
}

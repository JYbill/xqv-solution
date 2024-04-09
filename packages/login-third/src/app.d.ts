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
      github?: UserGithub;
    }
  }

  /**
   * 读取Got(ESM模块)类型声明文件
   */
  type GotType = RetGotType;

  interface UserGithub {
    login: string; // 用户名
    id: number;
    avatar_url: string; // 头像URL
    url: string; // 开发查询地址URL(可直接访问)
    html_url: string; // 首页地址
    followers: number; // 粉丝用户总数
    following: number; // 关注用户总数
    followers_url: string; // 粉丝用户列表URL
    following_url: string; // 关注用户列表URL
    type: string; // 角色类型："User"
    name: string; // 用户名
    company: string; // 公司
    blog: string; // 博客
    location: string; // 地址
    email: string; // 邮箱
    bio: string; // 个人简介
    public_repos: number; // 开放仓库总数
    created_at: string; // 创建日期（日期字符串）
    updated_at: string; // 更新日期
    tokenType: string; // token类型
    accessToken?: string; // 认证令牌
  }
}

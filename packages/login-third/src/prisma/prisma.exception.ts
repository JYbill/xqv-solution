/**
 * @Description: Prisma Module 自定义异常
 * @Author: 小钦var
 * @Date: 2023/10/11 17:33
 */
export class PrismaOptException extends Error {
  constructor() {
    super("Prisma模块配置参数异常");
  }
}

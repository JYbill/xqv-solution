import { HttpException } from "@nestjs/common";

/**
 * 数据库异常类
 */
export class DBExpectation extends HttpException {
  constructor(msg = "查询数据库异常") {
    super(msg, 500);
  }
}

/**
 * 项目异常类
 */
export class ProjectException extends HttpException {}

/**
 * 用户已存在异常
 */
export class UserExistException extends ProjectException {
  constructor() {
    super("用户已存在", 400);
  }
}

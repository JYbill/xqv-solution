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
 * 数据库不存在对应数据异常
 */
export class NOExistException extends HttpException {
  constructor(msg = "DB不存在数据") {
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

export class ParamsMissedException extends ProjectException {
  constructor(msg = "参数缺失") {
    super(msg, 400);
  }
}

export class ParamsErrorException extends ProjectException {
  constructor(msg = "参数错误") {
    super(msg, 400);
  }
}

/**
 * 登录异常
 */
export class LoginException extends ProjectException {
  constructor(msg = "账号密码不正确") {
    super(msg, 400);
  }
}

import { HttpException } from "@nestjs/common";

/**
 * 数据库异常类
 */
export class DBExpectation extends HttpException {
  constructor(msg = "查询数据库异常") {
    super(msg, 500);
  }
}

import { ResponseUtil } from "../util/response.util";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

/**
 * @Description: 全局异常处理器
 * @Author: 小钦var
 * @Date: 2023/10/12 10:42
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter<HttpException> {
  private readonly logger: Logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    this.logger.error(exception);
    try {
      // 正常业务代码抛出的异常
      const status = exception.getStatus();
      response.status(status).json(ResponseUtil.error(undefined, status));
    } catch (err: unknown) {
      const error = err as Error;
      // 代码错误
      this.logger.error(error);
      response.status(500).json(ResponseUtil.error(undefined, 500));
    }
  }
}

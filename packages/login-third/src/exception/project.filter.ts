import { ResponseUtil } from "../util/response.util";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

import { ProjectException } from "./global.expectation";

/**
 * @Description: 业务异常处理器
 * @Author: 小钦var
 * @Date: 2023/10/12 10:42
 */
@Catch(ProjectException)
export class ProjectExceptionFilter implements ExceptionFilter<HttpException> {
  private readonly logger: Logger = new Logger(ProjectExceptionFilter.name);

  catch(exception: ProjectException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    request.pass = false;
    this.logger.error(exception.message);
    const status = exception.getStatus();
    response.status(status).json(ResponseUtil.error(exception.message, status));
  }
}

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import process from "process";

import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./exception/global.exception";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = "";

  // 全局配置
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();

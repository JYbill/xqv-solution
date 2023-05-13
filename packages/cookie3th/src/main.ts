/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as fs from "fs";
import { resolve } from "node:path";

import { AppModule } from "./app/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: fs.readFileSync(resolve(__dirname, "assets/ssl/ssl-key.pem")),
      cert: fs.readFileSync(resolve(__dirname, "assets/ssl/ssl.pem")),
    },
  });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: https://localhost:${port}`);
}

bootstrap();

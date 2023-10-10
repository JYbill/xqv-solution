import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import process from "process";
import * as timers from "timers";

import { AuthModule } from "./auth/auth.module";
import { IPrismaModule } from "./prisma/prisma.builder";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    PrismaModule.forRootAsync({
      useFactory: (): IPrismaModule => {
        return {
          isGlobal: true,
          async prismaOptFactory(): Promise<Prisma.PrismaClientOptions> {
            const prismaOption: Prisma.PrismaClientOptions = {};
            if (process.env["NODE_ENV"] === "development") {
              prismaOption.log = ["query", "info", "warn", "error"];
            }
            return prismaOption;
          },
        };
      },
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

/**
 * @Description: PrismaClient服务
 * @Author: 小钦var
 * @Date: 2023/10/9 17:07
 */
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

import { PRISMA_MODULE_INJECT_ID } from "./prisma.builder";

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit
{
  constructor(
    @Inject(PRISMA_MODULE_INJECT_ID)
    private readonly opt: Prisma.PrismaClientOptions
  ) {
    // console.log("debug prisma", opt); // debug
    super(opt);
  }

  async onModuleInit() {
    await this.$connect();
  }
}

/**
 * @Description: PrismaClient服务
 * @Author: 小钦var
 * @Date: 2023/10/9 17:07
 */
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

import {
  OptionType,
  PRISMA_MODULE_INJECT_ID,
  PRISMA_OTHER_OPT_INJECT_ID,
} from "./prisma.builder";

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(
    @Inject(PRISMA_MODULE_INJECT_ID)
    private readonly prismaOpt: Prisma.PrismaClientOptions,
    @Inject(PRISMA_OTHER_OPT_INJECT_ID)
    private readonly opt: OptionType
  ) {
    super(prismaOpt);

    // debug详细内容
    if (opt.debugging) {
      this.$on("query", (event: Prisma.QueryEvent) => {
        const date = new Date(event.timestamp);
        this.logger.debug("请求时间: ", date.toLocaleTimeString());
        this.logger.debug("耗时: ", event.duration + "ms");
        this.logger.debug("DB SQL: ", event.query);
        if (!event.target.includes("mongodb")) {
          this.logger.debug("SQL 参数: ", event.params);
        }
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }
}

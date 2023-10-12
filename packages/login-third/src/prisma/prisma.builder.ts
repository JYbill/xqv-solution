import { ConfigurableModuleBuilder } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

/**
 * PrismaModule 配置接口
 */
export interface IPrismaModule {
  isGlobal?: boolean;
  debugging?: boolean; // debug模式，默认false
  prismaOption?: Prisma.PrismaClientOptions; // 同步时使用
  prismaOptFactory?: (
    ...args: (string | number | boolean)[]
  ) => Prisma.PrismaClientOptions | Promise<Prisma.PrismaClientOptions>; // 异步或同步使用
}

export type OptionType = Omit<
  IPrismaModule,
  "isGlobal" | "prismaOption" | "prismaOptFactory"
>;

/**
 * 模块构建器
 */
export const { ConfigurableModuleClass, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<IPrismaModule>()
    .setClassMethodName("forRoot")
    .build();

/**
 * Inject ID
 */
export const PRISMA_MODULE_INJECT_ID = "PRISMA_MODULE_INJECT_ID";
export const PRISMA_OTHER_OPT_INJECT_ID = "PRISMA_OTHER_OPT_INJECT_ID";

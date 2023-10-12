import { Logger, Module } from "@nestjs/common";
import type { DynamicModule } from "@nestjs/common";

import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  IPrismaModule,
  OPTIONS_TYPE,
  PRISMA_MODULE_INJECT_ID,
  PRISMA_OTHER_OPT_INJECT_ID,
} from "./prisma.builder";
import { PrismaOptException } from "./prisma.exception";
import { PrismaService } from "./prisma.service";

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule extends ConfigurableModuleClass {
  private static readonly logger = new Logger("PrismaModule");

  /**
   * 同步注入配置实例
   * @param opt
   */
  static forRoot(opt: typeof OPTIONS_TYPE): DynamicModule {
    PrismaModule.initDefault(opt);
    const { isGlobal, prismaOption, prismaOptFactory, ...otherOpt } = opt;

    if (!prismaOption) {
      PrismaModule.logger.error(
        "Prisma Module forRoot 必须使用prismaOption工厂函数进行配置"
      );
      throw new PrismaOptException();
    }

    const module = {
      global: isGlobal,
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_MODULE_INJECT_ID,
          useValue: prismaOption,
        },
        {
          provide: PRISMA_OTHER_OPT_INJECT_ID,
          useValue: otherOpt,
        },
      ],
    };
    return module;
  }

  /**
   * 异步注入配置实例
   * @param opt
   */
  static forRootAsync(opt: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const moduleOpt = opt.useFactory() as IPrismaModule;
    PrismaModule.initDefault(moduleOpt);
    const { isGlobal, prismaOptFactory, prismaOption, ...otherOpt } = moduleOpt;

    if (!moduleOpt.prismaOptFactory) {
      PrismaModule.logger.error(
        "Prisma Module forRootAsync 必须使用prismaOptFactory工厂函数进行配置"
      );
      throw new PrismaOptException();
    }

    return {
      global: isGlobal,
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_MODULE_INJECT_ID,
          useFactory: prismaOptFactory,
        },
        {
          provide: PRISMA_OTHER_OPT_INJECT_ID,
          useValue: otherOpt,
        },
      ],
    };
  }

  private static initDefault(config: IPrismaModule) {
    // 为null ｜ undefined进行初始化
    config.isGlobal ??= true;
    config.debugging ??= false;
  }

  async getName() {
    return "PrismaModule";
  }
}

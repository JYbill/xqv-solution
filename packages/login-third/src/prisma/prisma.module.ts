import { Module } from "@nestjs/common";
import type { DynamicModule } from "@nestjs/common";

import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  IPrismaModule,
  OPTIONS_TYPE,
  PRISMA_MODULE_INJECT_ID,
} from "./prisma.builder";
import { PrismaService } from "./prisma.service";

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule extends ConfigurableModuleClass {
  /**
   * 同步注入配置实例
   * @param opt
   */
  static forRoot(opt: typeof OPTIONS_TYPE): DynamicModule {
    const module = {
      global: opt.isGlobal,
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_MODULE_INJECT_ID,
          useValue: opt.prismaOption,
        },
      ],
    };
    return module;
  }

  static forRootAsync(opt: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const moduleOpt = opt.useFactory() as IPrismaModule;

    return {
      global: moduleOpt.isGlobal,
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_MODULE_INJECT_ID,
          useValue: moduleOpt.prismaOptFactory(),
        },
      ],
    };
  }

  async getName() {
    return "PrismaModule";
  }
}

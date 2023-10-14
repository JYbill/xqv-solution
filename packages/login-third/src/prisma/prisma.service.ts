/**
 * @Description: PrismaClient服务
 * @Author: 小钦var
 * @Date: 2023/10/9 17:07
 */
import { DBExpectation } from "../exception/global.expectation";
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import {
  OptionType,
  PRISMA_MODULE_INJECT_ID,
  PRISMA_OTHER_OPT_INJECT_ID,
} from "./prisma.builder";

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private $customExtends: ReturnType<typeof extendsFactory>;

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

  get $GlobalExt() {
    if (!this.$customExtends) {
      this.$customExtends = extendsFactory(this);
    }
    return this.$customExtends;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Prisma Connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Prisma Disconnected");
  }
}

/**
 * 扩展Prisma $extends 工厂函数
 * @param prisma
 */
function extendsFactory(prisma: PrismaService) {
  const $extends = prisma.$extends({
    name: "GlobalExtends",
    model: {
      $allModels: {
        /**
         * 根据条件查询是否存在
         */
        async exit<Module>(
          this: Module,
          where: Prisma.Args<Module, "findFirst">["where"]
        ): Promise<boolean> {
          const context = Prisma.getExtensionContext(this) as Module;
          const data = await context["findFirst"]({
            where,
            select: { id: true },
          });
          return !!data;
        },

        /**
         * 对象排除
         * @param payload
         * @param keys
         */
        exclude<T, Key extends keyof T>(payload: T, keys: Key[]): Omit<T, Key> {
          for (const key of keys) {
            delete payload[key];
          }
          return payload;
        },

        /**
         * 数组排除
         * @param payloadList
         * @param keys
         */
        excludeAll<T, Key extends keyof T>(
          payloadList: T[],
          keys: Key[]
        ): Omit<T, Key>[] {
          for (const payload of payloadList) {
            for (const key of keys) {
              delete payload[key];
            }
          }
          return payloadList;
        },
      },
    },
    query: {
      $allModels: {
        /**
         * 自定义Prisma异常
         * @param args
         * @param query
         */
        async $allOperations({ args, query }) {
          try {
            return await query(args);
          } catch (err) {
            const error = err as Error;
            if (error instanceof PrismaClientKnownRequestError) {
              throw new DBExpectation(error.message);
            }
          }
        },
      },
      user: {
        /**
         * 所有用户的返回值，都将"password"字段混淆
         * @param args
         * @param query
         */
        async $allOperations<T>(this: T, { args, query }) {
          const res = (await query(args)) as T;

          if (!res) return res;
          else if (Array.isArray(res)) {
            return res.map((user) => {
              user.password = "**********";
            });
          }
          res["password"] = "**********";
          return res;
        },
      },
    },
  });
  return $extends;
}

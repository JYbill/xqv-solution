/**
 * @Description: Config Module 校验配置变量
 * @Author: 小钦var
 * @Date: 2023/10/12 10:29
 */
import { Expose, plainToInstance } from "class-transformer";
import { IsString, validateSync } from "class-validator";

class EnvConfig implements IEnv {
  @Expose()
  @IsString()
  DATABASE_URL: string;

  @Expose()
  @IsString()
  JWT_SECRET: string;

  @Expose()
  @IsString()
  URL: string;

  @Expose()
  @IsString()
  REDIS_PWD: string;

  @Expose()
  @IsString()
  REDIS_URL: string;

  @Expose()
  @IsString()
  REFRESH_EXPIRE: string;

  @Expose()
  @IsString()
  SESSION_KEY: string;

  @Expose()
  @IsString()
  SESSION_SECRET: string;
}

export function validateConfig(config: Record<string, unknown>) {
  // 字面量对象 -> class，开启隐式转换
  const validatedConfig = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
  // 跳过未定义的属性
  const errors = validateSync(validatedConfig, { skipMissingProperties: true });
  if (errors.length > 0) {
    console.log(errors);
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

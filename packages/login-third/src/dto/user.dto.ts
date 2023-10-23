import { IsObjectID } from "../validator/id.validate";
import { OmitType, PickType } from "@nestjs/mapped-types";
import type { User } from "@prisma/client";
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * User类型
 */
export type UserType = User;

/**
 * 校验类：User完整的校验类
 */
export class UserDTO implements UserType {
  @IsObjectID()
  id: string;

  @IsNumber()
  age: number | null;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @MinLength(5, {
    message: "account is too short",
  })
  @MaxLength(15, {
    message: "account is too long",
  })
  account: string;

  @IsString()
  salt: string;
}

/**
 * 校验类：User注册
 */
export class UserRegister extends OmitType(UserDTO, ["id", "salt"] as const) {}

/**
 * 校验类：用户登录
 */
export class UserLogin extends PickType(UserDTO, [
  "account",
  "email",
  "password",
] as const) {
  @IsOptional()
  @IsString()
  account: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsString()
  password: string;
}

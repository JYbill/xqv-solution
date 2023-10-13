import { IsObjectID } from "../validator/id.validate";
import { OmitType } from "@nestjs/mapped-types";
import type { Prisma } from "@prisma/client";
import { IsEmail, IsInt, IsNumber, IsString } from "class-validator";

/**
 * User 完整类型
 */
export type User = Required<Prisma.UserCreateInput>;

export class UserDTO implements User {
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

  @IsString()
  account: string;
}

/**
 * User注册DTO
 */
export class UserRegister extends OmitType(UserDTO, [
  "id",
  "account",
] as const) {}

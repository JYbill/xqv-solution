import { IsObjectID } from "../validator/id.validate";
import { OmitType } from "@nestjs/mapped-types";
import type { User } from "@prisma/client";
import { IsEmail, IsInt, IsNumber, IsString } from "class-validator";

/**
 * User 完整类型
 */
export type UserType = User;

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

  @IsString()
  account: string;
}

/**
 * User注册DTO
 */
export class UserRegister extends OmitType(UserDTO, ["id"] as const) {}

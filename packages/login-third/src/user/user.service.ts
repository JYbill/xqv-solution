import { UserType } from "../dto/user.dto";
import {
  NOExistException,
  ParamsMissedException,
  UserExistException,
} from "../exception/global.expectation";
import { PrismaService } from "../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  /**
   * 获取所有用户
   */
  async findAll() {
    return this.prismaService.$GlobalExt.user.findMany({});
  }

  /**
   * 创建唯一用户
   * @param user
   */
  async createUser(user: UserType) {
    if (!user.email) {
      throw new ParamsMissedException();
    }
    const exist = await this.prismaService.$GlobalExt.user.exit({
      email: user.email,
    });
    if (exist) {
      throw new UserExistException();
    }
    return this.insertUser(user);
  }

  /**
   * 账号/邮箱登录
   * @param user
   */
  async findUserByLogin(user: UserType) {
    const whereQuery: Prisma.UserFindFirstArgs["where"] = {};
    if (user.email) {
      whereQuery["email"] = user.email;
    } else if (user.account) {
      whereQuery["account"] = user.account;
    } else {
      throw new ParamsMissedException("未填入账号或邮箱错误!");
    }

    const res = await this.prismaService.$GlobalExt.user.findUserWithPWD(
      whereQuery
    );

    if (!res) {
      throw new NOExistException();
    }
    return res;
  }

  /**
   * 更新用户通过ID
   * @param id uid
   * @param user
   */
  async updUserById(id: string, user: UserType) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: user,
    });
  }

  /**
   * 新增用户
   * @param user
   */
  async insertUser(user: UserType) {
    return this.prismaService.$GlobalExt.user.create({
      data: user,
    });
  }

  /**
   * 删除单个用户
   * @param uid
   */
  async delUserByID(uid: string) {
    return this.prismaService.$GlobalExt.user.delete({
      where: {
        id: uid,
      },
    });
  }
}

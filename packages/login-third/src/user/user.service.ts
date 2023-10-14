import { UserRegister } from "../dto/user.dto";
import { UserExistException } from "../exception/global.expectation";
import { PrismaService } from "../prisma/prisma.service";
import { Injectable, Scope } from "@nestjs/common";
import type { User } from "@prisma/client";

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
   * 创建用户
   * @param user
   */
  async createUser(user: UserRegister) {
    const exist = await this.prismaService.$GlobalExt.user.exit({
      email: user.email,
    });
    if (exist) {
      throw new UserExistException();
    }
    return this.insertUser(user);
  }

  /**
   * 更新用户通过ID
   * @param id uid
   * @param user
   */
  async updUserById(id: string, user: Partial<User>) {
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
  async insertUser(user: UserRegister) {
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

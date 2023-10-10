import { PrismaService } from "../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { User } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  /**
   * 获取所有用户
   */
  async findAll() {
    return this.prismaService.user.findMany({});
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
  async insertUser(user: Omit<User, "id">) {
    return this.prismaService.user.create({
      data: user,
    });
  }

  /**
   * 删除单个用户
   * @param uid
   */
  async delUserByID(uid: string) {
    return this.prismaService.user.delete({
      where: {
        id: uid,
      },
    });
  }
}

import { UserRegister } from "../dto/user.dto";
import { UserService } from "../user/user.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  /**
   * 注册用户
   * @param user
   */
  async registerUser(user: UserRegister) {
    const res = await this.userService.createUser(user);
    return res;
  }
}

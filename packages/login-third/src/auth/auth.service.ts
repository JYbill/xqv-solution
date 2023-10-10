import { UserService } from "../user/user.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOne(username);
    if (!user) return null;

    const valid = await this.usersService.validatePassword(password, user.password);
    if (!valid) return null;

    return user;
  }

  async login(user: any) {
    if (!user) throw new UnauthorizedException();
    const payload = { username: user.username, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(data: { username: string; password: string; group: string }) {
    return this.usersService.create(data);
  }
}
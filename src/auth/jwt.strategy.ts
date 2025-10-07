import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret',
    });
  }
  async validate(payload: any) {
    console.log('JWT payload:', payload);
    const user = await this.usersService.findOne(payload.username);
    console.log('Fetched user:', user);
    if (!user) return null;
  
    const userPermissions = await this.usersService.getUserPermissions(user.id);
    console.log('Permissions:', userPermissions);
  
    return {
      id: user.id,
      username: user.username,
      roles: user.roles.map(r => r.role.name),
      permissions: userPermissions.map(p => p.name),
    };
  }
}
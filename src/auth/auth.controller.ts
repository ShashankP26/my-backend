import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Permissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';

// @UseGuards(AuthGuard('jwt')) // JWT guard applied globally
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Publicly accessible register
  @Post('register')
  @Public()
  async register(@Body() body: { username: string; password: string; role: string }) {
    return this.authService.register(body);
  }

  // Publicly accessible login
  @Post('login')
  @Public()
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }

  // Protected profile (JWT required by default)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // Role-based route
  @UseGuards(RolesGuard)
  @Get('admin')
  @Roles('admin')
  getAdminData() {
    return { message: 'Hello Admin!' };
  }

  // Permission-based route
  @UseGuards(PermissionsGuard)
  @Get('manage-users')
  @Permissions('user:read')
  getUsers() {
    return { message: 'User read permission granted!' };
  }

  @UseGuards(PermissionsGuard)
  @Post('create-user')
  @Permissions('user:create')
  createUser() {
    return { message: 'User create permission granted!' };
  }
  // Only users with "reports:view" permission can access
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get('reports')
  @Permissions('reports:view')
  getReports() {
    return { message: 'Here are the Xpredict Labs reports ' };
  }
}





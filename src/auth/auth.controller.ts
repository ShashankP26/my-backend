import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { GroupPermissionsGuard } from './GroupPermissions.guard';
import { GroupPermissions } from './GroupPermissions.decorator';
import { GroupsGuard } from './Groups.guard';
import { Groups } from './Groups.decorator';



@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ------------------------------------------------------------
  // PUBLIC ROUTES
  // ------------------------------------------------------------

  @Post('register')
  @Public()
  async register(
    @Body()
    body: {
      username: string;
      password: string;
      group: string; // 👉 lowercase to match your schema
    },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  @Public()
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }

  // ------------------------------------------------------------
  // PROTECTED ROUTES
  // ------------------------------------------------------------

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // ------------------------------------------------------------
  // GROUP-BASED ACCESS
  // ------------------------------------------------------------

  @UseGuards(GroupsGuard)
  @Get('admin')
  @Groups('admin') // 👈 must match group.name in DB
  getAdminData() {
    return { message: 'Hello Admin!' };
  }

  // ------------------------------------------------------------
  // GROUP PERMISSION–BASED ACCESS
  // ------------------------------------------------------------

  @UseGuards(GroupPermissionsGuard)
  @Get('manage-users')
  @GroupPermissions('user:read')
  getUsers() {
    return { message: 'User read permission granted!' };
  }

  @UseGuards(GroupPermissionsGuard)
  @Post('create-user')
  @GroupPermissions('user:create')
  createUser() {
    return { message: 'User create permission granted!' };
  }

  @UseGuards(AuthGuard('jwt'), GroupPermissionsGuard)
  @Get('reports')
  @GroupPermissions('reports:view')
  getReports() {
    return { message: 'Here are the Xpredict Labs reports' };
  }
}
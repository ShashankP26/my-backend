import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @Roles('admin')
  getAdminDashboard() {
    return { message: 'Welcome Admin!' };
  }

  @Get('manager')
  @Roles('admin', 'manager')
  getManagerDashboard() {
    return { message: 'Welcome Manager or Admin!' };
  }
}
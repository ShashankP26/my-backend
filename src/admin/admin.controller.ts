import { Controller, Get } from '@nestjs/common';
import { Groups } from '../auth/Groups.decorator';

@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @Groups('admin')
  getAdminDashboard() {
    return { message: 'Welcome Admin!' };
  }

  @Get('manager')
  @Groups('admin', 'manager')
  getManagerDashboard() {
    return { message: 'Welcome Manager or Admin!' };
  }
}
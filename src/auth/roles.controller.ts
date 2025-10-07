import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('admin:access')
  createRole(@Body('name') name: string) {
    return this.rolesService.createRole(name);
  }

  @Post('permission')
  @Permissions('admin:access')
  createPermission(@Body('name') name: string) {
    return this.rolesService.createPermission(name);
  }

  @Post(':roleId/permission/:permissionId')
  @Permissions('admin:access')
  assignPermissionToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rolesService.assignPermissionToRole(roleId, permissionId);
  }

  @Post('assign/:userId/:roleId')
  @Permissions('admin:access')
  assignRoleToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }

  @Get()
  @Permissions('admin:access')
  getRoles() {
    return this.rolesService.getRoles();
  }

  @Get('users')
  @Permissions('admin:access')
  getUsers() {
    return this.rolesService.getUsers();
  }
}
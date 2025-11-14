import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';

import { GroupPermissions } from './GroupPermissions.decorator';
import { GroupPermissionsGuard } from './GroupPermissions.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('Groups')
@UseGuards(JwtAuthGuard, GroupPermissionsGuard)
export class GroupsController {
  constructor(private readonly GroupsService: GroupsService) {}

  @Post()
  @GroupPermissions('admin:access')
  createGroup(@Body('name') name: string) {
    return this.GroupsService.createGroup(name);
  }

  @Post('GroupPermission')
  @GroupPermissions('admin:access')
  createGroupPermission(@Body('name') name: string) {
    return this.GroupsService.createGroupPermission(name);
  }

  @Post(':GroupId/GroupPermission/:GroupgroupPermissionId')
  @GroupPermissions('admin:access')
  assignGroupPermissionToGroup(
    @Param('GroupId', ParseIntPipe) GroupId: number,
    @Param('GroupgroupPermissionId', ParseIntPipe) GroupgroupPermissionId: number,
  ) {
    return this.GroupsService.assignGroupPermissionToGroup(GroupId, GroupgroupPermissionId);
  }

  @Post('assign/:userId/:GroupId')
  @GroupPermissions('admin:access')
  assignGroupToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('GroupId', ParseIntPipe) GroupId: number,
  ) {
    return this.GroupsService.assignGroupToUser(userId, GroupId);
  }

  @Get()
  @GroupPermissions('admin:access')
  getGroups() {
    return this.GroupsService.getGroups();
  }

  @Get('users')
  @GroupPermissions('admin:access')
  getUsers() {
    return this.GroupsService.getUsers();
  }
}
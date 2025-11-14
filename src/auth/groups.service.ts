// src/auth/groups.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async createGroup(name: string) {
    return this.prisma.createGroupAuto({ name });
  }

  async createGroupPermission(name: string) {
    return this.prisma.groupPermission.create({
      data: { name },
    });
  }

  async assignGroupPermissionToGroup(groupId: number, permissionId: number) {
    return this.prisma.groupJunction.create({
      data: {
        groupId,
        GroupPermissionId: permissionId, // <-- CORRECT name from schema
      },
    });
  }

  async assignGroupToUser(userId: number, groupId: number) {
    return this.prisma.userGroup.create({
      data: { userId, groupId },
    });
  }

  async getGroups() {
    return this.prisma.group.findMany({
      include: {
        GroupPermissions: {
          include: {
            GroupPermission: true, // <-- correct relation name from schema
          },
        },
      },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        groups: {
          include: {
            group: true,
          },
        },
      },
    });
  }
}
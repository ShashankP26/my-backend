import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(name: string) {
    const count = await this.prisma.role.count();
    const newId = 2 ** count; // 2^0 = 1, 2^1 = 2, 2^2 = 4 ...
  
    return this.prisma.role.create({
      data: {
        id: newId,
        name,
      },
    });
  }y

  // Create new permission
  async createPermission(name: string) {
    return this.prisma.permission.create({ data: { name } });
  }

  // Assign permission to role
  async assignPermissionToRole(roleId: number, permissionId: number) {
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  // Assign role to user
  async assignRoleToUser(userId: number, roleId: number) {
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  // Get all roles with permissions
  async getRoles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
  }

  // Get all users with roles
  async getUsers() {
    return this.prisma.user.findMany({
      include: { roles: { include: { role: true } } },
    });
  }
}
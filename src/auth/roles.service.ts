import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(name: string) {
    const isAdmin = name.toLowerCase() === 'admin';

    // 🧮 Count all roles except admin
    const normalRolesCount = await this.prisma.role.count({
      where: { name: { not: 'admin' } },
    });

    if (isAdmin) {
      // 🔑 Create admin role with full mask
      const fullMask = (2 ** normalRolesCount) - 1;

      return this.prisma.role.create({
        data: {
          name,
          un: fullMask, // 👈 replacing bitValue
        },
      });
    }

    // ⚡ For normal roles — assign next power of 2
    const newUn = 2 ** normalRolesCount;

    const newRole = await this.prisma.role.create({
      data: {
        name,
        un: newUn,
      },
    });

    // 🔁 After adding new role, auto-update admin
    await this.updateAdminUn();

    return newRole;
  }

  // 🧩 Helper: update admin's "un" dynamically
  private async updateAdminUn() {
    const normalRolesCount = await this.prisma.role.count({
      where: { name: { not: 'admin' } },
    });

    const newAdminUn = (2 ** normalRolesCount) - 1;

    const admin = await this.prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (admin) {
      await this.prisma.role.update({
        where: { name: 'admin' },
        data: { un: newAdminUn },
      });

      console.log(`✅ Admin un updated → ${newAdminUn}`);
    } else {
      console.log(`⚠️ Admin role not found — skipping update.`);
    }
  }

  // 🧱 (Optional) other helper functions for permissions & users
  async createPermission(name: string) {
    return this.prisma.permission.create({ data: { name } });
  }

  async assignPermissionToRole(roleId: number, permissionId: number) {
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async assignRoleToUser(userId: number, roleId: number) {
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async getRoles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      include: { roles: { include: { role: true } } },
    });
  }
}
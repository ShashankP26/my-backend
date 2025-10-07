import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Create a user and assign role
  async create(data: { username: string; password: string; role: string }) {
    const role = await this.prisma.role.findUnique({ where: { name: data.role } });
    if (!role) throw new Error(`Role ${data.role} does not exist`);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        roles: { create: { roleId: role.id } },
      },
      include: { roles: { include: { role: true } } },
    });
  }

  // Find user by username
  async findOne(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        roles: {
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    });
  }

  // Validate password
  async validatePassword(input: string, storedHash: string) {
    return bcrypt.compare(input, storedHash);
  }

  // ✅ Implement this
  async getUserPermissions(userId: number) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    const permsSet = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        permsSet.add(rp.permission.name);
      }
    }

    return Array.from(permsSet).map(name => ({ name }));
  }
}
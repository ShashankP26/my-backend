// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { username: string; password: string; group: string }) {
    const group = await this.prisma.group.findUnique({ where: { name: data.group } });
    if (!group) throw new Error(`Group ${data.group} does not exist`);

    const hashed = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        username: data.username,
        password: hashed,
        userGroups: { create: { groupId: group.id } },
      },
      include: { userGroups: { include: { group: true } } },
    });
  }

  async findOne(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        userGroups: {
          include: {
            group: {
              include: {
                groupPermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
  }

  async validatePassword(input: string, storedHash: string) {
    return bcrypt.compare(input, storedHash);
  }

  async getUserGroupPermissions(userId: number) {
    const userGroups = await this.prisma.userGroup.findMany({
      where: { userId },
      include: { group: { include: { groupPermissions: { include: { permission: true } } } } },
    });

    const set = new Set<string>();
    for (const ug of userGroups) {
      for (const gj of ug.group.groupPermissions) {
        set.add(gj.permission.name);
      }
    }
    return Array.from(set).map((name) => ({ name }));
  }
}
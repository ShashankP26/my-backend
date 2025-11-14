// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Auto Bitmask Group Creator
   * Called manually instead of Prisma.group.create()
   */
  async createGroupAuto(data: { name: string }) {
    const name = data.name.toLowerCase();

    // 🧮 Count ALL normal groups (admin excluded)
    const normalCount = await this.group.count({
      where: { name: { not: 'admin' } },
    });

    // 👑 Admin group → full mask
    if (name === 'admin') {
      const fullMask = (2 ** normalCount) - 1;
      return this.group.create({
        data: {
          name: data.name,
          un: fullMask,
          super_un: -1,
        },
      });
    }

    // 👤 Normal group → assign next bit automatically
    const newGroup = await this.group.create({
      data: {
        name: data.name,
        un: 2 ** normalCount,
        super_un: null,
      },
    });

    // 🔄 Update admin's mask after adding a new group
    await this.updateAdminMask();

    return newGroup;
  }

  private async updateAdminMask() {
    const normalCount = await this.group.count({
      where: { name: { not: 'admin' } },
    });

    const adminMask = (2 ** normalCount) - 1;

    await this.group.updateMany({
      where: { name: 'admin' },
      data: { un: adminMask },
    });
  }
}
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    // ✅ Auto-assign 'un' when creating a Role
    this.registerRoleMiddleware();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // 🧠 Define middleware setup in its own method for clarity
  private registerRoleMiddleware() {
    // @ts-ignore (for older Prisma versions missing type declarations)
    this.$use(async (params, next) => {
      if (params.model === 'Role' && params.action === 'create') {
        const name = params.args.data.name?.toLowerCase();

        // Count all roles except admin
        const existingRoles = await this.role.findMany({
          where: { name: { not: 'admin' } },
        });
        const count = existingRoles.length;

        // Assign the unique bitmask automatically
        if (name === 'admin') {
          params.args.data.un = (2 ** count) - 1; // Admin covers all roles
        } else {
          params.args.data.un = 2 ** count; // e.g., 1, 2, 4, 8, ...
        }
      }

      return next(params);
    });
  }
}
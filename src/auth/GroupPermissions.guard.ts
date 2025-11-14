import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from 'src/prisma/prisma.service';
import { GROUP_PERMISSIONS_KEY } from './GroupPermissions.decorator';

@Injectable()
export class GroupPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(GROUP_PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('Not authenticated');

    // fetch from DB to be safe
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { userGroups: { include: { group: { include: { groupPermissions: { include: { permission: true } } } } } } },
    });

    if (!dbUser) throw new ForbiddenException('No user found');
    const perms = new Set<string>();
    for (const ug of dbUser.userGroups) {
      for (const gj of ug.group.groupPermissions) {
        perms.add(gj.permission.name);
      }
    }

    const ok = required.every((p) => perms.has(p));
    if (!ok) throw new ForbiddenException('You do not have required permissions');
    return true;
  }
}
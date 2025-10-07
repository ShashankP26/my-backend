import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { PERMISSIONS_KEY } from './permissions.decorator';
  import { PrismaService } from 'src/prisma/prisma.service';
  
  @Injectable()
  export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector, private prisma: PrismaService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const requiredPermissions =
        this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
  
      if (!requiredPermissions) return true; // route doesn’t require special permission
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user) throw new ForbiddenException('Not authenticated');
  
      // 🔑 Fetch user roles + permissions from DB
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
        },
      });
  
      if (!dbUser || !dbUser.roles.length) throw new ForbiddenException('No role assigned');
  
      // Flatten all permissions from all roles
      const userPermissions = dbUser.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => rp.permission.name),
      );
  
      const hasPermission = requiredPermissions.every((perm) =>
        userPermissions.includes(perm),
      );
  
      if (!hasPermission) throw new ForbiddenException('You do not have permission');
  
      return true;
    }
  }
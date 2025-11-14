import { SetMetadata } from '@nestjs/common';
export const GROUP_PERMISSIONS_KEY = 'group_permissions';
export const GroupPermissions = (...perms: string[]) => SetMetadata(GROUP_PERMISSIONS_KEY, perms);
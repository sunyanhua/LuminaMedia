import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY, RequiredPermission } from '../guards/permissions.guard';

export const Permissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
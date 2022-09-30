import { SetMetadata } from '@nestjs/common';

export const Permission = (permission) => SetMetadata('permission', permission);

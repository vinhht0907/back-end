import { Global, Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionSchema } from '@/modules/permission/permission.schema';
import { IsPermissionAlreadyExist } from '@/modules/permission/dto/validation/is-permission-already-exist';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Permission', schema: PermissionSchema, collection: 'permissions' },
    ]),
  ],
  controllers: [PermissionController],
  providers: [PermissionService, IsPermissionAlreadyExist],
  exports: [PermissionService]
})
export class PermissionModule {}

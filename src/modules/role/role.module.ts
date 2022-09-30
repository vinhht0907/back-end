import { Global, Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleSchema } from '@/modules/role/role.schema';
import { RoleController } from './role.controller';
import { IsRoleAlreadyExist } from '@/modules/role/dto/validation/is-role-already-exist';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Role', schema: RoleSchema }]),
  ],
  providers: [RoleService, IsRoleAlreadyExist],
  exports: [RoleService],
  controllers: [RoleController]
})
export class RoleModule {}

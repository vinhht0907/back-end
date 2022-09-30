import { forwardRef, Module } from '@nestjs/common';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';
import {MongooseModule} from "@nestjs/mongoose";
import {ResourceSchema} from "@/modules/resource/resource.schema";
import {IsResourceAlreadyExist} from "@/modules/resource/dto/validate/is-resource-already-exist";
import { TopicModule } from '@/modules/topic/topic.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Resource', schema: ResourceSchema, collection: 'resources' },
    ]),
    forwardRef(() => TopicModule)
  ],
  controllers: [ResourceController],
  providers: [ResourceService, IsResourceAlreadyExist],
  exports: [ResourceService]
})
export class ResourceModule {}

import { Injectable } from '@nestjs/common';
import { MulterOptionsFactory, MulterModuleOptions } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MulterS3BundleConfig implements MulterOptionsFactory {
  constructor(private configService: ConfigService) {
  }

  createMulterOptions(): MulterModuleOptions {
    const s3 = new AWS.S3({
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      region: this.configService.get<string>('AWS_DEFAULT_REGION'),
    })
    const generateKey = (originalname, data) => {
      const patt = /\.[0-9a-z]+$/i;
      const fileExtension = originalname.match(patt)[0];
      const prePath = `${fileExtension.includes('apk') ? 'android' : 'ios'}/${data.bundle_id}`;
      const fileName = `${originalname.replace(fileExtension, '')}_${data.version}${fileExtension}`
      return `app/${prePath}/${fileName}`
    }
    return {
      storage: multerS3({
        acl: 'public-read',
        s3,
        bucket: this.configService.get<string>('AWS_BUCKET'),
        key(req, file, cb) {
          cb(null, generateKey(file.originalname, req.body))
        },
      })
    };
  }
}

import { Injectable, Req, Res } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { CustomLogger } from '@/common/logger/custom-logger';
import { UsersService } from '@/modules/users/users.service';
import ImageSizes from './image-sizes';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media } from '@/modules/media/media.interface';
import { ConfigService } from '@nestjs/config';
import { encode } from 'blurhash';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

const s3 = new AWS.S3();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const imageFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
};

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/msword' ||
    file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/vnd.ms-powerpoint' ||
    file.mimetype ===
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type, only DOC, DOCX, PDF, PPT, PPTX, XLS and XLSX is allowed!',
      ),
      false,
    );
  }
};

@Injectable()
export class MediaService {
  constructor(
    @InjectModel('Media') private mediaModel: Model<Media>,
    private logService: CustomLogger,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    AWS.config.update({
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      region: process.env.AWS_DEFAULT_REGION,
    });
  }

  async uploadSingleImage(@Req() req, @Res() res) {
    try {
      this.uploadImage(req, res, function(error) {
        if (error) {
          this.logService.error({
            name: 'uploadSingleImage',
            error,
          });
          return res.status(404).json(`Failed to upload image file`);
        }
        return res.status(201).json({
          filePath: req.file.location,
        });
      });
    } catch (error) {
      this.logService.error({
        name: 'uploadSingleImage catch',
        error,
      });
      return res.status(500).json(`Failed to upload image file`);
    }
  }

  async uploadEditorImage(@Req() req, @Res() res) {
    try {
      this.uploadEditorImageFn(req, res, function(error) {
        if (error) {
          this.logService.error({
            name: 'uploadEditorImage',
            error,
          });
          return res.status(500).json({
            error: {
              message: 'error',
            },
          });
        }
        return res.status(201).json({
          url: req.file.location,
        });
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          message: 'error',
        },
      });
    }
  }

  async uploadAvatar(@Req() req, @Res() res) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    try {
      this.uploadImageMemory(req, res, async function(error) {
        if (error) {
          _this.logService.error({
            name: 'uploadImageMemory',
            error,
          });
          return res.status(404).json(`Failed to upload image file`);
        }

        const resizeAvatar = _this.handleResizeImage(
          req.file,
          200,
          200,
          'fill',
        );
        const originAvatar = _this.uploadBuffer(
          req.file.buffer,
          req.file.originalname,
        );
        const result = await Promise.all([resizeAvatar, originAvatar]);
        await _this.usersService.updateAvatarInfo(
          req.user.id,
          _this.convertUrl(result[1].Location),
          _this.convertUrl(result[0].Location),
        );

        return res.status(201).json({
          filePath: _this.convertUrl(result[0].Location),
        });
      });
    } catch (error) {
      this.logService.error({
        name: 'uploadImageMemory catch',
        error,
      });
      return res.status(500).json(`Failed to upload image file`);
    }
  }

  async uploadCover(@Req() req, @Res() res) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    try {
      this.uploadImageMemory(req, res, async function(error) {
        if (error) {
          _this.logService.error({
            name: 'uploadImageMemory',
            error,
          });
          return res.status(404).json(`Failed to upload image file`);
        }

        const resizeAvatar = _this.handleResizeImage(
          req.file,
          850,
          315,
          'cover',
        );
        const originAvatar = _this.uploadBuffer(
          req.file.buffer,
          req.file.originalname,
        );
        const result = await Promise.all([resizeAvatar, originAvatar]);
        await _this.usersService.updateCoverInfo(
          req.user.id,
          _this.convertUrl(result[1].Location),
          _this.convertUrl(result[0].Location),
        );

        return res.status(201).json({
          filePath: _this.convertUrl(result[0].Location),
        });
      });
    } catch (error) {
      this.logService.error({
        name: 'uploadImageMemory catch',
        error,
      });
      return res.status(500).json(`Failed to upload image file`);
    }
  }

  async handleResizeImage(file, width, height, fitMode) {
    const buffer = await this.resizeImage(file.buffer, width, height, fitMode);
    return this.uploadBuffer(buffer, file.originalname);
  }

  uploadImageMemory = multer({
    fileFilter: imageFilter,
    storage: multer.memoryStorage(),
  }).single('upload');

  uploadImage = multer({
    imageFilter,
    storage: multerS3({
      acl: 'public-read',
      s3,
      bucket: process.env.AWS_BUCKET,
      key(req, file, cb) {
        const patt = /\.[0-9a-z]+$/i;
        const fileExtension = file.originalname.match(patt)[0];
        cb(null, `upload/${Date.now().toString()}${fileExtension}`);
      },
    }),
  }).single('upload');

  uploadEditorImageFn = multer({
    imageFilter,
    storage: multerS3({
      acl: 'public-read',
      s3,
      bucket: process.env.AWS_BUCKET,
      key(req, file, cb) {
        const patt = /\.[0-9a-z]+$/i;
        const fileExtension = file.originalname.match(patt)[0];
        cb(null, `upload/${Date.now().toString()}${fileExtension}`);
      },
    }),
  }).single('upload');

  async uploadSingleFile(@Req() req, @Res() res) {
    try {
      this.uploadFile(req, res, function(error) {
        if (error) {
          this.logService.error({
            name: 'uploadSingleFile',
            error,
          });
          return res.status(404).json(`Failed to upload file`);
        }
        return res.status(201).json({
          filePath: req.file.location,
        });
      });
    } catch (error) {
      this.logService.error({
        name: 'uploadSingleFile catch',
        error,
      });
      return res.status(500).json(`Failed to upload file`);
    }
  }

  uploadFile = multer({
    fileFilter,
    storage: multerS3({
      acl: 'public-read',
      s3,
      bucket: process.env.AWS_BUCKET,
      key(req, file, cb) {
        const patt = /\.[0-9a-z]+$/i;
        const fileExtension = file.originalname.match(patt)[0];
        cb(null, `upload/${Date.now().toString()}${fileExtension}`);
      },
    }),
  }).single('upload');

  private urlToKey(fileKey: string): string {
    return fileKey.replace(/^.*\/\/[^/]+\//, '');
  }

  private fileToKey(originalname: string): string {
    const patt = /\.[0-9a-z]+$/i;
    const fileExtension = originalname.match(patt)[0];
    return `upload/${Date.now().toString()}${fileExtension}`;
  }

  getS3File(fileKey: string): Promise<any> {
    fileKey = this.urlToKey(fileKey);
    return s3
      .getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: fileKey,
      })
      .promise();
  }

  uploadStaticFile(path: string): Promise<any> {
    const fileKey = this.fileToKey(path);

    return s3
      .upload({
        Bucket: process.env.AWS_BUCKET,
        Body: fs.createReadStream(path),
        Key: fileKey,
      })
      .promise();
  }

  uploadBuffer(
    buffer: Buffer,
    fileName: string,
    changeName = true,
  ): Promise<any> {
    const fileKey = changeName
      ? this.fileToKey(fileName)
      : 'upload/' + fileName;

    return s3
      .upload({
        Bucket: process.env.AWS_BUCKET,
        Body: buffer,
        Key: fileKey,
      })
      .promise();
  }

  private async resizeImage(image, width, height, fitMode = 'cover') {
    return await sharp(image)
      .resize(width, height, {
        kernel: sharp.kernel.nearest,
        fit: fitMode,
      })
      .toBuffer();
  }

  public async uploadMultiSize(@Req() req, @Res() res, isUpload = false) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    try {
      this.uploadImageMemory(req, res, async function(error) {
        if (error) {
          return res.status(500).json({
            uploaded: false,
            error: {
              message: 'error',
            },
          });
        }

        const originalName = req.file.originalname;
        const mimetype = req.file.mimetype;
        const size = req.file.size;

        // const metadata = await sharp(req.file.buffer).metadata();

        const { info: metadata } = await sharp(req.file.buffer)
          .raw()
          .ensureAlpha()
          .toBuffer({ resolveWithObject: true });

        const fileExt = '.' + originalName.split('.').pop();
        const fileName =
          _this
            .makeId()
            .substring(0, originalName.length - fileExt.length)
            .replace(/\s/g, '') +
          '_' +
          Date.now().toString();

        const imageSizesAvailable = ImageSizes.filter(
          item => item.width < metadata.width,
        );

        const promises = imageSizesAvailable.map(item => {
          return _this.handleResizeImageNew(
            req.file.buffer,
            `${item.name}_${fileName}${fileExt}`,
            item.width,
            null,
          );
        });

        const originUpload = _this.uploadBuffer(
          req.file.buffer,
          `full_${fileName}${fileExt}`,
          false,
        );

        const result = await Promise.all([originUpload, ...promises]);

        const promises2 = imageSizesAvailable.map(item => {
          return _this.handleConvertWebp(
            req.file.buffer,
            `${item.name}_${fileName}.webp`,
            item.width,
            null,
          );
        });

        const webp = await sharp(req.file.buffer)
          .webp()
          .toBuffer();

        const originWebpUpload = _this.uploadBuffer(
          webp,
          `full_${fileName}.webp`,
        );

        const resultWebp = await Promise.all([originWebpUpload, ...promises2]);

        const format = {};
        const webpObj = {
          full: {
            url: _this.convertUrl(resultWebp[0].Location),
            name: `full_${fileName}.webp`,
          },
        };

        imageSizesAvailable.forEach((item, index) => {
          format[item.name] = {
            url: _this.convertUrl(result[index + 1].Location),
            name: `${item.name}_${fileName}${fileExt}`,
          };

          webpObj[item.name] = {
            url: _this.convertUrl(resultWebp[index + 1].Location),
            name: `${item.name}_${fileName}.webp`,
          };
        });

        const blurObj = await sharp(req.file.buffer)
          .resize(100, null)
          .toBuffer();

        const { data: pixels, info: blurMeta } = await sharp(blurObj)
          .raw()
          .ensureAlpha()
          .toBuffer({ resolveWithObject: true });

        const clamped = new Uint8ClampedArray(pixels);

        const mediaObj = {
          name: originalName,
          hash: `full_${fileName}${fileExt}`,
          ext: fileExt,
          mime: mimetype,
          size,
          width: metadata.width,
          height: metadata.height,
          url: _this.convertUrl(result[0].Location),
          format,
          webp: webpObj,
          blurhash: encode(clamped, blurMeta.width, blurMeta.height, 4, 3),
          created_by: req.user._id,
          updated_by: req.user._id,
        };

        const resultObj = await _this.mediaModel.create(mediaObj);

        if (isUpload) {
          const responseUpload = {
            default: _this.convertUrl(result[0].Location),
          };

          imageSizesAvailable.forEach((item, index) => {
            responseUpload[item.width] = _this.convertUrl(
              result[index + 1].Location,
            );
          });

          return res.status(201).json({ uploaded: true, urls: responseUpload });
        } else {
          return res.status(201).json(resultObj);
        }
      });
    } catch (error) {
      return res.status(500).json({
        uploaded: false,
        error: {
          message: 'error',
        },
      });
    }
  }

  async handleResizeImageNew(fileBuffer, fileName, width, height) {
    const buffer = await this.resizeImageNew(fileBuffer, width, height);
    return this.uploadBuffer(buffer, fileName, false);
  }

  async handleConvertWebp(fileBuffer, fileName, width, height) {
    const buffer = await this.convertWebp(fileBuffer, width, height);
    return this.uploadBuffer(buffer, fileName);
  }

  private async resizeImageNew(image, width, height) {
    return await sharp(image)
      .resize(width, height)
      .toBuffer();
  }

  private async convertWebp(image, width, height) {
    return await sharp(image)
      .resize(width, height)
      .webp()
      .toBuffer();
  }

  async listing(
    isCounting = false,
    keyword = null,
    start = 0,
    length = 10,
    sortBy = 'created_at',
    sortType = 'desc',
  ) {
    try {
      let filter = {};
      if (keyword) {
        filter = {
          $or: [
            { name: { $regex: `.*${keyword}.*` } },
            { hash: { $regex: `.*${keyword}.*` } },
            { url: { $regex: `.*${keyword}.*` } },
          ],
        };
      }

      if (isCounting) {
        return await this.mediaModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.mediaModel.find(filter).sort(sortObj);
      }
      return await this.mediaModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'MediaService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }

  makeId(length = 16) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  convertUrl(localtion) {
    const root = this.configService.get('AWS_URL');
    const cloudfront = this.configService.get('AWS_CLOUDFRONT');

    return localtion.replace(root, cloudfront);
  }
}

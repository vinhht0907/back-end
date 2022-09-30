import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { AllExceptionsFilter } from '@/common/exception-filter/all-exceptions-filter';
import { CustomLogger } from '@/common/logger/custom-logger';
import { SharedModule } from './modules/shared/shared.module';
import { SlackService } from './modules/shared/slack.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ContextInterceptor } from '@/common/interceptor/context-interceptor';

const logger = require('morgan');
const EventEmitter = require('events');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      exposedHeaders: ['Content-Disposition'],
    },
  });

  app.use(
    logger(
      ':date[web] :method :status :url :response-time ms --- :req[authorization] --- :user-agent --- :res[content-length]',
    ),
  );

  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  EventEmitter.defaultMaxListeners = 0;

  const slackService = app
    .select(SharedModule)
    .get(SlackService, { strict: true });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalInterceptors(new ContextInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: errors => {
        const errorObj = {};
        errors.forEach(err => {
          if (errorObj[err.property]) {
            errorObj[err.property] = errorObj[err.property].concat(
              Object.values(err.constraints),
            );
          } else {
            errorObj[err.property] = Object.values(err.constraints);
          }
        });

        return new UnprocessableEntityException({ errors: errorObj });
      },
    }),
  );
  app.useLogger(new CustomLogger(slackService));

  const loggerService = app
    .select(SharedModule)
    .get(CustomLogger, { strict: true });
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, loggerService));

  const options = new DocumentBuilder()
    .setTitle('VietLit API document')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);
  app.setGlobalPrefix("api")
  await app.listen(3000, '0.0.0.0');
}

bootstrap();

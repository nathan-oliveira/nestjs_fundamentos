import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Items'],
    origin: function (origin, callback) {
      const origins = process.env.ORIGIN_LIST.split(',');
      if (origins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(
          new HttpException('Not allowed by CORS', HttpStatus.UNAUTHORIZED),
        );
      }
    },
  });
  
  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalInterceptors(new LogInterceptor());

  await app.listen(3000);
}

bootstrap();

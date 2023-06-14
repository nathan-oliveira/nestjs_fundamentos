import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

import { UserIdCheckMiddleware } from './middlewares/user-id-check.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
    }),
    // Throttler -> proteção contra ataque de força bruta (rate limiting)
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 200,
      // ignoreUserAgents: [/googlebot/gi]
    }),
    MailerModule.forRoot({ // https://ethereal.email/create
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'clair.nitzsche72@ethereal.email',
          pass: 'BTrUq1CWpqhzRjXaBV'
        },
      },
      defaults: {
        from: '"Email" <clair.nitzsche72@ethereal.email>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    forwardRef(() => UsersModule), // forwardRef Corrige problema de Circular dependency
    forwardRef(() => AuthModule),
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // para proteger o sistema inteiro contra ataque de força bruta (rate limiting)
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserIdCheckMiddleware).forRoutes({
      path: 'users/:id',
      method: RequestMethod.ALL,
    });
  }
}

import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './web/auth/auth.module';
import { BookService } from './web/book/book.service';
import { BookModule } from './web/book/book.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './web/user/user.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, BookModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    AppService,
    BookService,
  ],
})
export class AppModule {}

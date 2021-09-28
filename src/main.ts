import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ClassValidatorExceptionsFilter } from './shared/class-validator-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // binds ValidationPipe to the entire application
  app.useGlobalPipes(new ValidationPipe());

  // apply transform to all responses
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalFilters(new ClassValidatorExceptionsFilter());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();

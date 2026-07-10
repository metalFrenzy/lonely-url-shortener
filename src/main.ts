import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips any properties not defined in the DTO
      transform: true, // auto-converts payloads into DTO class instances
    }),
  );
  await app.listen(3000);
}
void bootstrap();

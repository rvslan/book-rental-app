import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create a Nest application
  const app = await NestFactory.create(AppModule);

  // Set global prefix for API routes
  app.setGlobalPrefix('/api');

  // Get the ConfigService instance
  const configService = app.get(ConfigService);

  // Apply global validation pipe with transform option enabled
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Enable Cross-Origin Resource Sharing (CORS)
  app.enableCors({
    origin: true,
    methods: ['*'],
    credentials: true,
  });

  // Start listening on the configured port
  await app.listen(configService.get<number>('port'));
}

// Bootstrap the application
bootstrap();

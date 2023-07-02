import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("/api");
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  app.enableCors({
    origin: true,
    methods: ["*"],
    credentials: true,
  });
  await app.listen(configService.get<number>("port"));
  console.log(configService.get<number>("port"));
}

bootstrap();
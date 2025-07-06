import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app/app.module';
import { AllExceptionsFilter } from '../src/app/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export default async function handler(req: any, res: any) {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Set up global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Stamina API')
    .setDescription('API for Stamina Application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Create Express adapter
  const server = app.getHttpAdapter().getInstance();

  // Handle the request
  return server(req, res);
}

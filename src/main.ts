import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3001;
    const corsOrigin = configService.get<string>('CORS_ORIGIN')?.split(',') || ['http://localhost:3000'];

    // Security middleware
    app.use(helmet());
    app.use(compression());

    // CORS configuration
    app.enableCors({
      origin: corsOrigin,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: false,
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    // Global prefix for all routes
    app.setGlobalPrefix('');

    // Swagger API documentation
    const config = new DocumentBuilder()
      .setTitle('What to Eat - API Gateway')
      .setDescription('Food recommendation API with social intelligence and AI-powered suggestions')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication', 'User authentication and token management')
      .addTag('User Management', 'User profile and preferences management')
      .addTag('Recommendations', 'Food recommendation engine')
      .addTag('Admin', 'Administrative endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
      },
    });

    await app.listen(port);
    
    logger.log(`🚀 API Gateway running on port ${port}`);
    logger.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
    logger.log(`🌍 CORS enabled for: ${corsOrigin.join(', ')}`);
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();

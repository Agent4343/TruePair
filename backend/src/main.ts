import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('Starting TrueMatch API v2...'); // Version marker to verify deployment
  logger.log(`Node environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Trust proxy for Railway/cloud deployments
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // CORS - handle manually to ensure it works
  expressApp.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With,Origin');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    
    next();
  });

  logger.log('Manual CORS middleware configured');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('TrueMatch API')
    .setDescription('Trust-first dating platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(
      process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Railway provides PORT automatically
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 TrueMatch API v2 running on port ${port}`);
  console.log(`📚 API Documentation available at /api/docs`);
}

bootstrap();

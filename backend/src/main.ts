import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('Starting TrueMatch API...');
  logger.log(`Node environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Trust proxy for Railway/cloud deployments
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Manual CORS middleware (backup)
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
    next();
  });

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

  // CORS - allow all origins
  app.enableCors({
    origin: (origin, callback) => {
      // Always allow - reflect the origin back
      callback(null, origin || '*');
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  logger.log('CORS enabled for all origins');

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

  console.log(`🚀 TrueMatch API running on port ${port}`);
  console.log(`📚 API Documentation available at /api/docs`);
}

bootstrap();

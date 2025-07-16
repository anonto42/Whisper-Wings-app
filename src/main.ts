import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import helmet from 'helmet';
import { ResponseInterceptor } from './common/Interceptors/response.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {

  // Configaration
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  
  // Global Prefix
  app.setGlobalPrefix('api');

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Error & Response Interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Globall Validation Pipes
  app.useGlobalPipes(new ValidationPipe());
  
  // Global Guards
  // app.useGlobalGuards(new JwtGuard());

  // Security
  app.enableCors({
    origin: '*',
    credentials: true,
  })
  app.use(helmet());

  // Run the server 
  await app.listen(port);
  console.log('\x1b[1m\x1b[33m%s\x1b[0m', `Server is running on port ${port}`)
};

bootstrap();
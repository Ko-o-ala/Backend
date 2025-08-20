import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  // 한국 시간대 설정 (KST, UTC+9)
  process.env.TZ = 'Asia/Seoul';

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  ); // * 등록해야지 class validation이 원활하게 작동함.
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(
    ['/docs', '/docs-json'],
    expressBasicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER ?? 'admin']:
          process.env.SWAGGER_PASSWORD ?? '0000',
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('KoOala user API')
    .setDescription('개발용 Swagger 문서')
    .setVersion('1.0.0')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.enableCors({
    origin: true, // production 단계에서는 특정 도메인만 허용하길 ㄱ
    credentials: true,
  });
  const PORT = process.env.PORT;
  await app.listen(PORT!, '0.0.0.0');
}
bootstrap();

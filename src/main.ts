// 全局代理初始化（必须在应用启动前执行）
import { setGlobalDispatcher, ProxyAgent } from 'undici';

try {
  if (process.env.HTTPS_PROXY) {
    const agent = new ProxyAgent(process.env.HTTPS_PROXY);
    setGlobalDispatcher(agent);
    console.log('>>> [SUCCESS] LuminaMedia Proxy Engine Active! (全局初始化)');
  }
} catch (e: unknown) {
  const error = e as Error;
  console.error(
    '>>> [FAILED] undici is still missing in runtime!',
    error.message,
  );
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // 移除未定义的属性
      forbidNonWhitelisted: true, // 拒绝未定义的属性
      transform: true,        // 自动转换类型
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // 设置全局前缀以匹配API规范
  app.setGlobalPrefix('api');

  // Enable CORS for frontend development
  app.enableCors({
    origin: [
      'http://localhost:5174',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // 尝试安全地初始化Swagger文档
  try {
    const config = new DocumentBuilder()
      .setTitle('LuminaMedia API')
      .setDescription('LuminaMedia 2.0 内容营销平台API文档')
      .setVersion('2.0')
      .addBearerAuth()
      .build();

    // 创建文档时忽略循环依赖，增加错误处理
    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: false,  // 避免深层扫描导致的循环依赖
      ignoreGlobalPrefix: false,
      // 使用自定义的模型命名函数以避免冲突
      operationIdFactory: (
        controllerKey: string,
        methodKey: string,
      ) => `${controllerKey}_${methodKey}`,
    });

    SwaggerModule.setup('docs', app, document); // 相对于全局前缀的路径
    console.log('>>> [SUCCESS] Swagger API文档已启用');
  } catch (error) {
    console.warn('>>> [WARNING] Swagger初始化失败:', error.message);
    console.warn('>>> [INFO] 启动无Swagger的应用...');
  }

  // 添加健康检查端点
  app.getHttpAdapter().get('/health', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  });

  await app.listen(process.env.APP_PORT ?? 3003, '0.0.0.0');
}
void bootstrap();
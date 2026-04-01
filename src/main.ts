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
import { Workflow } from './modules/workflow/entities/workflow.entity';
import { WorkflowNode } from './modules/workflow/entities/workflow-node.entity';
import { ApprovalRecord } from './modules/workflow/entities/approval-record.entity';
import { Notification } from './modules/workflow/entities/notification.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Swagger API documentation configuration - 启用但限制扫描以避免循环依赖
  const config = new DocumentBuilder()
    .setTitle('LuminaMedia API')
    .setDescription('LuminaMedia 2.0 内容营销平台API文档')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  // 添加Swagger配置选项以避免循环依赖问题
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
    extraModels: [
      // 手动注册可能引起循环依赖的模型
      Workflow,
      WorkflowNode,
      ApprovalRecord,
      Notification,
    ],
    include: [ // 明确包含需要的模块
      // 如果不指定模块，Swagger会扫描所有控制器
    ],
  });

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.APP_PORT ?? 3003, '0.0.0.0');
}
void bootstrap();
// [Hot reload test] Modified at $(date) to verify Docker watch mode
// SECOND TEST: Modified at $(date) to check if hot reload works
// NODEMON HOT RELOAD TEST: Modified at $(date) to verify nodemon watch mode
// DATA CLEANING VERIFICATION TEST: Modified at $(date) to test nodemon hot reload after marketing-strategy.service.ts update
// DATA CLEANING ENHANCED: Modified at $(date) to add number extraction from Chinese text
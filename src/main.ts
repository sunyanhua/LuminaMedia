// 全局代理初始化（必须在应用启动前执行）
let setGlobalDispatcher: any, ProxyAgent: any;
try {
  const undici = require('undici');
  setGlobalDispatcher = undici.setGlobalDispatcher;
  ProxyAgent = undici.ProxyAgent;
  if (process.env.HTTPS_PROXY) {
    const agent = new ProxyAgent(process.env.HTTPS_PROXY);
    setGlobalDispatcher(agent);
    console.log('>>> [SUCCESS] LuminaMedia Proxy Engine Active! (全局初始化)');
  }
} catch (e) {
  console.error('>>> [FAILED] undici is still missing in runtime!', e.message);
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

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

  await app.listen(process.env.APP_PORT ?? 3003, '0.0.0.0');
}
bootstrap();
// [Hot reload test] Modified at $(date) to verify Docker watch mode
// SECOND TEST: Modified at $(date) to check if hot reload works
// NODEMON HOT RELOAD TEST: Modified at $(date) to verify nodemon watch mode
// DATA CLEANING VERIFICATION TEST: Modified at $(date) to test nodemon hot reload after marketing-strategy.service.ts update
// DATA CLEANING ENHANCED: Modified at $(date) to add number extraction from Chinese text

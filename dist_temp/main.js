"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const undici_1 = require("undici");
try {
    if (process.env.HTTPS_PROXY) {
        const agent = new undici_1.ProxyAgent(process.env.HTTPS_PROXY);
        (0, undici_1.setGlobalDispatcher)(agent);
        console.log('>>> [SUCCESS] LuminaMedia Proxy Engine Active! (全局初始化)');
    }
}
catch (e) {
    const error = e;
    console.error('>>> [FAILED] undici is still missing in runtime!', error.message);
}
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api');
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
    try {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('LuminaMedia API')
            .setDescription('LuminaMedia 2.0 内容营销平台API文档')
            .setVersion('2.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config, {
            deepScanRoutes: false,
            ignoreGlobalPrefix: false,
            operationIdFactory: (controllerKey, methodKey) => `${controllerKey}_${methodKey}`,
        });
        swagger_1.SwaggerModule.setup('docs', app, document);
        console.log('>>> [SUCCESS] Swagger API文档已启用');
    }
    catch (error) {
        console.warn('>>> [WARNING] Swagger初始化失败:', error.message);
        console.warn('>>> [INFO] 启动无Swagger的应用...');
    }
    app.getHttpAdapter().get('/health', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    });
    await app.listen(process.env.APP_PORT ?? 3003, '0.0.0.0');
}
void bootstrap();
//# sourceMappingURL=main.js.map
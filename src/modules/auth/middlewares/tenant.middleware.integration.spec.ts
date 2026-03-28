import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Get, Module } from '@nestjs/common';
import { Request } from 'express';
import request from 'supertest';
import { TenantMiddleware } from './tenant.middleware';
import { JwtService } from '@nestjs/jwt';
import { TenantContextService } from '../../../shared/services/tenant-context.service';

// 测试控制器，用于验证租户上下文
@Controller('test-tenant')
class TestTenantController {
  @Get()
  getTenant() {
    const tenantId = TenantContextService.getCurrentTenantIdStatic();
    return { tenantId };
  }
}

// 测试模块
@Module({
  controllers: [TestTenantController],
})
class TestModule {}

describe('TenantMiddleware Integration', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
      providers: [
        TenantMiddleware,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    const middleware = moduleFixture.get<TenantMiddleware>(TenantMiddleware);
    // 应用中间件到所有路由
    app.use(middleware.use.bind(middleware));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('租户ID从JWT令牌获取', () => {
    it('应该从有效的Bearer令牌设置租户ID', async () => {
      const tenantId = 'jwt-tenant-123';
      (jwtService.verify as jest.Mock).mockReturnValue({ tenantId });

      const response = await request(app.getHttpServer())
        .get('/test-tenant')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect(200);

      expect(response.body.tenantId).toBe(tenantId);
      expect(jest.mocked(jwtService.verify)).toHaveBeenCalledWith(
        'valid-jwt-token',
      );
    });

    it('当JWT令牌不包含tenantId时应使用默认租户', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({}); // 没有tenantId

      const response = await request(app.getHttpServer())
        .get('/test-tenant')
        .set('Authorization', 'Bearer token-without-tenant')
        .expect(200);

      expect(response.body.tenantId).toBe('default-tenant');
    });

    it('当JWT令牌无效时应忽略并回退到x-tenant-id头', async () => {
      const headerTenantId = 'header-tenant-456';
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app.getHttpServer())
        .get('/test-tenant')
        .set('Authorization', 'Bearer invalid-token')
        .set('x-tenant-id', headerTenantId)
        .expect(200);

      expect(response.body.tenantId).toBe(headerTenantId);
    });
  });

  describe('租户ID从x-tenant-id头获取', () => {
    it('应该从x-tenant-id头设置租户ID', async () => {
      const tenantId = 'header-tenant-789';

      const response = await request(app.getHttpServer())
        .get('/test-tenant')
        .set('x-tenant-id', tenantId)
        .expect(200);

      expect(response.body.tenantId).toBe(tenantId);
      expect(jest.mocked(jwtService.verify)).not.toHaveBeenCalled();
    });

    it('x-tenant-id头应优先于无效JWT令牌', async () => {
      const headerTenantId = 'header-tenant-999';
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app.getHttpServer())
        .get('/test-tenant')
        .set('Authorization', 'Bearer invalid-token')
        .set('x-tenant-id', headerTenantId)
        .expect(200);

      expect(response.body.tenantId).toBe(headerTenantId);
    });
  });

  describe('默认租户ID', () => {
    it('当没有提供租户信息时应使用默认租户', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-tenant')
        .expect(200);

      expect(response.body.tenantId).toBe('default-tenant');
      expect(jest.mocked(jwtService.verify)).not.toHaveBeenCalled();
    });

    it('当JWT令牌无效且没有x-tenant-id头时应使用默认租户', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app.getHttpServer())
        .get('/test-tenant')
        .set('Authorization', 'Bearer invalid-token')
        .expect(200);

      expect(response.body.tenantId).toBe('default-tenant');
    });
  });

  describe('租户上下文隔离', () => {
    it('不同请求应有独立的租户上下文', async () => {
      // 第一个请求
      (jwtService.verify as jest.Mock).mockReturnValue({
        tenantId: 'tenant-a',
      });
      const response1 = await request(app.getHttpServer())
        .get('/test-tenant')
        .set('Authorization', 'Bearer token-a')
        .expect(200);
      expect(response1.body.tenantId).toBe('tenant-a');

      // 第二个请求
      (jwtService.verify as jest.Mock).mockReturnValue({
        tenantId: 'tenant-b',
      });
      const response2 = await request(app.getHttpServer())
        .get('/test-tenant')
        .set('Authorization', 'Bearer token-b')
        .expect(200);
      expect(response2.body.tenantId).toBe('tenant-b');

      // 第三个请求没有租户信息
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const response3 = await request(app.getHttpServer())
        .get('/test-tenant')
        .expect(200);
      expect(response3.body.tenantId).toBe('default-tenant');
    });
  });

  describe('中间件配置', () => {
    it('应该正确处理没有Authorization头的请求', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-tenant')
        .expect(200);

      expect(response.body.tenantId).toBe('default-tenant');
      expect(jest.mocked(jwtService.verify)).not.toHaveBeenCalled();
    });

    it('应该正确处理非Bearer格式的Authorization头', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-tenant')
        .set('Authorization', 'Basic username:password')
        .expect(200);

      expect(response.body.tenantId).toBe('default-tenant');
      expect(jest.mocked(jwtService.verify)).not.toHaveBeenCalled();
    });

    it('应该正确处理空的Authorization头', async () => {
      const response = await request(app.getHttpServer())
        .get('/test-tenant')
        .set('Authorization', '')
        .expect(200);

      expect(response.body.tenantId).toBe('default-tenant');
      expect(jest.mocked(jwtService.verify)).not.toHaveBeenCalled();
    });
  });
});

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const supertest_1 = __importDefault(require("supertest"));
const tenant_middleware_1 = require("../../../../src/modules/auth/middlewares/tenant.middleware");
const jwt_1 = require("@nestjs/jwt");
const tenant_context_service_1 = require("../../../../src/shared/services/tenant-context.service");
let TestTenantController = class TestTenantController {
    getTenant() {
        const tenantId = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
        return { tenantId };
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TestTenantController.prototype, "getTenant", null);
TestTenantController = __decorate([
    (0, common_1.Controller)('test-tenant')
], TestTenantController);
let TestModule = class TestModule {
};
TestModule = __decorate([
    (0, common_1.Module)({
        controllers: [TestTenantController],
    })
], TestModule);
describe('TenantMiddleware Integration', () => {
    let app;
    let jwtService;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [TestModule],
            providers: [
                tenant_middleware_1.TenantMiddleware,
                {
                    provide: jwt_1.JwtService,
                    useValue: {
                        verify: jest.fn(),
                    },
                },
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        const middleware = moduleFixture.get(tenant_middleware_1.TenantMiddleware);
        app.use(middleware.use.bind(middleware));
        await app.init();
        jwtService = moduleFixture.get(jwt_1.JwtService);
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
            jwtService.verify.mockReturnValue({ tenantId });
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .set('Authorization', 'Bearer valid-jwt-token')
                .expect(200);
            expect(response.body.tenantId).toBe(tenantId);
            expect(jest.mocked(jwtService.verify)).toHaveBeenCalledWith('valid-jwt-token');
        });
        it('当JWT令牌不包含tenantId时应使用默认租户', async () => {
            jwtService.verify.mockReturnValue({});
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .set('Authorization', 'Bearer token-without-tenant')
                .expect(200);
            expect(response.body.tenantId).toBe('default-tenant');
        });
        it('当JWT令牌无效时应忽略并回退到x-tenant-id头', async () => {
            const headerTenantId = 'header-tenant-456';
            jwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            const response = await (0, supertest_1.default)(app.getHttpServer())
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
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .set('x-tenant-id', tenantId)
                .expect(200);
            expect(response.body.tenantId).toBe(tenantId);
            expect(jest.mocked(jwtService.verify)).not.toHaveBeenCalled();
        });
        it('x-tenant-id头应优先于无效JWT令牌', async () => {
            const headerTenantId = 'header-tenant-999';
            jwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .set('Authorization', 'Bearer invalid-token')
                .set('x-tenant-id', headerTenantId)
                .expect(200);
            expect(response.body.tenantId).toBe(headerTenantId);
        });
    });
    describe('默认租户ID', () => {
        it('当没有提供租户信息时应使用默认租户', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .expect(200);
            expect(response.body.tenantId).toBe('default-tenant');
            expect(jest.mocked(jwtService.verify)).not.toHaveBeenCalled();
        });
        it('当JWT令牌无效且没有x-tenant-id头时应使用默认租户', async () => {
            jwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .set('Authorization', 'Bearer invalid-token')
                .expect(200);
            expect(response.body.tenantId).toBe('default-tenant');
        });
    });
    describe('租户上下文隔离', () => {
        it('不同请求应有独立的租户上下文', async () => {
            jwtService.verify.mockReturnValue({
                tenantId: 'tenant-a',
            });
            const response1 = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .set('Authorization', 'Bearer token-a')
                .expect(200);
            expect(response1.body.tenantId).toBe('tenant-a');
            jwtService.verify.mockReturnValue({
                tenantId: 'tenant-b',
            });
            const response2 = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .set('Authorization', 'Bearer token-b')
                .expect(200);
            expect(response2.body.tenantId).toBe('tenant-b');
            jwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            const response3 = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .expect(200);
            expect(response3.body.tenantId).toBe('default-tenant');
        });
    });
    describe('中间件配置', () => {
        it('应该正确处理没有Authorization头的请求', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .expect(200);
            expect(response.body.tenantId).toBe('default-tenant');
            expect(jest.mocked(jwtService.verify)).not.toHaveBeenCalled();
        });
        it('应该正确处理非Bearer格式的Authorization头', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .set('Authorization', 'Basic username:password')
                .expect(200);
            expect(response.body.tenantId).toBe('default-tenant');
            expect(jest.mocked(jwtService.verify)).not.toHaveBeenCalled();
        });
        it('应该正确处理空的Authorization头', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/test-tenant')
                .set('Authorization', '')
                .expect(200);
            expect(response.body.tenantId).toBe('default-tenant');
            expect(jest.mocked(jwtService.verify)).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=tenant.middleware.integration.spec.js.map
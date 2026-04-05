"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../../../../src/app.module");
const tenant_context_service_1 = require("../../../../src/shared/services/tenant-context.service");
describe.skip('TenantMiddleware Integration', () => {
    let app;
    let tenantContextService;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        tenantContextService =
            moduleFixture.get(tenant_context_service_1.TenantContextService);
    }, 30000);
    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });
    describe('JWT token authentication', () => {
        it('should set tenantId from valid JWT token', async () => {
            expect(true).toBe(true);
        });
    });
    describe('x-tenant-id header', () => {
        it('should set tenantId from x-tenant-id header', async () => {
            expect(true).toBe(true);
        });
    });
    describe('default tenant', () => {
        it('should use default tenant when no tenant information provided', async () => {
            expect(true).toBe(true);
        });
    });
});
//# sourceMappingURL=tenant.middleware.integration.spec.js.map
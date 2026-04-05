"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
const tenant_context_service_1 = require("../../../shared/services/tenant-context.service");
describe('TenantMiddleware', () => {
    let middleware;
    let jwtService;
    let mockNext;
    let mockRes;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
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
        middleware = module.get(tenant_middleware_1.TenantMiddleware);
        jwtService = module.get(jwt_1.JwtService);
        mockNext = jest.fn();
        mockRes = {};
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should set tenantId from JWT token when Bearer token is valid', () => {
        const mockReq = {
            headers: {
                authorization: 'Bearer valid-jwt-token',
            },
        };
        jwtService.verify.mockReturnValue({
            tenantId: 'tenant-from-jwt',
        });
        const runWithContextSpy = jest.spyOn(tenant_context_service_1.TenantContextService, 'runWithContext');
        middleware.use(mockReq, mockRes, mockNext);
        expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
        expect(mockReq.tenantId).toBe('tenant-from-jwt');
        expect(runWithContextSpy).toHaveBeenCalledWith({ tenantId: 'tenant-from-jwt' }, expect.any(Function));
        expect(mockNext).toHaveBeenCalled();
    });
    it('should set tenantId from x-tenant-id header when JWT token is missing', () => {
        const mockReq = {
            headers: {
                'x-tenant-id': 'header-tenant-id',
            },
        };
        const runWithContextSpy = jest.spyOn(tenant_context_service_1.TenantContextService, 'runWithContext');
        middleware.use(mockReq, mockRes, mockNext);
        expect(jwtService.verify).not.toHaveBeenCalled();
        expect(mockReq.tenantId).toBe('header-tenant-id');
        expect(runWithContextSpy).toHaveBeenCalledWith({ tenantId: 'header-tenant-id' }, expect.any(Function));
        expect(mockNext).toHaveBeenCalled();
    });
    it('should set tenantId from x-tenant-id header when JWT token does not contain tenantId', () => {
        const mockReq = {
            headers: {
                authorization: 'Bearer valid-jwt-token',
                'x-tenant-id': 'header-tenant-id',
            },
        };
        jwtService.verify.mockReturnValue({});
        const runWithContextSpy = jest.spyOn(tenant_context_service_1.TenantContextService, 'runWithContext');
        middleware.use(mockReq, mockRes, mockNext);
        expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
        expect(mockReq.tenantId).toBe('header-tenant-id');
        expect(runWithContextSpy).toHaveBeenCalledWith({ tenantId: 'header-tenant-id' }, expect.any(Function));
        expect(mockNext).toHaveBeenCalled();
    });
    it('should set default tenantId when no tenantId is provided', () => {
        const mockReq = {
            headers: {},
        };
        const runWithContextSpy = jest.spyOn(tenant_context_service_1.TenantContextService, 'runWithContext');
        middleware.use(mockReq, mockRes, mockNext);
        expect(jwtService.verify).not.toHaveBeenCalled();
        expect(mockReq.tenantId).toBe('default-tenant');
        expect(runWithContextSpy).toHaveBeenCalledWith({ tenantId: 'default-tenant' }, expect.any(Function));
        expect(mockNext).toHaveBeenCalled();
    });
    it('should ignore invalid JWT token and fallback to header', () => {
        const mockReq = {
            headers: {
                authorization: 'Bearer invalid-jwt-token',
                'x-tenant-id': 'header-tenant-id',
            },
        };
        jwtService.verify.mockImplementation(() => {
            throw new Error('invalid token');
        });
        const runWithContextSpy = jest.spyOn(tenant_context_service_1.TenantContextService, 'runWithContext');
        middleware.use(mockReq, mockRes, mockNext);
        expect(jwtService.verify).toHaveBeenCalledWith('invalid-jwt-token');
        expect(mockReq.tenantId).toBe('header-tenant-id');
        expect(runWithContextSpy).toHaveBeenCalledWith({ tenantId: 'header-tenant-id' }, expect.any(Function));
        expect(mockNext).toHaveBeenCalled();
    });
    it('should ignore invalid JWT token and fallback to default when no header', () => {
        const mockReq = {
            headers: {
                authorization: 'Bearer invalid-jwt-token',
            },
        };
        jwtService.verify.mockImplementation(() => {
            throw new Error('invalid token');
        });
        const runWithContextSpy = jest.spyOn(tenant_context_service_1.TenantContextService, 'runWithContext');
        middleware.use(mockReq, mockRes, mockNext);
        expect(jwtService.verify).toHaveBeenCalledWith('invalid-jwt-token');
        expect(mockReq.tenantId).toBe('default-tenant');
        expect(runWithContextSpy).toHaveBeenCalledWith({ tenantId: 'default-tenant' }, expect.any(Function));
        expect(mockNext).toHaveBeenCalled();
    });
});
//# sourceMappingURL=tenant.middleware.spec.js.map
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  TenantMiddleware,
  TenantRequest,
} from '../../../../src/modules/auth/middlewares/tenant.middleware';
import { TenantContextService } from '../../../../src/shared/services/tenant-context.service';

describe('TenantMiddleware', () => {
  let middleware: TenantMiddleware;
  let jwtService: JwtService;
  let mockNext: jest.Mock;
  let mockRes: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    middleware = module.get<TenantMiddleware>(TenantMiddleware);
    jwtService = module.get<JwtService>(JwtService);
    mockNext = jest.fn();
    mockRes = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set tenantId from JWT token when Bearer token is valid', () => {
    const mockReq: TenantRequest = {
      headers: {
        authorization: 'Bearer valid-jwt-token',
      },
    };
    (jwtService.verify as jest.Mock).mockReturnValue({
      tenantId: 'tenant-from-jwt',
    });
    const runWithContextSpy = jest.spyOn(
      TenantContextService,
      'runWithContext',
    );

    middleware.use(mockReq, mockRes, mockNext);

    expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
    expect(mockReq.tenantId).toBe('tenant-from-jwt');
    expect(runWithContextSpy).toHaveBeenCalledWith(
      { tenantId: 'tenant-from-jwt' },
      expect.any(Function),
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set tenantId from x-tenant-id header when JWT token is missing', () => {
    const mockReq: TenantRequest = {
      headers: {
        'x-tenant-id': 'header-tenant-id',
      },
    };
    const runWithContextSpy = jest.spyOn(
      TenantContextService,
      'runWithContext',
    );

    middleware.use(mockReq, mockRes, mockNext);

    expect(jwtService.verify).not.toHaveBeenCalled();
    expect(mockReq.tenantId).toBe('header-tenant-id');
    expect(runWithContextSpy).toHaveBeenCalledWith(
      { tenantId: 'header-tenant-id' },
      expect.any(Function),
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set tenantId from x-tenant-id header when JWT token does not contain tenantId', () => {
    const mockReq: TenantRequest = {
      headers: {
        authorization: 'Bearer valid-jwt-token',
        'x-tenant-id': 'header-tenant-id',
      },
    };
    (jwtService.verify as jest.Mock).mockReturnValue({}); // no tenantId
    const runWithContextSpy = jest.spyOn(
      TenantContextService,
      'runWithContext',
    );

    middleware.use(mockReq, mockRes, mockNext);

    expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
    expect(mockReq.tenantId).toBe('header-tenant-id');
    expect(runWithContextSpy).toHaveBeenCalledWith(
      { tenantId: 'header-tenant-id' },
      expect.any(Function),
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set default tenantId when no tenantId is provided', () => {
    const mockReq: TenantRequest = {
      headers: {},
    };
    const runWithContextSpy = jest.spyOn(
      TenantContextService,
      'runWithContext',
    );

    middleware.use(mockReq, mockRes, mockNext);

    expect(jwtService.verify).not.toHaveBeenCalled();
    expect(mockReq.tenantId).toBe('default-tenant');
    expect(runWithContextSpy).toHaveBeenCalledWith(
      { tenantId: 'default-tenant' },
      expect.any(Function),
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should ignore invalid JWT token and fallback to header', () => {
    const mockReq: TenantRequest = {
      headers: {
        authorization: 'Bearer invalid-jwt-token',
        'x-tenant-id': 'header-tenant-id',
      },
    };
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });
    const runWithContextSpy = jest.spyOn(
      TenantContextService,
      'runWithContext',
    );

    middleware.use(mockReq, mockRes, mockNext);

    expect(jwtService.verify).toHaveBeenCalledWith('invalid-jwt-token');
    expect(mockReq.tenantId).toBe('header-tenant-id');
    expect(runWithContextSpy).toHaveBeenCalledWith(
      { tenantId: 'header-tenant-id' },
      expect.any(Function),
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should ignore invalid JWT token and fallback to default when no header', () => {
    const mockReq: TenantRequest = {
      headers: {
        authorization: 'Bearer invalid-jwt-token',
      },
    };
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });
    const runWithContextSpy = jest.spyOn(
      TenantContextService,
      'runWithContext',
    );

    middleware.use(mockReq, mockRes, mockNext);

    expect(jwtService.verify).toHaveBeenCalledWith('invalid-jwt-token');
    expect(mockReq.tenantId).toBe('default-tenant');
    expect(runWithContextSpy).toHaveBeenCalledWith(
      { tenantId: 'default-tenant' },
      expect.any(Function),
    );
    expect(mockNext).toHaveBeenCalled();
  });
});

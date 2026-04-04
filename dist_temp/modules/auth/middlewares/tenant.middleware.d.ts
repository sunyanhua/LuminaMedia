import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
export interface TenantRequest extends Request {
    tenantId?: string;
}
export declare class TenantMiddleware implements NestMiddleware {
    private jwtService;
    constructor(jwtService: JwtService);
    use(req: TenantRequest, res: Response, next: NextFunction): void;
}

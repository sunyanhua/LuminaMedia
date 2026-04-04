import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { QuotaService } from '../services/quota.service';
declare global {
    namespace Express {
        interface Request {
            session?: {
                user?: any;
            };
        }
    }
}
export declare class QuotaCheckMiddleware implements NestMiddleware {
    private quotaService;
    constructor(quotaService: QuotaService);
    use(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    private getFeatureFromPath;
}

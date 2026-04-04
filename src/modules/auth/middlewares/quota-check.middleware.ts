import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { QuotaService } from '../services/quota.service';

// 扩展Express Request接口以包含session属性
declare global {
  namespace Express {
    interface Request {
      session?: {
        user?: any;
      };
    }
  }
}

@Injectable()
export class QuotaCheckMiddleware implements NestMiddleware {
  constructor(private quotaService: QuotaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 获取租户ID和功能键
    const tenantId = req.headers['x-tenant-id'] as string ||
                    req.user?.tenantId ||
                    (req.session?.user as any)?.tenantId;

    // 定义需要检查配额的功能
    // 这里可以根据不同的路由路径来确定对应的功能键
    const featureKey = this.getFeatureFromPath(req.path, req.method);

    if (tenantId && featureKey) {
      try {
        // 检查配额
        const quotaInfo = await this.quotaService.checkQuota(tenantId, featureKey);

        if (!quotaInfo.hasQuota) {
          // 配额用尽，返回429 Too Many Requests
          return res.status(429).json({
            statusCode: 429,
            message: `配额已用尽，剩余配额: ${quotaInfo.remaining}`,
            error: 'Quota Exceeded',
            featureKey,
            resetTime: (await this.quotaService.getQuotaInfo(tenantId, featureKey)).resetTime,
          });
        }

        // 如果有配额，则消耗一个配额
        await this.quotaService.consumeQuota(tenantId, featureKey);

        // 添加配额信息到请求对象中，供后续处理器使用
        (req as any).quotaInfo = quotaInfo;
      } catch (error) {
        // 如果配额检查出错，记录但不影响请求继续处理
        console.warn('Quota check failed:', error.message);
      }
    }

    next();
  }

  /**
   * 从路径和方法中推断功能键
   */
  private getFeatureFromPath(path: string, method: string): string | null {
    // 根据不同的API路径来确定对应的功能键
    if (path.includes('/ai/') || path.includes('/analysis') || path.includes('/planning') || path.includes('/copywriting')) {
      return 'ai-analysis'; // AI分析功能配额
    } else if (path.includes('/publish') || path.includes('/matrix')) {
      return 'matrix-publishing'; // 矩阵发布功能配额
    } else if (path.includes('/customer') || path.includes('/profile')) {
      return 'customer-profile'; // 客户画像功能配额
    } else if (path.includes('/monitor') || path.includes('/social')) {
      return 'social-monitoring'; // 舆情监测功能配额
    } else if (path.includes('/government') || path.includes('/gov')) {
      return 'government-content'; // 政务内容功能配额
    }

    // 对于POST请求创建内容的，通常需要AI分析配额
    if (method === 'POST' && (path.includes('/content') || path.includes('/strategy') || path.includes('/campaign'))) {
      return 'ai-analysis';
    }

    return null; // 不需要配额检查的路径
  }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class AntiCrawlerService {
  detectAntiCrawler(response: any): boolean {
    // 简化实现
    return false;
  }

  bypassAntiCrawler(): any {
    // 简化实现
    return {};
  }

  getAntiCrawlerStats(): any {
    return {
      detected: 0,
      bypassed: 0,
    };
  }
}

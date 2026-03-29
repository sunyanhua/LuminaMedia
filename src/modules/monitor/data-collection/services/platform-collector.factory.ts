import { Injectable } from '@nestjs/common';
import { PlatformCollector } from './interfaces/platform-collector.interface';
import { PlatformType, CollectionMethod } from '../interfaces/data-collection.interface';

@Injectable()
export class PlatformCollectorFactory {
  private collectors = new Map<PlatformType, PlatformCollector>();

  registerCollector(platform: PlatformType, collector: PlatformCollector) {
    this.collectors.set(platform, collector);
  }

  getCollector(platform: PlatformType): PlatformCollector {
    const collector = this.collectors.get(platform);
    if (!collector) {
      throw new Error(`No collector registered for platform: ${platform}`);
    }
    return collector;
  }

  getAvailablePlatforms(): PlatformType[] {
    return Array.from(this.collectors.keys());
  }
}
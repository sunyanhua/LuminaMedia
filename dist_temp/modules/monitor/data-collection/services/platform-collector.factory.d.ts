import { PlatformCollector } from './interfaces/platform-collector.interface';
import { PlatformType } from '../interfaces/data-collection.interface';
export declare class PlatformCollectorFactory {
    private collectors;
    registerCollector(platform: PlatformType, collector: PlatformCollector): void;
    getCollector(platform: PlatformType): PlatformCollector;
    getAvailablePlatforms(): PlatformType[];
}

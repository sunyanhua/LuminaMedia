import { Platform } from '../../../shared/enums/platform.enum';
export declare class GenerateStrategyContentDto {
    targetPlatforms?: Platform[];
    contentTypes?: string[];
    tone?: 'formal' | 'casual' | 'friendly' | 'professional';
    excludeExisting?: string[];
}

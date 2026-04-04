import { Platform } from '../../../shared/enums/platform.enum';
import { CampaignType } from '../../../shared/enums/campaign-type.enum';
export declare class GenerateSimpleStrategyDto {
    goal: string;
    targetAudience?: string[];
    budget?: number;
    campaignType?: CampaignType;
    platforms?: Platform[];
    strategyType?: string;
    durationWeeks?: number;
}

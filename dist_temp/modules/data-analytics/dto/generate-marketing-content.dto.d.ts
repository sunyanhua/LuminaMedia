import { Platform } from '../../../shared/enums/platform.enum';
import { CampaignType } from '../../../shared/enums/campaign-type.enum';
export declare class GenerateMarketingContentDto {
    campaignId: string;
    campaignName: string;
    campaignType: CampaignType;
    targetAudience: Record<string, any>;
    budget: number;
    startDate?: string;
    endDate?: string;
    userId: string;
    targetPlatforms: Platform[];
    contentTypes?: string[];
    tone?: 'formal' | 'casual' | 'friendly' | 'professional';
    quantity?: number;
}

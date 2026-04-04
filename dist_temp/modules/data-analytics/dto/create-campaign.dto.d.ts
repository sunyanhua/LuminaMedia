import { CampaignType } from '../../../shared/enums/campaign-type.enum';
export declare class CreateCampaignDto {
    userId: string;
    name: string;
    campaignType: CampaignType;
    targetAudience?: Record<string, any>;
    budget: number;
    startDate?: Date;
    endDate?: Date;
}

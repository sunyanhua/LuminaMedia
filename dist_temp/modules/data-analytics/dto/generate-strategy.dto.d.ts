import { StrategyType } from '../../../shared/enums/strategy-type.enum';
import { GenerationMethod } from '../../../shared/enums/generation-method.enum';
export declare class GenerateStrategyDto {
    campaignId: string;
    strategyType?: StrategyType;
    generatedBy?: GenerationMethod;
    useGemini?: boolean;
}

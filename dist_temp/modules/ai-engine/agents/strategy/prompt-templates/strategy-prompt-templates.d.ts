import { AnalysisAgentOutput } from '../../analysis/interfaces/analysis-agent.interface';
import { EventInfo, HolidayInfo, BudgetInfo, DateRange } from '../interfaces/strategy-agent.interface';
export interface StrategyPromptTemplate {
    id: string;
    name: string;
    scenarios: string[];
    campaignTypes: string[];
    depthLevel: number;
    generatePrompt: (params: StrategyPromptParams) => string;
}
export interface StrategyPromptParams {
    analysisResults: AnalysisAgentOutput;
    currentEvents: EventInfo[];
    holidays: HolidayInfo[];
    budgetConstraints: BudgetInfo;
    timeline: DateRange;
    industryContext: string;
    customParams?: Record<string, any>;
}
export declare const standardStrategyTemplate: StrategyPromptTemplate;
export declare const productLaunchTemplate: StrategyPromptTemplate;
export declare const brandBuildingTemplate: StrategyPromptTemplate;
export declare const salesPromotionTemplate: StrategyPromptTemplate;
export declare function selectStrategyTemplate(scenario: string, campaignType: string, depthRequired?: number): StrategyPromptTemplate;
export declare const allStrategyTemplates: StrategyPromptTemplate[];

import { AnalysisAgentOutput } from '../../analysis/interfaces/analysis-agent.interface';

export interface EventInfo {
  id: string;
  title: string;
  description: string;
  date: string;
  relevance: 'high' | 'medium' | 'low';
  tags: string[];
}

export interface HolidayInfo {
  name: string;
  date: string;
  type: 'national' | 'cultural' | 'commercial';
  description: string;
  marketingOpportunity: boolean;
}

export interface BudgetInfo {
  totalBudget: number;
  currency: string;
  breakdown: {
    channel: string;
    amount: number;
    percentage: number;
  }[];
  constraints: string[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
  durationDays: number;
}

export interface StrategyTactic {
  name: string;
  description: string;
  targetAudience: string[];
  channels: string[];
  timeline: {
    startWeek: number;
    endWeek: number;
  };
  successMetrics: string[];
  requiredResources: string[];
}

export interface ChannelPlan {
  channel:
    | 'wechat'
    | 'xiaohongshu'
    | 'weibo'
    | 'douyin'
    | 'email'
    | 'sms'
    | 'offline'
    | 'other';
  name: string;
  targetAudience: string[];
  budgetAllocation: number;
  percentage: number;
  keyActions: string[];
  metrics: string[];
}

export interface TimelineItem {
  weekNumber: number;
  dateRange: string;
  keyActivities: string[];
  deliverables: string[];
  responsibleParty: string;
}

export interface BudgetItem {
  category: string;
  subcategory: string;
  amount: number;
  percentage: number;
  justification: string;
}

export interface StrategyAgentInput {
  analysisResults: AnalysisAgentOutput;
  currentEvents: EventInfo[];
  holidays: HolidayInfo[];
  budgetConstraints: BudgetInfo;
  timeline: DateRange;
}

export interface StrategyAgentOutput {
  campaignTheme: {
    name: string;
    slogan: string;
    visualStyle: string;
    keyMessages: string[];
    toneOfVoice:
      | 'formal'
      | 'casual'
      | 'enthusiastic'
      | 'professional'
      | 'friendly';
  };
  marketingStrategy: {
    objectives: string[];
    tactics: StrategyTactic[];
    channels: ChannelPlan[];
    targetAudienceSegments: string[];
  };
  activityPlan: {
    timeline: TimelineItem[];
    keyActions: string[];
    dependencies: string[];
    riskMitigation: string[];
  };
  budgetPlan: {
    totalBudget: number;
    currency: string;
    breakdown: BudgetItem[];
    roiEstimation: number;
    roiExplanation: string;
    contingencyBudget: number;
  };
  successMetrics: {
    kpis: {
      name: string;
      target: number;
      unit: string;
      measurementMethod: string;
    }[];
    measurementTimeline: string[];
    reportingFrequency: 'daily' | 'weekly' | 'monthly';
  };
  riskAssessment: {
    risks: {
      description: string;
      probability: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigationStrategy: string;
    }[];
    overallRiskLevel: 'low' | 'medium' | 'high';
  };
}

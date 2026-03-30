// 重新导出相关接口
import type {
  DemographicProfile,
  EconomicProfile,
  CulturalProfile,
  DigitalProfile,
} from './geo-analysis.interface';
import { RegionLevel } from './geo-analysis.interface';
import type { Competitor } from './geo-analysis.interface';
import { PriorityLevel } from './geo-analysis.interface';
import type {
  KeywordOpportunity,
  ContentGap,
  TechnicalIssue,
  LinkOpportunity,
} from './geo-analysis.interface';
export type {
  DemographicProfile,
  EconomicProfile,
  CulturalProfile,
  DigitalProfile,
} from './geo-analysis.interface';
export { RegionLevel } from './geo-analysis.interface';
export type { Competitor } from './geo-analysis.interface';
export { PriorityLevel } from './geo-analysis.interface';
export type {
  KeywordOpportunity,
  ContentGap,
  TechnicalIssue,
  LinkOpportunity,
} from './geo-analysis.interface';

export interface GeoOptimizationReport {
  reportId: string;
  tenantId: string;
  customerProfileId?: string;
  generatedAt: Date;
  timeframe: {
    start: Date;
    end: Date;
  };
  targetRegions: TargetRegion[];
  executiveSummary: ExecutiveSummary;
  regionalAnalysis: RegionalAnalysisSection;
  competitiveAnalysis: CompetitiveAnalysisSection;
  seoAnalysis: SeoAnalysisSection;
  opportunityAnalysis: OpportunityAnalysisSection;
  recommendations: RecommendationSection;
  implementationPlan: ImplementationPlan;
  appendices: Appendices;
}

export interface TargetRegion {
  regionId: string;
  regionName: string;
  regionLevel: RegionLevel;
  keyMetrics: {
    marketSize: number;
    growthRate: number;
    competitionIntensity: number;
    digitalMaturity: number;
    opportunityScore: number;
  };
}

export interface ExecutiveSummary {
  overview: string;
  keyFindings: string[];
  topOpportunities: string[];
  criticalThreats: string[];
  strategicRecommendations: string[];
  expectedOutcomes: string[];
}

export interface RegionalAnalysisSection {
  demographicProfile: {
    summary: string;
    keyInsights: string[];
    data: DemographicProfile;
  };
  economicProfile: {
    summary: string;
    keyInsights: string[];
    data: EconomicProfile;
  };
  culturalProfile: {
    summary: string;
    keyInsights: string[];
    data: CulturalProfile;
  };
  digitalProfile: {
    summary: string;
    keyInsights: string[];
    data: DigitalProfile;
  };
  regionalComparison: {
    comparisonMetrics: string[];
    regionRankings: RegionRanking[];
    strengthsByRegion: Record<string, string[]>;
    weaknessesByRegion: Record<string, string[]>;
  };
}

export interface RegionRanking {
  regionId: string;
  regionName: string;
  rank: number;
  score: number;
  keyStrengths: string[];
  keyWeaknesses: string[];
}

export interface CompetitiveAnalysisSection {
  marketOverview: {
    size: number;
    growth: number;
    trends: string[];
    drivers: string[];
  };
  competitorAnalysis: {
    competitors: CompetitorAnalysis[];
    competitiveMatrix: CompetitiveMatrix;
    marketShareDistribution: MarketShareDistribution[];
  };
  competitivePositioning: {
    ourPosition: CompetitivePosition;
    recommendedPosition: CompetitivePosition;
    positioningStrategy: string[];
  };
}

export interface CompetitorAnalysis {
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  strategies: string[];
  threatLevel: 'low' | 'medium' | 'high';
  customerSatisfaction: number;
  digitalPresence: number;
  geographicCoverage: string[];
}

export interface CompetitiveMatrix {
  dimensions: string[];
  positions: CompetitorPosition[];
}

export interface CompetitorPosition {
  competitor: string;
  scores: number[];
}

export interface MarketShareDistribution {
  competitor: string;
  share: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface CompetitivePosition {
  differentiation: string[];
  valueProposition: string[];
  targetSegments: string[];
  pricingStrategy: string;
  distributionChannels: string[];
}

export interface SeoAnalysisSection {
  keywordAnalysis: {
    topOpportunities: KeywordOpportunity[];
    competitiveKeywords: CompetitiveKeyword[];
    searchTrends: SearchTrend[];
  };
  contentAnalysis: {
    gaps: ContentGap[];
    optimizationOpportunities: ContentOptimization[];
    localizationNeeds: LocalizationNeed[];
  };
  technicalAnalysis: {
    issues: TechnicalIssue[];
    optimizationPriorities: TechnicalPriority[];
    performanceMetrics: PerformanceMetric[];
  };
  backlinkAnalysis: {
    opportunities: LinkOpportunity[];
    competitiveBacklinks: CompetitiveBacklink[];
    authorityMetrics: AuthorityMetric[];
  };
}

export interface CompetitiveKeyword {
  keyword: string;
  ourRanking: number;
  competitorRankings: CompetitorRanking[];
  difficulty: number;
  opportunity: number;
}

export interface CompetitorRanking {
  competitor: string;
  rank: number;
  url: string;
}

export interface SearchTrend {
  keyword: string;
  trendData: TrendDataPoint[];
  seasonality: string;
  growthRate: number;
}

export interface TrendDataPoint {
  date: string;
  volume: number;
}

export interface ContentOptimization {
  page: string;
  currentScore: number;
  targetScore: number;
  recommendations: string[];
  expectedImpact: number;
  effortRequired: 'low' | 'medium' | 'high';
}

export interface LocalizationNeed {
  region: string;
  needs: string[];
  priority: PriorityLevel;
  resourcesRequired: string[];
}

export interface TechnicalPriority {
  area: string;
  issue: string;
  priority: PriorityLevel;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface PerformanceMetric {
  metric: string;
  currentValue: number;
  industryAverage: number;
  targetValue: number;
  gap: number;
}

export interface CompetitiveBacklink {
  domain: string;
  backlinkCount: number;
  authorityScore: number;
  topPages: string[];
  acquisitionOpportunities: string[];
}

export interface AuthorityMetric {
  metric: string;
  ourScore: number;
  competitorScores: Record<string, number>;
  industryAverage: number;
}

export interface OpportunityAnalysisSection {
  marketOpportunities: MarketOpportunity[];
  productOpportunities: ProductOpportunity[];
  partnershipOpportunities: PartnershipOpportunity[];
  innovationOpportunities: InnovationOpportunity[];
  riskAssessment: RiskAssessment;
}

export interface MarketOpportunity {
  region: string;
  segment: string;
  size: number;
  growth: number;
  competitiveIntensity: 'low' | 'medium' | 'high';
  entryBarriers: string[];
  requiredCapabilities: string[];
  timeframe: string;
  estimatedValue: number;
}

export interface ProductOpportunity {
  productCategory: string;
  unmetNeeds: string[];
  marketSize: number;
  competitiveLandscape: string;
  developmentComplexity: 'low' | 'medium' | 'high';
  timeToMarket: string;
  estimatedRevenue: number;
}

export interface PartnershipOpportunity {
  partnerType: string;
  potentialPartners: string[];
  synergies: string[];
  valueProposition: string;
  contactStrategy: string;
  expectedBenefits: string[];
}

export interface InnovationOpportunity {
  area: string;
  technologyTrends: string[];
  customerNeeds: string[];
  competitiveAdvantage: string;
  developmentTimeline: string;
  investmentRequired: number;
}

export interface RiskAssessment {
  risks: Risk[];
  mitigationStrategies: Record<string, string[]>;
  overallRiskLevel: 'low' | 'medium' | 'high';
  monitoringRecommendations: string[];
}

export interface Risk {
  category: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  earlyWarningSigns: string[];
}

export interface RecommendationSection {
  strategicRecommendations: StrategicRecommendation[];
  tacticalRecommendations: TacticalRecommendation[];
  quickWins: QuickWin[];
  longTermInitiatives: LongTermInitiative[];
  priorityMatrix: PriorityMatrix;
}

export interface StrategicRecommendation {
  id: string;
  title: string;
  description: string;
  rationale: string;
  expectedOutcomes: string[];
  timeframe: string;
  resourcesRequired: string[];
  successMetrics: string[];
}

export interface TacticalRecommendation {
  id: string;
  strategicRecommendationId: string;
  title: string;
  description: string;
  actions: string[];
  responsibleTeam: string;
  timeline: string;
  dependencies: string[];
  successCriteria: string[];
}

export interface QuickWin {
  id: string;
  title: string;
  description: string;
  actions: string[];
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  owner: string;
}

export interface LongTermInitiative {
  id: string;
  title: string;
  description: string;
  phases: InitiativePhase[];
  totalDuration: string;
  totalInvestment: number;
  expectedRoi: number;
  keyMilestones: Milestone[];
}

export interface InitiativePhase {
  phase: number;
  name: string;
  objectives: string[];
  deliverables: string[];
  duration: string;
  resources: string[];
}

export interface Milestone {
  name: string;
  date: string;
  deliverables: string[];
  successCriteria: string[];
}

export interface PriorityMatrix {
  highImpactHighEffort: string[];
  highImpactLowEffort: string[];
  lowImpactHighEffort: string[];
  lowImpactLowEffort: string[];
}

export interface ImplementationPlan {
  overview: string;
  phases: ImplementationPhase[];
  resourceAllocation: ResourceAllocation;
  timeline: Timeline;
  riskManagement: RiskManagementPlan;
  monitoringAndEvaluation: MonitoringPlan;
}

export interface ImplementationPhase {
  phase: number;
  name: string;
  startDate: Date;
  endDate: Date;
  objectives: string[];
  keyActivities: string[];
  deliverables: string[];
  successCriteria: string[];
  dependencies: string[];
}

export interface ResourceAllocation {
  teamMembers: TeamMember[];
  budget: BudgetAllocation;
  toolsAndTechnology: string[];
  externalResources: string[];
}

export interface TeamMember {
  role: string;
  name: string;
  responsibilities: string[];
  timeCommitment: string;
}

export interface BudgetAllocation {
  totalBudget: number;
  categories: BudgetCategory[];
  contingency: number;
}

export interface BudgetCategory {
  category: string;
  amount: number;
  percentage: number;
  justification: string;
}

export interface Timeline {
  startDate: Date;
  endDate: Date;
  milestones: TimelineMilestone[];
  criticalPath: string[];
  bufferTime: number;
}

export interface TimelineMilestone {
  name: string;
  date: Date;
  dependencies: string[];
  owner: string;
}

export interface RiskManagementPlan {
  identifiedRisks: ManagedRisk[];
  mitigationStrategies: Record<string, string[]>;
  contingencyPlans: string[];
  riskOwners: Record<string, string>;
}

export interface ManagedRisk {
  risk: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  owner: string;
  trigger: string;
}

export interface MonitoringPlan {
  kpis: Kpi[];
  reportingSchedule: ReportingSchedule;
  evaluationCriteria: string[];
  adjustmentMechanisms: string[];
}

export interface Kpi {
  name: string;
  target: number;
  current: number;
  frequency: string;
  owner: string;
  dataSource: string;
}

export interface ReportingSchedule {
  frequency: string;
  recipients: string[];
  format: string;
  content: string[];
}

export interface Appendices {
  dataSources: DataSource[];
  methodology: Methodology;
  glossary: GlossaryTerm[];
  detailedCharts: ChartReference[];
  rawDataReferences: string[];
}

export interface DataSource {
  name: string;
  type: string;
  coverage: string;
  reliability: 'low' | 'medium' | 'high';
  updateFrequency: string;
  notes: string;
}

export interface Methodology {
  analysisApproach: string;
  dataCollectionMethods: string[];
  analyticalTechniques: string[];
  assumptions: string[];
  limitations: string[];
  validationMethods: string[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  context: string;
}

export interface ChartReference {
  chartId: string;
  title: string;
  type: string;
  page: number;
  description: string;
}

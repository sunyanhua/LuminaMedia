// 重新导出枚举类型
import { AnalysisType, AnalysisStatus, GeoAnalysisResult } from '../entities/geo-analysis-result.entity';
import { RegionLevel, RegionType } from '../entities/geo-region.entity';
import { PriorityLevel, SuggestionType, ImplementationStatus } from '../entities/seo-suggestion.entity';
export { AnalysisType, AnalysisStatus } from '../entities/geo-analysis-result.entity';
export { RegionLevel, RegionType } from '../entities/geo-region.entity';
export { PriorityLevel, SuggestionType, ImplementationStatus } from '../entities/seo-suggestion.entity';

export interface GeoAnalysisRequest {
  tenantId: string;
  customerProfileId?: string;
  targetRegionIds?: string[];
  targetRegionNames?: string[];
  analysisTypes: AnalysisType[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  competitors?: string[];
  industries?: string[];
  keywords?: string[];
  metrics?: string[];
  regionLevel?: RegionLevel;
  dataSources?: string[];
  options?: {
    includeVisualizations?: boolean;
    includeRecommendations?: boolean;
    language?: string;
    depth?: 'basic' | 'standard' | 'comprehensive';
  };
}

export interface GeoAnalysisResponse {
  analysisId: string;
  status: AnalysisStatus;
  results?: GeoAnalysisResult;
  visualizations?: GeoVisualization[];
  recommendations?: GeoRecommendation[];
  metadata: {
    processingTime: number;
    dataSourcesUsed: string[];
    algorithmVersion: string;
    generatedAt: Date;
  };
}

export interface GeoVisualization {
  id: string;
  type: 'map' | 'chart' | 'table' | 'heatmap' | 'network';
  title: string;
  description: string;
  data: any;
  format: 'png' | 'svg' | 'html' | 'json';
  interactive: boolean;
}

export interface GeoRecommendation {
  id: string;
  category: 'seo' | 'content' | 'marketing' | 'product' | 'partnership';
  title: string;
  description: string;
  priority: PriorityLevel;
  expectedImpact: number;
  implementationDifficulty: number;
  timeframe: string;
  estimatedCost?: number;
  requiredResources: string[];
  relatedRegions: string[];
}

export interface RegionProfile {
  regionId: string;
  regionName: string;
  regionLevel: RegionLevel;
  demographicProfile: DemographicProfile;
  economicProfile: EconomicProfile;
  culturalProfile: CulturalProfile;
  digitalProfile: DigitalProfile;
  competitiveLandscape: CompetitiveLandscape;
  opportunities: Opportunity[];
  threats: Threat[];
}

export interface DemographicProfile {
  population: number;
  density: number;
  ageDistribution: Record<string, number>;
  genderRatio: number;
  educationLevel: Record<string, number>;
  incomeDistribution: Record<string, number>;
  householdSize: number;
  urbanizationRate: number;
}

export interface EconomicProfile {
  gdp: number;
  gdpPerCapita: number;
  growthRate: number;
  industryStructure: Record<string, number>;
  unemploymentRate: number;
  inflationRate: number;
  consumptionIndex: number;
  investmentIndex: number;
}

export interface CulturalProfile {
  languages: Record<string, number>;
  religions: Record<string, number>;
  festivals: string[];
  customs: string[];
  taboos: string[];
  values: string[];
  mediaConsumption: Record<string, number>;
  entertainmentPreferences: string[];
}

export interface DigitalProfile {
  internetPenetration: number;
  smartphonePenetration: number;
  socialMediaUsage: Record<string, number>;
  ecommerceAdoption: number;
  digitalPaymentUsage: number;
  onlineTimePerDay: number;
  popularApps: string[];
  preferredDevices: string[];
}

export interface CompetitiveLandscape {
  marketSize: number;
  marketGrowth: number;
  competitionIntensity: number;
  marketConcentration: number;
  majorPlayers: Competitor[];
  entryBarriers: string[];
  competitiveAdvantages: string[];
  pricingStrategies: string[];
}

export interface Competitor {
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  strategies: string[];
  threatLevel: 'low' | 'medium' | 'high';
  customerSegments: string[];
  geographicFocus: string[];
}

export interface Opportunity {
  category: string;
  description: string;
  marketSize: number;
  growthPotential: number;
  entryDifficulty: 'low' | 'medium' | 'high';
  competitiveIntensity: 'low' | 'medium' | 'high';
  requiredCapabilities: string[];
  timeframe: string;
  estimatedValue: number;
}

export interface Threat {
  category: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  mitigationStrategies: string[];
}

export interface SeoAnalysis {
  keywordOpportunities: KeywordOpportunity[];
  contentGaps: ContentGap[];
  technicalIssues: TechnicalIssue[];
  localOptimizations: LocalOptimization[];
  linkOpportunities: LinkOpportunity[];
}

export interface KeywordOpportunity {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  difficulty: number;
  opportunityScore: number;
  searchIntent: string;
  relatedKeywords: string[];
  suggestedContent: string[];
}

export interface ContentGap {
  topic: string;
  searchDemand: number;
  existingCoverage: number;
  gapSize: number;
  targetAudience: string;
  contentFormats: string[];
  keyMessages: string[];
}

export interface TechnicalIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedPages: string[];
  impact: string;
  recommendation: string;
  priority: PriorityLevel;
}

export interface LocalOptimization {
  element: string;
  currentStatus: string;
  recommendation: string;
  culturalContext: string;
  regionalVariations: string[];
  implementationSteps: string[];
}

export interface LinkOpportunity {
  source: string;
  target: string;
  linkType: 'internal' | 'external';
  anchorText: string;
  relevance: number;
  authority: number;
  expectedImpact: number;
}


/**
 * 分析Agent接口定义
 * 用于生成市场洞察和目标客群分析
 */

/**
 * 分析Agent输入数据
 */
export interface AnalysisAgentInput {
  /** 客户数据样本 */
  customerData: UserProfile4D[];
  /** 行业背景 */
  industryContext: string;
  /** 业务目标 */
  businessGoals: string[];
  /** 知识库检索结果 */
  knowledgeBaseContext: string[];
}

/**
 * 分析Agent输出结果
 */
export interface AnalysisAgentOutput {
  /** 市场洞察 */
  marketInsights: {
    /** 市场趋势 */
    trends: string[];
    /** 市场机会 */
    opportunities: string[];
    /** 市场威胁 */
    threats: string[];
  };
  /** 目标客群 */
  targetAudience: {
    /** 目标客群分群 */
    segments: AudienceSegment[];
    /** 典型用户画像 */
    persona: PersonaDescription;
    /** 规模预估 */
    sizeEstimation: number;
  };
  /** 竞品分析 */
  competitorAnalysis: {
    /** 主要竞争对手 */
    mainCompetitors: CompetitorInfo[];
    /** 竞争优势 */
    competitiveAdvantage: string[];
    /** 差距分析 */
    gaps: string[];
  };
  /** 初步建议 */
  recommendations: string[];
}

/**
 * 目标客群分群
 */
export interface AudienceSegment {
  /** 分群名称 */
  name: string;
  /** 分群描述 */
  description: string;
  /** 特征标签 */
  characteristics: string[];
  /** 规模比例（百分比） */
  proportion: number;
  /** 优先级（1-5，5最高） */
  priority: number;
}

/**
 * 典型用户画像描述
 */
export interface PersonaDescription {
  /** 画像名称 */
  name: string;
  /** 人口统计信息 */
  demographics: {
    ageRange: string;
    gender: string;
    education: string;
    occupation: string;
    incomeLevel: string;
  };
  /** 行为特征 */
  behaviors: string[];
  /** 需求痛点 */
  painPoints: string[];
  /** 动机目标 */
  motivations: string[];
}

/**
 * 竞争对手信息
 */
export interface CompetitorInfo {
  /** 对手名称 */
  name: string;
  /** 市场份额（百分比） */
  marketShare: number;
  /** 优势 */
  strengths: string[];
  /** 劣势 */
  weaknesses: string[];
  /** 主要策略 */
  strategies: string[];
}

/**
 * 4维度用户画像（从SmartDataEngine导入）
 */
export interface UserProfile4D {
  // 基础生命周期维度
  basicLifecycle: {
    ageGroup: '18-25' | '26-35' | '36-45' | '46+';
    education: 'high_school' | 'bachelor' | 'master' | 'phd';
    familyRole: 'single' | 'married_no_kids' | 'married_with_kids';
    potentialValue: 'low' | 'medium' | 'high';
  };
  // 消费性格维度
  consumptionPersonality: {
    consumptionLevel: 'low' | 'medium' | 'high' | 'premium';
    shoppingWidth: 'narrow' | 'medium' | 'wide';
    decisionSpeed: 'fast' | 'medium' | 'slow';
  };
  // 实时状态维度
  realtimeStatus: {
    activityLevel: number;
    growthTrend: 'declining' | 'stable' | 'growing' | 'fast_growing';
    engagementScore: number;
  };
  // 社交与活动维度
  socialActivity: {
    fissionPotential: 'low' | 'medium' | 'high';
    activityPreference: string[];
    socialInfluence: number;
  };
}

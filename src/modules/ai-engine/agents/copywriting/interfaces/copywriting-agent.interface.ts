/**
 * 文案Agent接口定义
 * 用于生成各平台定制化文案和视觉建议
 */

import { StrategyAgentOutput } from '../../strategy/interfaces/strategy-agent.interface';

/**
 * 平台特性规格
 */
export interface PlatformSpec {
  /** 平台名称 */
  platform: 'wechat' | 'xiaohongshu' | 'weibo' | 'douyin' | 'other';
  /** 平台描述 */
  description: string;
  /** 内容类型 */
  contentType: 'article' | 'short_post' | 'video' | 'image' | 'carousel';
  /** 字数限制 */
  wordLimit?: number;
  /** 图片要求 */
  imageRequirements?: {
    /** 图片数量 */
    count: number;
    /** 尺寸要求 */
    dimensions: string[];
    /** 格式要求 */
    formats: string[];
    /** 风格建议 */
    styleSuggestions: string[];
  };
  /** 视频要求 */
  videoRequirements?: {
    /** 时长限制（秒） */
    durationLimit: number;
    /** 尺寸要求 */
    dimensions: string;
    /** 格式要求 */
    formats: string[];
    /** 内容要求 */
    contentRequirements: string[];
  };
  /** 标签要求 */
  hashtagRequirements?: {
    /** 标签数量 */
    count: number;
    /** 热门标签建议 */
    trendingSuggestions: string[];
    /** 品牌标签 */
    brandHashtags: string[];
  };
  /** 发布时间建议 */
  postingTimeSuggestions: string[];
  /** 互动建议 */
  engagementSuggestions: string[];
  /** 合规要求 */
  complianceRequirements: string[];
}

/**
 * 品牌指南
 */
export interface BrandGuideline {
  /** 品牌名称 */
  brandName: string;
  /** 品牌口号 */
  tagline: string;
  /** 品牌价值观 */
  brandValues: string[];
  /** 品牌个性 */
  brandPersonality: {
    /** 个性描述词 */
    adjectives: string[];
    /** 语调 */
    toneOfVoice:
      | 'formal'
      | 'casual'
      | 'enthusiastic'
      | 'professional'
      | 'friendly'
      | 'authoritative';
    /** 沟通风格 */
    communicationStyle: string[];
  };
  /** 视觉指南 */
  visualGuidelines: {
    /** 品牌色彩 */
    brandColors: string[];
    /** 字体规范 */
    typography: string[];
    /** 图像风格 */
    imageStyle: string[];
    /** 标志使用规范 */
    logoUsage: string[];
  };
  /** 内容指南 */
  contentGuidelines: {
    /** 关键词 */
    keywords: string[];
    /** 禁忌话题 */
    forbiddenTopics: string[];
    /** 推荐话题 */
    recommendedTopics: string[];
    /** 成功案例 */
    successStories: string[];
  };
  /** 客户画像 */
  customerPersonas: {
    /** 画像名称 */
    name: string;
    /** 特征描述 */
    characteristics: string[];
    /** 沟通方式 */
    communicationPreferences: string[];
  }[];
}

/**
 * 微信公众号内容
 */
export interface WechatContent {
  /** 文章标题 */
  title: string;
  /** 副标题 */
  subtitle?: string;
  /** 作者 */
  author?: string;
  /** 封面图片描述 */
  coverImageDescription: string;
  /** 摘要 */
  summary: string;
  /** 正文内容 */
  body: string;
  /** 正文分段 */
  sections: {
    /** 小标题 */
    heading: string;
    /** 内容 */
    content: string;
    /** 图片描述 */
    imageDescription?: string;
  }[];
  /** 文末引导 */
  callToAction: {
    /** 引导文案 */
    text: string;
    /** 链接 */
    link?: string;
    /** 二维码描述 */
    qrCodeDescription?: string;
  };
  /** 标签 */
  tags: string[];
  /** 原创声明 */
  originalDeclaration: boolean;
  /** 赞赏设置 */
  enableAppreciation: boolean;
}

/**
 * 小红书内容
 */
export interface XHSContent {
  /** 笔记标题 */
  title: string;
  /** 正文内容 */
  content: string;
  /** 图片描述列表 */
  imageDescriptions: string[];
  /** 话题标签 */
  hashtags: string[];
  /** 地理位置 */
  location?: string;
  /** @提及 */
  mentions: string[];
  /** 商品标签 */
  productTags: {
    /** 商品名称 */
    name: string;
    /** 价格 */
    price?: number;
    /** 购买链接 */
    link?: string;
  }[];
  /** 互动引导 */
  engagementPrompt: string;
}

/**
 * 微博内容
 */
export interface WeiboContent {
  /** 正文内容 */
  content: string;
  /** 图片描述 */
  imageDescriptions: string[];
  /** 视频描述 */
  videoDescription?: string;
  /** 话题标签 */
  hashtags: string[];
  /** @提及 */
  mentions: string[];
  /** 投票设置 */
  poll?: {
    /** 问题 */
    question: string;
    /** 选项 */
    options: string[];
    /** 截止时间 */
    endTime: string;
  };
  /** 地理位置 */
  location?: string;
  /** 互动引导 */
  engagementPrompt: string;
}

/**
 * 抖音内容
 */
export interface DouyinContent {
  /** 视频标题 */
  title: string;
  /** 视频脚本 */
  videoScript: {
    /** 场景描述 */
    scenes: {
      /** 场景序号 */
      sequence: number;
      /** 场景描述 */
      description: string;
      /** 镜头类型 */
      shotType: string;
      /** 时长（秒） */
      duration: number;
      /** 台词 */
      dialogue?: string;
      /** 背景音乐建议 */
      bgmSuggestion?: string;
    }[];
    /** 总时长 */
    totalDuration: number;
  };
  /** 文案描述 */
  caption: string;
  /** 话题标签 */
  hashtags: string[];
  /** @提及 */
  mentions: string[];
  /** 互动引导 */
  engagementPrompt: string;
  /** 购物车商品 */
  shoppingProducts?: {
    /** 商品名称 */
    name: string;
    /** 价格 */
    price: number;
    /** 商品链接 */
    link: string;
    /** 卖点 */
    sellingPoints: string[];
  }[];
}

/**
 * 图片建议
 */
export interface ImageSuggestion {
  /** 图片类型 */
  type: 'cover' | 'content' | 'product' | 'lifestyle' | 'infographic';
  /** 主题描述 */
  theme: string;
  /** 风格 */
  style:
    | 'realistic'
    | 'cartoon'
    | 'minimal'
    | 'vibrant'
    | 'professional'
    | 'casual';
  /** 色彩方案 */
  colorPalette: string[];
  /** 元素要求 */
  elements: string[];
  /** 文字叠加 */
  textOverlay?: string;
  /** 尺寸建议 */
  dimensions: string[];
  /** 参考图片描述 */
  referenceDescription?: string;
}

/**
 * 视频脚本
 */
export interface VideoScript {
  /** 视频类型 */
  type:
    | 'tutorial'
    | 'testimonial'
    | 'product_demo'
    | 'storytelling'
    | 'entertainment';
  /** 主题 */
  theme: string;
  /** 目标受众 */
  targetAudience: string[];
  /** 时长（秒） */
  duration: number;
  /** 场景列表 */
  scenes: VideoScene[];
  /** 旁白脚本 */
  voiceoverScript: string;
  /** 背景音乐建议 */
  bgmSuggestions: string[];
  /** 字幕要点 */
  subtitlePoints: string[];
}

/**
 * 视频场景
 */
export interface VideoScene {
  /** 场景序号 */
  sequence: number;
  /** 场景描述 */
  description: string;
  /** 镜头类型 */
  shotType:
    | 'wide'
    | 'medium'
    | 'closeup'
    | 'extreme_closeup'
    | 'overhead'
    | 'pov';
  /** 时长（秒） */
  duration: number;
  /** 视觉元素 */
  visualElements: string[];
  /** 文字叠加 */
  textOverlay?: string;
  /** 转场效果 */
  transition: 'cut' | 'fade' | 'wipe' | 'zoom' | 'none';
}

/**
 * 发布时间槽位
 */
export interface PublishSlot {
  /** 平台 */
  platform: 'wechat' | 'xiaohongshu' | 'weibo' | 'douyin';
  /** 发布日期 */
  date: string;
  /** 发布时间 */
  time: string;
  /** 内容类型 */
  contentType: string;
  /** 优先级 */
  priority: 'high' | 'medium' | 'low';
  /** 依赖关系 */
  dependencies?: string[];
  /** 备注 */
  notes?: string;
}

/**
 * 日历事件
 */
export interface CalendarEvent {
  /** 事件ID */
  id: string;
  /** 标题 */
  title: string;
  /** 日期 */
  date: string;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime?: string;
  /** 平台 */
  platform: string;
  /** 内容摘要 */
  contentSummary: string;
  /** 状态 */
  status: 'scheduled' | 'published' | 'pending' | 'cancelled';
  /** 负责人 */
  assignedTo: string;
}

/**
 * 合规检查项
 */
export interface ComplianceItem {
  /** 检查项名称 */
  name: string;
  /** 平台规则 */
  platformRule: string;
  /** 检查结果 */
  status: 'pass' | 'fail' | 'warning';
  /** 问题描述 */
  issueDescription?: string;
  /** 建议修正 */
  suggestedFix?: string;
}

/**
 * 法务审查点
 */
export interface LegalItem {
  /** 审查点名称 */
  name: string;
  /** 相关法规 */
  relevantRegulations: string[];
  /** 风险等级 */
  riskLevel: 'low' | 'medium' | 'high';
  /** 审查结果 */
  status: 'approved' | 'needs_review' | 'rejected';
  /** 审查意见 */
  comments?: string;
}

/**
 * 文案Agent输入数据
 */
export interface CopywritingAgentInput {
  /** 策划方案 */
  strategyPlan: StrategyAgentOutput;
  /** 平台特性 */
  platformSpecs: PlatformSpec[];
  /** 品牌指南 */
  brandGuidelines: BrandGuideline;
  /** 禁忌词列表 */
  forbiddenWords: string[];
  /** 自定义参数 */
  customParams?: Record<string, any>;
}

/**
 * 文案Agent输出结果
 */
export interface CopywritingAgentOutput {
  /** 各平台内容 */
  platformContents: {
    /** 微信公众号内容 */
    wechat: WechatContent;
    /** 小红书内容 */
    xiaohongshu: XHSContent;
    /** 微博内容 */
    weibo: WeiboContent;
    /** 抖音内容 */
    douyin: DouyinContent;
  };
  /** 视觉建议 */
  visualSuggestions: {
    /** 封面图建议 */
    coverImages: ImageSuggestion[];
    /** 内容配图建议 */
    contentImages: ImageSuggestion[];
    /** 视频脚本 */
    videoScripts: VideoScript[];
    /** 配色方案 */
    colorPalette: string[];
  };
  /** 排期计划 */
  schedulingPlan: {
    /** 发布时间表 */
    publishSchedule: PublishSlot[];
    /** 内容日历 */
    contentCalendar: CalendarEvent[];
    /** 优化建议 */
    optimizationTips: string[];
  };
  /** 合规检查 */
  complianceCheck: {
    /** 平台规则检查 */
    platformRules: ComplianceItem[];
    /** 法务审查点 */
    legalReview: LegalItem[];
    /** 风险评估 */
    riskAssessment: 'low' | 'medium' | 'high';
    /** 总体合规状态 */
    overallCompliance: 'compliant' | 'needs_revision' | 'non_compliant';
  };
  /** 生成元数据 */
  metadata: {
    /** 生成时间 */
    generatedAt: string;
    /** 使用模板 */
    templateUsed: string;
    /** 内容质量评分 */
    qualityScore: number;
    /** 预估互动效果 */
    estimatedEngagement: {
      /** 预估阅读量 */
      estimatedViews: number;
      /** 预估点赞数 */
      estimatedLikes: number;
      /** 预估评论数 */
      estimatedComments: number;
      /** 预估分享数 */
      estimatedShares: number;
    };
  };
}

/**
 * 风险评估等级
 */
export type RiskLevel = 'low' | 'medium' | 'high';

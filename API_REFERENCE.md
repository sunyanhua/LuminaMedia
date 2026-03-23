# LuminaMedia API 参考文档

## 概述

本文档提供 LuminaMedia（灵曜智媒）内容营销平台的完整 API 参考。系统基于 NestJS 框架开发，采用 RESTful API 设计原则。

### 基础信息
- **API 基础路径**: `http://localhost:3003`
- **API 版本**: v1
- **内容类型**: `application/json`
- **认证方式**: 暂未实现（开发演示阶段）

### 响应格式
所有 API 响应遵循统一格式：
```json
{
  "success": true|false,
  "message": "操作结果描述",
  "data": {...}, // 成功时返回的数据
  "error": {...}, // 失败时返回的错误信息
  "timestamp": "ISO时间戳"
}
```

### 错误处理
HTTP 状态码说明：
- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `204 No Content`: 资源删除成功
- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

## 模块概览

### 1. 数据分析模块 (`/api/v1/analytics/`)
- **用户行为追踪**: 记录和分析用户操作行为
- **营销活动管理**: 创建、管理和分析营销活动
- **营销策略生成**: AI生成营销策略方案
- **内容生成服务**: AI生成营销文案和内容
- **报告生成**: 生成各类分析报告
- **模拟数据管理**: 开发和测试用的模拟数据
- **演示功能**: 快速演示和场景模拟

### 2. 客户数据模块 (`/api/v1/customer-data/`)
- **客户档案管理**: 客户基本信息和管理
- **数据导入处理**: 文件上传和数据解析
- **客户分析服务**: 用户画像和消费行为分析
- **客户分群管理**: 基于特征进行客户分群

### 3. 仪表板模块 (`/api/v1/dashboard/`)
- **数据可视化**: 各类图表数据接口
- **实时监控**: 实时指标和数据展示
- **报告生成**: 看板报告导出功能

### 4. 基础应用模块 (`/`)
- **健康检查**: 系统状态监控

---

## 1. 数据分析模块 API

### 1.1 用户行为控制器

#### 追踪用户行为
```http
POST /api/v1/analytics/behavior/track
Content-Type: application/json
```

**请求体**:
```json
{
  "userId": "test-user-123",
  "sessionId": "session-001",
  "eventType": "CONTENT_CREATE",
  "eventData": {
    "contentType": "article",
    "length": 1200
  }
}
```

**响应**:
```json
{
  "success": true,
  "message": "Behavior tracked successfully",
  "data": {
    "id": "behavior-uuid",
    "userId": "test-user-123",
    "eventType": "CONTENT_CREATE",
    "timestamp": "2026-03-16T12:00:00.000Z"
  }
}
```

#### 获取用户行为分析
```http
GET /api/v1/analytics/behavior/{userId}
```

**查询参数**:
- `startDate`: 开始日期 (格式: YYYY-MM-DD)
- `endDate`: 结束日期 (格式: YYYY-MM-DD)

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": "test-user-123",
    "period": "2026-02-16 to 2026-03-16",
    "totalEvents": 156,
    "eventDistribution": {...},
    "insights": [...]
  }
}
```

#### 获取用户行为摘要
```http
GET /api/v1/analytics/behavior/{userId}/summary
```

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": "test-user-123",
    "engagementMetrics": {
      "totalSessions": 15,
      "avgSessionDuration": "12m 30s",
      "mostActiveHour": "14:00-15:00"
    },
    "summary": {
      "topEvent": "PAGE_VIEW",
      "recentActivity": "今天有5次活跃"
    }
  }
}
```

### 1.2 营销活动控制器

#### 创建营销活动
```http
POST /api/v1/analytics/campaigns
Content-Type: application/json
```

**请求体** (`CreateCampaignDto`):
```json
{
  "userId": "test-user-123",
  "customerProfileId": "profile-uuid-123",
  "name": "小红书春季美妆推广",
  "campaignType": "ONLINE",
  "targetAudience": {
    "demographics": {
      "ageRange": [18, 35],
      "gender": "female",
      "incomeLevel": "middle_to_high"
    },
    "interests": ["美妆", "护肤", "时尚"]
  },
  "budget": 50000,
  "startDate": "2026-04-01",
  "endDate": "2026-06-30"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "data": {
    "id": "campaign-uuid",
    "name": "小红书春季美妆推广",
    "campaignType": "ONLINE",
    "status": "PLANNING",
    "budget": 50000,
    "createdAt": "2026-03-16T12:00:00.000Z"
  }
}
```

#### 获取营销活动列表
```http
GET /api/v1/analytics/campaigns
```

**查询参数**:
- `userId`: 用户ID (可选)
- `status`: 活动状态 (可选)
- `page`: 页码，默认1
- `limit`: 每页数量，默认10

**响应**:
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "campaign-uuid-1",
        "name": "小红书春季美妆推广",
        "campaignType": "ONLINE",
        "status": "ACTIVE",
        "budget": 50000,
        "startDate": "2026-04-01"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### 获取营销活动详情
```http
GET /api/v1/analytics/campaigns/{id}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "campaign-uuid",
    "userId": "test-user-123",
    "name": "小红书春季美妆推广",
    "campaignType": "ONLINE",
    "targetAudience": {...},
    "budget": 50000,
    "status": "ACTIVE",
    "startDate": "2026-04-01",
    "endDate": "2026-06-30",
    "createdAt": "2026-03-16T12:00:00.000Z",
    "strategies": [...],
    "performance": {...}
  }
}
```

#### 更新营销活动
```http
PUT /api/v1/analytics/campaigns/{id}
Content-Type: application/json
```

**请求体**:
```json
{
  "status": "ACTIVE",
  "budget": 55000
}
```

#### 分析营销活动
```http
POST /api/v1/analytics/campaigns/{id}/analyze
```

**响应**:
```json
{
  "success": true,
  "message": "Campaign analysis completed",
  "data": {
    "insights": {
      "engagementRate": 65.5,
      "conversionRate": 12.3,
      "roi": 42.5
    },
    "recommendations": [
      "建议增加社交媒体投放预算",
      "考虑增加视频内容形式"
    ]
  }
}
```

### 1.3 营销策略控制器

#### 生成营销策略
```http
POST /api/v1/analytics/strategies/generate
Content-Type: application/json
```

**请求体** (`GenerateStrategyDto`):
```json
{
  "campaignId": "campaign-uuid",
  "strategyType": "CONTENT",
  "generatedBy": "AI_GENERATED",
  "useGemini": true
}
```

**参数说明**:
- `strategyType`: 策略类型，可选值: `CONTENT`, `CHANNEL`, `TIMING`, `BUDGET_ALLOCATION`
- `generatedBy`: 生成方式，可选值: `AI_GENERATED`, `TEMPLATE_BASED`
- `useGemini`: 是否使用Gemini AI，默认true

**响应**:
```json
{
  "success": true,
  "message": "Strategy generated successfully",
  "data": {
    "id": "strategy-uuid",
    "campaignId": "campaign-uuid",
    "strategyType": "CONTENT",
    "description": "基于CONTENT的AI生成营销策略",
    "campaignName": "小红书春季推广（优化版）",
    "coreIdea": "通过情感化内容建立品牌连接...",
    "xhsContent": "【春季焕新】...",
    "expectedROI": 42.5,
    "confidenceScore": 85,
    "aiGenerated": true,
    "targetAudienceAnalysis": {...},
    "recommendedExecutionTime": {...},
    "expectedPerformanceMetrics": {...},
    "executionSteps": [...],
    "riskAssessment": {...},
    "budgetAllocation": {...},
    "createdAt": "2026-03-16T12:00:00.000Z"
  },
  "insights": {
    "confidenceLevel": "高",
    "expectedImpact": "预期效果显著",
    "implementationComplexity": "中等"
  }
}
```

#### 获取活动策略列表
```http
GET /api/v1/analytics/strategies/campaign/{campaignId}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "campaignId": "campaign-uuid",
    "strategies": [
      {
        "id": "strategy-uuid-1",
        "strategyType": "CONTENT",
        "description": "内容营销策略",
        "expectedROI": 42.5,
        "confidenceScore": 85,
        "createdAt": "2026-03-16T12:00:00.000Z"
      }
    ],
    "summary": {
      "totalStrategies": 4,
      "avgConfidenceScore": 78.5,
      "totalExpectedROI": 152.3
    }
  }
}
```

#### 评估策略效果
```http
POST /api/v1/analytics/strategies/{id}/evaluate
```

**响应**:
```json
{
  "success": true,
  "message": "Strategy evaluation completed",
  "data": {
    "strategyId": "strategy-uuid",
    "evaluation": {
      "feasibilityScore": 8.5,
      "expectedImpact": 7.8,
      "resourceRequirements": "中等",
      "timeline": "4周",
      "recommendations": [...]
    }
  }
}
```

#### 获取推荐策略
```http
GET /api/v1/analytics/strategies/recommendations/{userId}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": "test-user-123",
    "recommendations": [
      {
        "strategyType": "CONTENT",
        "priority": "高",
        "reason": "基于用户近期行为分析",
        "expectedBenefits": "提升用户参与度25%"
      }
    ],
    "summary": {
      "totalRecommendations": 3,
      "topPriority": "CONTENT",
      "implementationTimeline": "2-4周"
    }
  }
}
```

#### 为策略生成内容
```http
POST /api/v1/analytics/strategies/{id}/generate-content
Content-Type: application/json
```

**请求体** (`GenerateStrategyContentDto`):
```json
{
  "targetPlatforms": ["XHS", "WECHAT_MP"],
  "contentTypes": ["promotional", "educational"],
  "tone": "friendly",
  "quantity": 2
}
```

**响应**:
```json
{
  "success": true,
  "message": "Content generated successfully for strategy",
  "data": {
    "strategyId": "strategy-uuid",
    "generatedContent": {
      "contents": [
        {
          "title": "春季焕新购物节",
          "platform": "XHS",
          "contentType": "promotional",
          "text": "【限时优惠】...",
          "hashtags": ["#春季购物", "#商场优惠"]
        }
      ],
      "recommendedPostingSchedule": [...],
      "qualityScore": 7.8
    },
    "contentPlatforms": ["XHS", "WECHAT_MP"]
  }
}
```

### 1.4 内容生成控制器

#### 生成单条文案
```http
POST /api/v1/analytics/content-generation/generate/text
Content-Type: application/json
```

**请求体** (`GenerateTextDto`):
```json
{
  "prompt": "为商场春季促销活动写一条小红书文案",
  "platform": "XHS",
  "tone": "enthusiastic",
  "targetAudience": "年轻女性",
  "hashtags": ["#春季购物", "#商场优惠"]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "content": "【春季焕新季】...",
    "qualityAssessment": {
      "score": 8.2,
      "strengths": ["吸引眼球", "符合平台风格"],
      "improvements": ["可增加更多表情符号"]
    },
    "processingTime": 2.3,
    "modelUsed": "Gemini-2.5-Flash"
  }
}
```

#### 生成营销内容包
```http
POST /api/v1/analytics/content-generation/generate/marketing-content
Content-Type: application/json
```

**请求体** (`GenerateMarketingContentDto`):
```json
{
  "campaignSummary": {
    "id": "campaign-uuid",
    "name": "商场春季焕新购物节",
    "campaignType": "HYBRID",
    "targetAudience": {...},
    "budget": 200000
  },
  "targetPlatforms": ["XHS", "WECHAT_MP"],
  "contentTypes": ["promotional", "educational"],
  "tone": "friendly",
  "quantity": 2
}
```

**响应**:
```json
{
  "success": true,
  "marketingContent": {
    "campaignId": "campaign-uuid",
    "contents": [
      {
        "id": "content-uuid-1",
        "title": "春季焕新购物指南",
        "platform": "XHS",
        "contentType": "educational",
        "text": "春季购物如何搭配？...",
        "mediaSuggestions": [...],
        "hashtags": ["#春季搭配", "#购物指南"],
        "callToAction": "点击了解更多"
      }
    ],
    "recommendedPostingSchedule": [
      {
        "platform": "XHS",
        "bestTimes": ["工作日14:00-16:00", "周末11:00-13:00"],
        "frequency": "每周2-3次"
      }
    ],
    "crossPlatformStrategy": {...},
    "generatedAt": "2026-03-16T12:00:00.000Z"
  },
  "processingTime": 5.8,
  "modelUsed": "Gemini-2.5-Flash"
}
```

#### 获取内容模板
```http
GET /api/v1/analytics/content-generation/templates
```

**查询参数**:
- `platform`: 平台类型，可选值: `XHS`, `WECHAT_MP` (可选)

**响应**:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template-xhs-promo",
        "name": "小红书促销模板",
        "platform": "XHS",
        "structure": {
          "intro": "【标题】",
          "body": "正文内容...",
          "cta": "行动号召",
          "hashtags": "#标签1 #标签2"
        },
        "variables": ["product", "discount", "deadline"],
        "examples": [...]
      }
    ],
    "count": 12
  }
}
```

#### 检查Gemini API可用性
```http
GET /api/v1/analytics/content-generation/status
```

**响应**:
```json
{
  "success": true,
  "data": {
    "geminiAvailable": true,
    "timestamp": "2026-03-16T12:00:00.000Z",
    "model": "gemini-2.5-flash",
    "responseTime": 1250
  }
}
```

### 1.5 报告控制器

#### 生成行为报告
```http
GET /api/v1/analytics/reports/behavior/{userId}
```

**响应**:
```json
{
  "success": true,
  "message": "Behavior report generated successfully",
  "data": {
    "report": {
      "userId": "test-user-123",
      "period": "最近30天",
      "summary": {
        "totalEvents": 156,
        "uniqueSessions": 24,
        "avgEngagementTime": "8m 45s"
      },
      "detailedAnalysis": {...},
      "insights": [...],
      "recommendations": [...]
    },
    "exportOptions": {
      "formats": ["json", "pdf", "csv"],
      "available": true
    }
  }
}
```

#### 生成活动报告
```http
GET /api/v1/analytics/reports/campaign/{campaignId}
```

**响应**:
```json
{
  "success": true,
  "message": "Campaign report generated successfully",
  "data": {
    "report": {
      "campaignId": "campaign-uuid",
      "name": "小红书春季美妆推广",
      "period": "2026-04-01 to 2026-06-30",
      "performance": {
        "budgetUsed": 42000,
        "roi": 42.5,
        "conversions": 1250
      },
      "strategyAnalysis": [...],
      "learnings": [...],
      "nextSteps": [...]
    },
    "exportOptions": {
      "formats": ["json", "pdf", "excel"],
      "available": true
    }
  }
}
```

#### 导出报告
```http
POST /api/v1/analytics/reports/export/{reportType}/{id}
```

**查询参数**:
- `format`: 导出格式，可选值: `json`, `pdf`, `csv`, `excel`

**响应**:
```json
{
  "success": true,
  "message": "Report exported as pdf",
  "data": {
    "downloadUrl": "/api/v1/analytics/reports/download/report-uuid.pdf",
    "filename": "campaign-report-20260316.pdf",
    "size": "1.2MB",
    "expiresAt": "2026-03-17T12:00:00.000Z"
  }
}
```

#### 获取每日活跃度可视化数据
```http
GET /api/v1/analytics/reports/visualization/daily-activity
```

**查询参数**:
- `userId`: 用户ID (可选)
- `days`: 天数，默认30

**响应**:
```json
{
  "success": true,
  "data": {
    "type": "line",
    "title": "用户每日活跃度",
    "labels": ["03-01", "03-02", "03-03", ...],
    "datasets": [
      {
        "label": "活跃用户数",
        "data": [45, 52, 48, ...],
        "borderColor": "#1890ff"
      }
    ],
    "options": {
      "responsive": true,
      "maintainAspectRatio": false
    }
  }
}
```

#### 获取事件分布可视化数据
```http
GET /api/v1/analytics/reports/visualization/event-distribution
```

**查询参数**:
- `userId`: 用户ID (可选)

**响应**:
```json
{
  "success": true,
  "data": {
    "type": "pie",
    "title": "用户事件类型分布",
    "labels": ["PAGE_VIEW", "CONTENT_CREATE", "PUBLISH_TASK", "LOGIN"],
    "datasets": [
      {
        "data": [45, 25, 15, 15],
        "backgroundColor": ["#1890ff", "#52c41a", "#faad14", "#f5222d"]
      }
    ],
    "options": {...}
  }
}
```

### 1.6 模拟数据控制器

#### 生成模拟数据
```http
POST /api/v1/analytics/mock/generate
Content-Type: application/json
```

**请求体**:
```json
{
  "userId": "test-user-123"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Mock data generated successfully",
  "data": {
    "userId": "test-user-123",
    "generated": {
      "userBehaviors": 50,
      "campaigns": 3,
      "strategies": 12
    },
    "timestamp": "2026-03-16T12:00:00.000Z"
  }
}
```

#### 重置模拟数据
```http
POST /api/v1/analytics/mock/reset
```

**查询参数**:
- `userId`: 用户ID (可选)

**响应**:
```json
{
  "success": true,
  "message": "Mock data reset successfully",
  "data": {
    "deleted": 65,
    "userId": "test-user-123",
    "timestamp": "2026-03-16T12:00:00.000Z"
  }
}
```

#### 获取模拟数据状态
```http
GET /api/v1/analytics/mock/status
```

**响应**:
```json
{
  "success": true,
  "data": {
    "status": {
      "totalUsers": 5,
      "totalBehaviors": 250,
      "totalCampaigns": 15,
      "totalStrategies": 60
    },
    "summary": {
      "lastGenerated": "2026-03-16T11:30:00.000Z",
      "avgDataPerUser": 50,
      "mostActiveUser": "test-user-123"
    }
  }
}
```

### 1.7 演示控制器

#### 快速启动完整演示流程
```http
POST /api/v1/analytics/demo/quick-start
```

**查询参数**:
- `userId`: 用户ID (可选)

**响应**:
```json
{
  "success": true,
  "message": "演示流程执行成功",
  "data": {
    "demoId": "demo-1742146800000",
    "customerProfile": {
      "id": "customer-profile-uuid",
      "name": "商场顾客数据",
      "description": "基于1000条商场顾客消费记录的模拟数据"
    },
    "segments": [
      {
        "id": "segment-uuid-1",
        "segmentName": "高价值VIP客户",
        "description": "高收入高消费群体，注重品质和体验",
        "memberCount": 150
      },
      {
        "id": "segment-uuid-2",
        "segmentName": "年轻时尚族群",
        "description": "18-30岁年轻人群，追求时尚和社交",
        "memberCount": 300
      },
      {
        "id": "segment-uuid-3",
        "segmentName": "家庭消费群体",
        "description": "30-50岁家庭人群，注重实用性和性价比",
        "memberCount": 350
      }
    ],
    "campaign": {
      "id": "campaign-uuid",
      "name": "商场春季焕新购物节",
      "budget": 200000,
      "status": "ACTIVE"
    },
    "strategies": [
      {
        "id": "strategy-uuid-1",
        "strategyType": "CONTENT",
        "confidenceScore": 85,
        "expectedROI": 42.5
      },
      {
        "id": "strategy-uuid-2",
        "strategyType": "CHANNEL",
        "confidenceScore": 78,
        "expectedROI": 35.2
      },
      {
        "id": "strategy-uuid-3",
        "strategyType": "TIMING",
        "confidenceScore": 82,
        "expectedROI": 28.7
      },
      {
        "id": "strategy-uuid-4",
        "strategyType": "BUDGET_ALLOCATION",
        "confidenceScore": 76,
        "expectedROI": 45.1
      }
    ],
    "contentGenerated": true,
    "contentPlatforms": ["XHS", "WECHAT_MP"]
  },
  "timestamp": "2026-03-16T12:00:00.000Z"
}
```

#### 获取商场场景数据
```http
GET /api/v1/analytics/demo/scenario/mall-customer
```

**响应**:
```json
{
  "success": true,
  "data": {
    "name": "商场顾客营销方案演示",
    "description": "模拟商场顾客数据，展示从数据导入到营销内容生成的全流程",
    "steps": [
      {
        "step": 1,
        "title": "数据导入",
        "description": "导入1000条商场顾客消费记录CSV文件",
        "dataSource": "demo-data/mall_customers.csv"
      },
      {
        "step": 2,
        "title": "客户分析",
        "description": "自动分析客户特征，生成用户画像和消费行为洞察",
        "analysisTypes": ["人口统计", "消费习惯", "兴趣偏好", "时间模式"]
      },
      {
        "step": 3,
        "title": "客户分群",
        "description": "基于分析结果将客户分为3个典型群体",
        "segments": ["高价值VIP客户", "年轻时尚族群", "家庭消费群体"]
      },
      {
        "step": 4,
        "title": "活动策划",
        "description": "创建'商场春季焕新购物节'营销活动",
        "budget": 200000,
        "duration": "3个月",
        "target": "提升商场客流量和消费额"
      },
      {
        "step": 5,
        "title": "策略生成",
        "description": "使用AI生成4种类型的营销策略",
        "strategies": ["内容策略", "渠道策略", "时间策略", "预算策略"]
      },
      {
        "step": 6,
        "title": "内容生成",
        "description": "为小红书和微信公众号生成营销内容",
        "platforms": ["小红书", "微信公众号"],
        "contentTypes": ["促销文案", "教育文章"]
      }
    ],
    "expectedOutcomes": [
      "完整的客户画像分析报告",
      "3个客户分群及特征描述",
      "营销活动策划方案",
      "4个AI生成的营销策略",
      "跨平台营销内容包"
    ],
    "estimatedTime": "2-3分钟"
  }
}
```

#### 重置演示数据
```http
DELETE /api/v1/analytics/demo/reset
```

**查询参数**:
- `userId`: 用户ID (可选)

**响应**:
```json
{
  "success": true,
  "message": "演示数据重置成功",
  "data": {
    "deleted": 25,
    "userId": "test-user-123",
    "timestamp": "2026-03-16T12:00:00.000Z"
  }
}
```

#### 获取演示状态
```http
GET /api/v1/analytics/demo/status
```

**响应**:
```json
{
  "success": true,
  "data": {
    "available": true,
    "features": [
      "客户档案创建",
      "客户分群分析",
      "营销活动策划",
      "AI营销策略生成",
      "多平台内容生成"
    ],
    "requirements": [
      "MySQL数据库连接",
      "Gemini API密钥（可选，支持回退模式）",
      "Node.js运行环境"
    ]
  }
}
```

#### 分步执行演示流程
```http
POST /api/v1/analytics/demo/step/{stepNumber}
Content-Type: application/json
```

**路径参数**:
- `stepNumber`: 步骤编号 (1-6)

**请求体**:
```json
{
  "stepData": {
    "description": "数据导入步骤"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "step": 1,
    "description": "数据导入步骤",
    "completed": true,
    "timestamp": "2026-03-16T12:00:00.000Z",
    "stepData": {
      "description": "数据导入步骤"
    }
  }
}
```

---

## 2. 客户数据模块 API

### 2.1 客户档案控制器

#### 创建客户档案
```http
POST /api/v1/customer-data/profiles
Content-Type: application/json
```

**请求体** (`CreateCustomerProfileDto`):
```json
{
  "customerName": "商场顾客数据",
  "customerType": "INDIVIDUAL",
  "industry": "RETAIL",
  "dataSources": [
    {
      "type": "CSV",
      "path": "demo-data/mall_customers.csv",
      "recordCount": 1000
    }
  ],
  "userId": "test-user-123"
}
```

**响应** (`CustomerProfile`):
```json
{
  "id": "profile-uuid",
  "customerName": "商场顾客数据",
  "customerType": "INDIVIDUAL",
  "industry": "RETAIL",
  "dataSources": [...],
  "profileData": {...},
  "behaviorInsights": {...},
  "userId": "test-user-123",
  "createdAt": "2026-03-16T12:00:00.000Z",
  "updatedAt": "2026-03-16T12:00:00.000Z"
}
```

#### 获取客户档案详情
```http
GET /api/v1/customer-data/profiles/{id}
```

#### 获取用户客户档案列表
```http
GET /api/v1/customer-data/profiles
```

**查询参数**:
- `userId`: 用户ID (必需)

**响应**:
```json
[
  {
    "id": "profile-uuid-1",
    "customerName": "商场顾客数据",
    "customerType": "INDIVIDUAL",
    "industry": "RETAIL",
    "createdAt": "2026-03-16T12:00:00.000Z"
  },
  {
    "id": "profile-uuid-2",
    "customerName": "电商平台用户",
    "customerType": "BUSINESS",
    "industry": "E_COMMERCE",
    "createdAt": "2026-03-15T10:30:00.000Z"
  }
]
```

#### 更新客户档案
```http
PATCH /api/v1/customer-data/profiles/{id}
Content-Type: application/json
```

**请求体** (`UpdateCustomerProfileDto`):
```json
{
  "customerName": "商场顾客数据（更新）",
  "dataSources": [...]
}
```

#### 删除客户档案
```http
DELETE /api/v1/customer-data/profiles/{id}
```

**响应**: `204 No Content`

#### 生成商场客户演示数据
```http
POST /api/v1/customer-data/profiles/{id}/generate-demo
```

**响应**:
```json
{
  "profile": {...},
  "importJobs": [...],
  "segments": [...]
}
```

#### 获取客户档案统计信息
```http
GET /api/v1/customer-data/profiles/{id}/stats
```

**响应**:
```json
{
  "profileName": "商场顾客数据",
  "industry": "RETAIL",
  "totalImportJobs": 3,
  "completedImports": 2,
  "totalRecords": 1000,
  "totalSegments": 3,
  "totalMembers": 800,
  "dataFreshness": "2026-03-15",
  "insightsCount": 15
}
```

#### 获取行业枚举列表
```http
GET /api/v1/customer-data/profiles/enums/industries
```

**响应**:
```json
{
  "industries": [
    {"value": "RETAIL", "label": "零售业"},
    {"value": "E_COMMERCE", "label": "电子商务"},
    {"value": "EDUCATION", "label": "教育"},
    {"value": "HEALTHCARE", "label": "医疗健康"},
    {"value": "FINANCE", "label": "金融"},
    {"value": "REAL_ESTATE", "label": "房地产"},
    {"value": "HOSPITALITY", "label": "酒店旅游"},
    {"value": "MANUFACTURING", "label": "制造业"},
    {"value": "TECHNOLOGY", "label": "科技"},
    {"value": "OTHER", "label": "其他"}
  ]
}
```

#### 获取客户类型枚举列表
```http
GET /api/v1/customer-data/profiles/enums/customer-types
```

**响应**:
```json
{
  "customerTypes": [
    {"value": "INDIVIDUAL", "label": "个人客户"},
    {"value": "BUSINESS", "label": "企业客户"},
    {"value": "GOVERNMENT", "label": "政府机构"},
    {"value": "NON_PROFIT", "label": "非营利组织"},
    {"value": "EDUCATIONAL", "label": "教育机构"}
  ]
}
```

### 2.2 数据导入控制器

#### 为客户档案创建数据导入任务
```http
POST /api/v1/customer-data/profiles/{profileId}/import
Content-Type: multipart/form-data
```

**表单参数**:
- `file`: CSV/Excel文件
- `sourceType`: 数据源类型
- `mappingRules`: JSON格式的字段映射规则 (可选)

**响应** (`DataImportJob`):
```json
{
  "id": "import-job-uuid",
  "customerProfileId": "profile-uuid",
  "sourceType": "CSV",
  "originalFilename": "mall_customers.csv",
  "filePath": "/uploads/mall_customers.csv",
  "status": "PENDING",
  "recordCount": 0,
  "processedCount": 0,
  "failedCount": 0,
  "mappingRules": {...},
  "createdAt": "2026-03-16T12:00:00.000Z"
}
```

#### 创建数据导入任务（通用接口）
```http
POST /api/v1/customer-data/import-jobs
Content-Type: application/json
```

**请求体** (`CreateImportJobDto`):
```json
{
  "customerProfileId": "profile-uuid",
  "sourceType": "CSV",
  "filePath": "/uploads/mall_customers.csv",
  "originalFilename": "mall_customers.csv",
  "mappingRules": {
    "customerId": "CustomerID",
    "gender": "Gender",
    "age": "Age",
    "annualIncome": "Annual Income (k$)",
    "spendingScore": "Spending Score (1-100)"
  }
}
```

#### 获取导入任务详情
```http
GET /api/v1/customer-data/import-jobs/{id}
```

#### 获取客户档案的导入任务列表
```http
GET /api/v1/customer-data/profiles/{profileId}/import-jobs
```

**响应**:
```json
[
  {
    "id": "import-job-uuid-1",
    "sourceType": "CSV",
    "originalFilename": "mall_customers.csv",
    "status": "COMPLETED",
    "recordCount": 1000,
    "processedCount": 1000,
    "failedCount": 0,
    "createdAt": "2026-03-16T12:00:00.000Z",
    "completedAt": "2026-03-16T12:05:00.000Z"
  }
]
```

#### 处理导入文件
```http
POST /api/v1/customer-data/import-jobs/{id}/process
Content-Type: application/json
```

**请求体** (`ProcessImportDto`):
```json
{
  "validationRules": {
    "requiredFields": ["CustomerID", "Gender", "Age"],
    "numericFields": ["Age", "Annual Income (k$)", "Spending Score (1-100)"],
    "rangeChecks": {
      "Age": {"min": 18, "max": 70},
      "Spending Score (1-100)": {"min": 1, "max": 100}
    }
  }
}
```

#### 取消导入任务
```http
POST /api/v1/customer-data/import-jobs/{id}/cancel
```

#### 重试失败的导入任务
```http
POST /api/v1/customer-data/import-jobs/{id}/retry
```

#### 获取导入任务统计信息
```http
GET /api/v1/customer-data/profiles/{profileId}/import-stats
```

**响应**:
```json
{
  "totalJobs": 5,
  "completedJobs": 4,
  "pendingJobs": 0,
  "processingJobs": 1,
  "failedJobs": 0,
  "totalRecords": 5000,
  "totalProcessed": 4000,
  "totalFailed": 0,
  "successRate": 100.0,
  "lastImport": "2026-03-16T12:00:00.000Z"
}
```

#### 验证导入数据
```http
POST /api/v1/customer-data/import-jobs/{id}/validate
Content-Type: application/json
```

**请求体**:
```json
{
  "validationRules": {
    "requiredFields": ["CustomerID", "Gender"],
    "dataTypes": {
      "Age": "number",
      "Annual Income (k$)": "number"
    }
  }
}
```

**响应**:
```json
{
  "isValid": true,
  "issues": [],
  "summary": {
    "totalRows": 1000,
    "validRows": 1000,
    "invalidRows": 0,
    "validationTime": "2.3s"
  }
}
```

#### 获取数据源类型枚举列表
```http
GET /api/v1/customer-data/enums/source-types
```

**响应**:
```json
{
  "sourceTypes": [
    {"value": "CSV", "label": "CSV文件"},
    {"value": "EXCEL", "label": "Excel文件"},
    {"value": "JSON", "label": "JSON文件"},
    {"value": "API", "label": "API接口"},
    {"value": "DATABASE", "label": "数据库"},
    {"value": "MANUAL", "label": "手动输入"}
  ]
}
```

#### 获取导入状态枚举列表
```http
GET /api/v1/customer-data/enums/import-statuses
```

**响应**:
```json
{
  "importStatuses": [
    {"value": "PENDING", "label": "待处理"},
    {"value": "PROCESSING", "label": "处理中"},
    {"value": "COMPLETED", "label": "已完成"},
    {"value": "FAILED", "label": "已失败"},
    {"value": "CANCELLED", "label": "已取消"},
    {"value": "VALIDATING", "label": "验证中"}
  ]
}
```

### 2.3 客户分析控制器

#### 获取客户画像分析报告
```http
GET /api/v1/customer-data/profiles/{profileId}/analysis
```

**响应** (完整分析报告对象):
```json
{
  "profileId": "profile-uuid",
  "generatedAt": "2026-03-16T12:00:00.000Z",
  "demographicAnalysis": {
    "ageDistribution": {...},
    "genderDistribution": {...},
    "incomeDistribution": {...}
  },
  "behaviorAnalysis": {
    "spendingPatterns": {...},
    "visitFrequency": {...},
    "preferredCategories": {...}
  },
  "segmentationSummary": {
    "totalSegments": 3,
    "segmentSizes": {...},
    "segmentCharacteristics": {...}
  },
  "keyInsights": [...],
  "recommendations": [...],
  "dataQuality": {
    "completeness": 98.5,
    "accuracy": 95.2,
    "timeliness": "实时"
  }
}
```

#### 获取客户分群列表
```http
GET /api/v1/customer-data/profiles/{profileId}/segments
```

**响应** (`CustomerSegment[]`):
```json
[
  {
    "id": "segment-uuid-1",
    "segmentName": "高价值VIP客户",
    "description": "高收入高消费群体，注重品质和体验",
    "criteria": {"minSpendingScore": 70, "minAnnualIncome": 100000},
    "memberCount": 150,
    "segmentInsights": {...},
    "createdAt": "2026-03-16T12:00:00.000Z"
  }
]
```

#### 执行客户分群
```http
POST /api/v1/customer-data/profiles/{profileId}/segments
Content-Type: application/json
```

**请求体** (`SegmentationRequestDto`):
```json
{
  "segmentationMethod": "RULE_BASED",
  "rules": [
    {
      "segmentName": "高价值客户",
      "conditions": [
        {"field": "SpendingScore", "operator": ">=", "value": 70},
        {"field": "AnnualIncome", "operator": ">=", "value": 100000}
      ]
    }
  ],
  "options": {
    "autoGenerateInsights": true,
    "generateCharts": true
  }
}
```

#### 获取客户分析仪表板数据
```http
GET /api/v1/customer-data/profiles/{profileId}/dashboard
```

**响应**:
```json
{
  "overview": {
    "totalCustomers": 1000,
    "activeCustomers": 850,
    "avgSpendingScore": 50.2,
    "avgAnnualIncome": 85000
  },
  "metrics": {
    "customerRetentionRate": 85.5,
    "avgTransactionValue": 350,
    "topCategory": "服饰",
    "peakVisitingHour": "15:00"
  },
  "recentActivity": [...],
  "quickInsights": [
    "35%的客户集中在25-35岁年龄段",
    "周末客流量比工作日高45%",
    "女性客户消费频次比男性高30%"
  ]
}
```

#### 重新生成分析报告
```http
POST /api/v1/customer-data/profiles/{profileId}/analysis/refresh
```

#### 获取客户分群详情
```http
GET /api/v1/customer-data/profiles/{profileId}/segments/{segmentId}
```

#### 更新客户分群
```http
POST /api/v1/customer-data/profiles/{profileId}/segments/{segmentId}
Content-Type: application/json
```

**请求体** (`Partial<CustomerSegment>`):
```json
{
  "segmentName": "高价值VIP客户（更新）",
  "description": "更新后的描述",
  "memberCount": 160
}
```

#### 删除客户分群
```http
POST /api/v1/customer-data/profiles/{profileId}/segments/{segmentId}/delete
```

**响应**: `204 No Content`

#### 导出分析报告（JSON格式）
```http
GET /api/v1/customer-data/profiles/{profileId}/analysis/export
```

**响应**:
```json
{
  "report": {...},
  "exportTimestamp": "2026-03-16T12:00:00.000Z",
  "format": "json",
  "version": "1.0"
}
```

#### 图表数据接口

##### 获取雷达图数据
```http
GET /api/v1/customer-data/profiles/{profileId}/charts/radar
```

**响应**:
```json
{
  "indicator": [
    {"name": "消费能力", "max": 100},
    {"name": "消费频次", "max": 100},
    {"name": "品牌忠诚度", "max": 100},
    {"name": "价格敏感度", "max": 100},
    {"name": "创新接受度", "max": 100}
  ],
  "seriesData": [
    {
      "name": "VIP客户",
      "value": [85, 78, 92, 45, 65]
    },
    {
      "name": "行业平均",
      "value": [65, 60, 70, 55, 60]
    }
  ],
  "industryBenchmark": {
    "retail": [65, 60, 70, 55, 60],
    "ecommerce": [70, 75, 65, 50, 80]
  }
}
```

##### 获取散点图数据
```http
GET /api/v1/customer-data/profiles/{profileId}/charts/scatter
```

**响应**:
```json
{
  "dataPoints": [
    {"x": 25, "y": 35, "value": 1, "group": "young"},
    {"x": 45, "y": 85, "value": 1, "group": "vip"}
  ],
  "segments": [
    {"name": "年轻族群", "color": "#1890ff"},
    {"name": "VIP客户", "color": "#52c41a"}
  ],
  "correlation": 0.78,
  "insights": "年龄与收入呈正相关，35-50岁年龄段消费能力最强"
}
```

##### 获取热力图数据
```http
GET /api/v1/customer-data/profiles/{profileId}/charts/heatmap
```

**响应**:
```json
{
  "xAxis": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  "yAxis": ["9-11", "11-13", "13-15", "15-17", "17-19", "19-21"],
  "data": [
    [12, 15, 18, 22, 25, 45, 52],
    [15, 18, 22, 28, 32, 48, 55],
    // ... 更多数据
  ],
  "peakPeriods": [
    {"time": "周六15-17", "value": 68, "description": "周末购物高峰"},
    {"time": "周五17-19", "value": 55, "description": "下班后购物"}
  ],
  "recommendations": [
    "周末增加促销活动",
    "周五傍晚安排限时折扣"
  ]
}
```

##### 获取漏斗图数据
```http
GET /api/v1/customer-data/profiles/{profileId}/charts/funnel
```

**响应**:
```json
{
  "funnelStages": ["访问", "浏览", "加购", "下单", "支付", "完成"],
  "conversionRates": [100, 65, 42, 28, 25, 23],
  "totalConversionRate": 23,
  "bottlenecks": [
    {"stage": "浏览→加购", "dropRate": 35.4, "reason": "商品信息不够吸引"},
    {"stage": "加购→下单", "dropRate": 33.3, "reason": "价格犹豫或物流担忧"}
  ],
  "optimizationSuggestions": [
    "优化商品详情页展示",
    "增加用户评价和实物图",
    "提供包邮或优惠券激励"
  ]
}
```

##### 获取桑基图数据
```http
GET /api/v1/customer-data/profiles/{profileId}/charts/sankey
```

**响应**:
```json
{
  "nodes": [
    {"name": "新客户", "category": "source"},
    {"name": "活跃客户", "category": "intermediate"},
    {"name": "流失客户", "category": "sink"}
  ],
  "links": [
    {"source": "新客户", "target": "活跃客户", "value": 800},
    {"source": "活跃客户", "target": "流失客户", "value": 150}
  ],
  "totalFlowIn": 1000,
  "totalFlowOut": 150,
  "netGrowth": 850,
  "retentionInsights": "客户留存率85%，主要流失发生在首月"
}
```

##### 获取所有图表数据
```http
GET /api/v1/customer-data/profiles/{profileId}/charts/all
```

**响应**:
```json
{
  "radar": {...},
  "scatter": {...},
  "heatmap": {...},
  "funnel": {...},
  "sankey": {...},
  "generatedAt": "2026-03-16T12:00:00.000Z",
  "profileId": "profile-uuid"
}
```

---

## 3. 仪表板模块 API

### 3.1 仪表板控制器

#### 获取仪表板概览统计
```http
GET /api/v1/dashboard/stats
```

**查询参数** (`DashboardStatsQueryDto`):
- `startDate`: 开始日期 (可选)
- `endDate`: 结束日期 (可选)
- `granularity`: 粒度，可选值: `daily`, `weekly`, `monthly` (默认 `daily`)

**响应** (`DashboardStats`):
```json
{
  "period": "2026-03-01 to 2026-03-16",
  "totalUsers": 1250,
  "activeUsers": 850,
  "totalCampaigns": 25,
  "activeCampaigns": 15,
  "totalContentGenerated": 320,
  "avgROI": 42.5,
  "userGrowth": 15.3,
  "engagementRate": 65.8,
  "conversionRate": 12.4,
  "topPerformingCampaign": {
    "id": "campaign-uuid",
    "name": "小红书春季美妆推广",
    "roi": 68.2
  },
  "trends": {
    "userGrowthTrend": "up",
    "engagementTrend": "stable",
    "conversionTrend": "up"
  }
}
```

#### 获取客户概览数据
```http
GET /api/v1/dashboard/customer-overview/{profileId}
```

**查询参数** (`CustomerOverviewQueryDto`):
- `timeRange`: 时间范围，可选值: `7d`, `30d`, `90d`, `custom` (默认 `30d`)
- `segmentId`: 分群ID (可选)

**响应** (`CustomerOverview`):
```json
{
  "profileId": "profile-uuid",
  "profileName": "商场顾客数据",
  "timeRange": "最近30天",
  "summary": {
    "totalCustomers": 1000,
    "newCustomers": 120,
    "churnedCustomers": 45,
    "netGrowth": 75,
    "retentionRate": 85.5
  },
  "demographics": {...},
  "behaviorMetrics": {...},
  "segmentationOverview": {...},
  "recentActivity": [...],
  "insights": [...]
}
```

#### 获取营销活动表现数据
```http
GET /api/v1/dashboard/marketing-performance/{campaignId}
```

**查询参数** (`MarketingPerformanceQueryDto`):
- `granularity`: 粒度，可选值: `daily`, `weekly`, `monthly` (默认 `daily`)
- `metrics`: 指标列表，逗号分隔 (可选)

**响应** (`MarketingPerformance`):
```json
{
  "campaignId": "campaign-uuid",
  "campaignName": "小红书春季美妆推广",
  "period": "2026-04-01 to 2026-04-30",
  "granularity": "daily",
  "budget": {
    "total": 50000,
    "used": 42000,
    "remaining": 8000,
    "utilizationRate": 84
  },
  "performance": {
    "impressions": 125000,
    "clicks": 8500,
    "conversions": 1250,
    "ctr": 6.8,
    "conversionRate": 14.7,
    "cpa": 33.6,
    "roi": 42.5
  },
  "timeline": [
    {
      "date": "2026-04-01",
      "impressions": 4000,
      "clicks": 280,
      "conversions": 42
    }
    // ... 更多日期数据
  ],
  "channelPerformance": {...},
  "audienceInsights": {...},
  "recommendations": [...]
}
```

#### 获取实时指标
```http
GET /api/v1/dashboard/real-time-metrics
```

**查询参数** (`RealTimeMetricsQueryDto`):
- `interval`: 时间间隔(秒)，默认30

**响应** (`RealTimeMetrics`):
```json
{
  "timestamp": "2026-03-16T12:00:00.000Z",
  "interval": 30,
  "activeUsers": 45,
  "apiCalls": {
    "total": 1250,
    "successRate": 98.5,
    "avgResponseTime": 125
  },
  "system": {
    "cpuUsage": 42.5,
    "memoryUsage": 65.8,
    "databaseConnections": 12
  },
  "businessMetrics": {
    "contentGenerated": 15,
    "strategiesGenerated": 8,
    "campaignsActive": 5
  },
  "alerts": [
    {
      "level": "warning",
      "message": "API响应时间超过200ms",
      "timestamp": "2026-03-16T11:58:30.000Z"
    }
  ]
}
```

#### 图表数据接口

##### 获取用户活跃度图表数据
```http
GET /api/v1/dashboard/charts/user-activity
```

**查询参数** (`ChartDataQueryDto`):
- `profileId`: 客户档案ID (可选)
- `days`: 天数，默认30
- `segmentId`: 分群ID (可选)

**响应** (`ChartData`):
```json
{
  "type": "line",
  "title": "用户活跃度趋势",
  "data": {
    "labels": ["03-01", "03-02", "03-03", ...],
    "datasets": [
      {
        "label": "日活跃用户",
        "data": [45, 52, 48, ...],
        "borderColor": "#1890ff",
        "backgroundColor": "rgba(24, 144, 255, 0.1)"
      }
    ]
  },
  "options": {
    "responsive": true,
    "plugins": {
      "legend": {"position": "top"}
    }
  }
}
```

##### 获取消费频次分布图表数据
```http
GET /api/v1/dashboard/charts/consumption-distribution
```

**响应**:
```json
{
  "type": "bar",
  "title": "消费频次分布",
  "data": {
    "labels": ["1-2次", "3-5次", "6-10次", "11-20次", "20+次"],
    "datasets": [
      {
        "label": "客户数量",
        "data": [350, 280, 195, 120, 55],
        "backgroundColor": ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"]
      }
    ]
  },
  "insights": "65%的客户每月消费3次以上，显示较高的客户忠诚度"
}
```

##### 获取地理位置分布图表数据
```http
GET /api/v1/dashboard/charts/geographic-distribution
```

**响应**:
```json
{
  "type": "map",
  "title": "客户地理位置分布",
  "data": {
    "regions": [
      {"name": "华东地区", "value": 420, "color": "#1890ff"},
      {"name": "华南地区", "value": 280, "color": "#52c41a"},
      {"name": "华北地区", "value": 195, "color": "#faad14"},
      {"name": "西南地区", "value": 85, "color": "#f5222d"},
      {"name": "其他地区", "value": 20, "color": "#722ed1"}
    ],
    "cities": [
      {"name": "上海", "value": 150, "lat": 31.2304, "lng": 121.4737},
      {"name": "北京", "value": 120, "lat": 39.9042, "lng": 116.4074}
    ]
  },
  "options": {...}
}
```

##### 获取营销ROI趋势图表数据
```http
GET /api/v1/dashboard/charts/roi-trend
```

**响应**:
```json
{
  "type": "line",
  "title": "营销ROI趋势",
  "data": {
    "labels": ["1月", "2月", "3月", "4月", "5月", "6月"],
    "datasets": [
      {
        "label": "ROI (%)",
        "data": [35.2, 38.5, 42.5, 45.8, 48.2, 52.1],
        "borderColor": "#52c41a",
        "fill": true,
        "backgroundColor": "rgba(82, 196, 26, 0.1)"
      },
      {
        "label": "行业平均",
        "data": [28.5, 30.2, 32.8, 35.5, 38.2, 40.5],
        "borderColor": "#d9d9d9",
        "borderDash": [5, 5]
      }
    ]
  },
  "insights": "ROI呈稳步上升趋势，6月达到52.1%，高于行业平均11.6个百分点"
}
```

##### 获取客户散点图数据
```http
GET /api/v1/dashboard/charts/customer-scatter
```

**响应**:
```json
{
  "type": "scatter",
  "title": "客户收入与消费分布",
  "data": {
    "datasets": [
      {
        "label": "VIP客户",
        "data": [
          {"x": 120, "y": 85, "r": 5},
          {"x": 95, "y": 78, "r": 4}
        ],
        "backgroundColor": "#52c41a"
      },
      {
        "label": "普通客户",
        "data": [
          {"x": 65, "y": 45, "r": 3},
          {"x": 55, "y": 38, "r": 3}
        ],
        "backgroundColor": "#1890ff"
      }
    ]
  },
  "options": {
    "scales": {
      "x": {"title": {"display": true, "text": "年收入 (k$)"}},
      "y": {"title": {"display": true, "text": "消费评分 (1-100)"}}
    }
  }
}
```

##### 获取客户雷达图数据
```http
GET /api/v1/dashboard/charts/customer-radar
```

**响应**:
```json
{
  "type": "radar",
  "title": "客户特征雷达图",
  "data": {
    "labels": ["消费能力", "消费频次", "品牌忠诚度", "价格敏感度", "创新接受度"],
    "datasets": [
      {
        "label": "VIP客户",
        "data": [85, 78, 92, 45, 65],
        "borderColor": "#52c41a",
        "backgroundColor": "rgba(82, 196, 26, 0.2)"
      },
      {
        "label": "年轻族群",
        "data": [65, 85, 60, 75, 90],
        "borderColor": "#1890ff",
        "backgroundColor": "rgba(24, 144, 255, 0.2)"
      }
    ]
  }
}
```

##### 获取热力图数据
```http
GET /api/v1/dashboard/charts/heatmap
```

**响应**:
```json
{
  "type": "heatmap",
  "title": "客户活跃时间热力图",
  "data": {
    "xLabels": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    "yLabels": ["9-11", "11-13", "13-15", "15-17", "17-19", "19-21"],
    "data": [
      [12, 15, 18, 22, 25, 45, 52],
      [15, 18, 22, 28, 32, 48, 55],
      // ... 更多数据
    ]
  },
  "options": {
    "plugins": {
      "legend": {
        "display": true,
        "position": "right"
      }
    }
  }
}
```

#### 生成数据看板报告
```http
POST /api/v1/dashboard/generate-report
Content-Type: application/json
```

**请求体** (`GenerateReportDto`):
```json
{
  "reportType": "CUSTOMER_ANALYSIS",
  "profileIds": ["profile-uuid-1", "profile-uuid-2"],
  "timeRange": "2026-03-01 to 2026-03-16",
  "includeCharts": true,
  "format": "pdf",
  "emailNotification": "user@example.com"
}
```

**响应** (`DashboardReportResponse`):
```json
{
  "success": true,
  "reportId": "report-uuid",
  "status": "PROCESSING",
  "estimatedCompletionTime": "2026-03-16T12:05:00.000Z",
  "downloadUrl": "/api/v1/dashboard/reports/report-uuid/download",
  "message": "报告生成任务已提交，完成后将通过邮件通知"
}
```

#### 导出数据看板数据
```http
GET /api/v1/dashboard/export
```

**查询参数** (`ExportDashboardDto`):
- `dataTypes`: 数据类型，逗号分隔，如 `stats,charts,metrics`
- `format`: 导出格式，可选值: `json`, `csv`, `excel`
- `timeRange`: 时间范围 (可选)

**响应**:
```json
{
  "downloadUrl": "/api/v1/dashboard/download/export-uuid.xlsx",
  "filename": "dashboard-export-20260316.xlsx",
  "size": "2.5MB",
  "expiresAt": "2026-03-17T12:00:00.000Z"
}
```

---

## 4. 基础应用模块 API

### 4.1 应用控制器

#### 获取应用状态
```http
GET /
```

**响应**:
```json
{
  "status": "running",
  "version": "2.0.0",
  "timestamp": "2026-03-16T12:00:00.000Z",
  "services": {
    "database": "connected",
    "geminiApi": "available",
    "redis": "not_configured"
  },
  "uptime": "5d 12h 30m",
  "memoryUsage": "45.2%"
}
```

---

## 枚举类型参考

### 数据分析模块枚举

#### 用户行为事件类型 (UserBehaviorEvent)
- `PAGE_VIEW`: 页面浏览
- `CONTENT_CREATE`: 创建内容
- `PUBLISH_TASK`: 发布任务
- `LOGIN`: 登录
- `LOGOUT`: 登出
- `CAMPAIGN_CREATE`: 创建营销活动
- `STRATEGY_GENERATE`: 生成策略
- `REPORT_VIEW`: 查看报告

#### 营销活动类型 (CampaignType)
- `ONLINE`: 线上活动
- `OFFLINE`: 线下活动
- `HYBRID`: 混合活动

#### 营销活动状态 (CampaignStatus)
- `PLANNING`: 规划中
- `ACTIVE`: 进行中
- `PAUSED`: 已暂停
- `COMPLETED`: 已完成
- `CANCELLED`: 已取消

#### 营销策略类型 (StrategyType)
- `CONTENT`: 内容策略
- `CHANNEL`: 渠道策略
- `TIMING`: 时机策略
- `BUDGET_ALLOCATION`: 预算分配策略

#### 生成方式 (GenerationMethod)
- `AI_GENERATED`: AI生成
- `TEMPLATE_BASED`: 模板生成
- `MANUAL`: 手动创建

### 客户数据模块枚举

#### 客户类型 (CustomerType)
- `INDIVIDUAL`: 个人客户
- `BUSINESS`: 企业客户
- `GOVERNMENT`: 政府机构
- `NON_PROFIT`: 非营利组织
- `EDUCATIONAL`: 教育机构

#### 行业分类 (Industry)
- `RETAIL`: 零售业
- `E_COMMERCE`: 电子商务
- `EDUCATION`: 教育
- `HEALTHCARE`: 医疗健康
- `FINANCE`: 金融
- `REAL_ESTATE`: 房地产
- `HOSPITALITY`: 酒店旅游
- `MANUFACTURING`: 制造业
- `TECHNOLOGY`: 科技
- `OTHER`: 其他

#### 数据导入状态 (DataImportStatus)
- `PENDING`: 待处理
- `PROCESSING`: 处理中
- `COMPLETED`: 已完成
- `FAILED`: 已失败
- `CANCELLED`: 已取消
- `VALIDATING`: 验证中

#### 数据源类型 (SourceType)
- `CSV`: CSV文件
- `EXCEL`: Excel文件
- `JSON`: JSON文件
- `API`: API接口
- `DATABASE`: 数据库
- `MANUAL`: 手动输入

### 平台枚举

#### 社交平台 (Platform)
- `XHS`: 小红书
- `WECHAT_MP`: 微信公众号
- `DOUYIN`: 抖音
- `WEIBO`: 微博
- `TIKTOK`: TikTok
- `FACEBOOK`: Facebook
- `INSTAGRAM`: Instagram
- `TWITTER`: Twitter

---

## 使用示例

### 完整演示流程示例

```bash
# 1. 启动完整演示
curl -X POST "http://localhost:3003/api/v1/analytics/demo/quick-start"

# 2. 查看生成的客户档案
curl "http://localhost:3003/api/v1/customer-data/profiles"

# 3. 查看营销活动
curl "http://localhost:3003/api/v1/analytics/campaigns"

# 4. 查看生成的策略
curl "http://localhost:3003/api/v1/analytics/strategies/campaign/{campaignId}"

# 5. 查看数据看板
curl "http://localhost:3003/api/v1/dashboard/stats"

# 6. 重置演示数据
curl -X DELETE "http://localhost:3003/api/v1/analytics/demo/reset"
```

### 快速测试示例

```bash
# 测试Gemini API连接
curl "http://localhost:3003/api/v1/analytics/content-generation/status"

# 生成模拟数据
curl -X POST "http://localhost:3003/api/v1/analytics/mock/generate" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-123"}'

# 创建营销活动
curl -X POST "http://localhost:3003/api/v1/analytics/campaigns" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "name": "测试活动",
    "campaignType": "ONLINE",
    "budget": 10000
  }'

# 生成营销策略
curl -X POST "http://localhost:3003/api/v1/analytics/strategies/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-uuid",
    "strategyType": "CONTENT",
    "useGemini": true
  }'
```

---

## 注意事项

1. **开发环境**: 所有API在开发环境下无需认证
2. **数据模拟**: 模拟数据控制器仅供开发测试使用
3. **Gemini API**: 需要配置有效的Gemini API密钥才能使用AI生成功能
4. **数据库**: 确保MySQL数据库正常运行并已执行迁移脚本
5. **文件上传**: 数据导入API支持multipart/form-data格式的文件上传
6. **CORS**: 前端应用需要配置正确的CORS域名

## 版本信息

- **API版本**: v1
- **文档版本**: 1.0.0
- **更新日期**: 2026-03-18
- **兼容性**: 向后兼容现有客户端

---

**技术支持**: 如遇API使用问题，请参考具体模块的错误响应信息，或联系开发团队。所有API遵循RESTful设计原则，使用标准HTTP状态码和JSON响应格式。
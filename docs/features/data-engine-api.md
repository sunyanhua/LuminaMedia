# 数据引擎API文档

## 概述

本文档详细描述 SmartDataEngine 的所有 REST API 接口。所有 API 均遵循 RESTful 设计原则，使用 JSON 格式进行数据交换。

## 基础信息

### 基础URL
```
http://localhost:3003/api
```

### 认证
所有 API 都需要 Bearer Token 认证：
```http
Authorization: Bearer <jwt_token>
```

### 公共请求头
```http
Content-Type: application/json
Accept: application/json
X-Tenant-ID: <tenant_id>  # 多租户标识
```

### 响应格式
#### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": "2026-03-29T10:30:00Z"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": { ... }
  },
  "timestamp": "2026-03-29T10:30:00Z"
}
```

## 数据导入API

### 导入Excel文件
```http
POST /data-engine/import/excel
```

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| file | File | 是 | Excel文件（.xlsx, .xls） |
| mappingStrategy | string | 否 | 映射策略：auto(自动), template(模板), manual(手动) |
| templateId | string | 否 | 模板ID（使用模板映射时） |
| skipHeaderRows | number | 否 | 跳过的表头行数，默认1 |

#### 请求示例
```bash
curl -X POST http://localhost:3003/api/data-engine/import/excel \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-ID: <tenant_id>" \
  -F "file=@data.xlsx" \
  -F "mappingStrategy=auto"
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "jobId": "imp_123456789",
    "status": "processing",
    "totalRecords": 1000,
    "processedRecords": 0,
    "estimatedTimeRemaining": "00:05:00"
  },
  "message": "文件上传成功，开始处理"
}
```

### 导入CSV文件
```http
POST /data-engine/import/csv
```

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| file | File | 是 | CSV文件 |
| encoding | string | 否 | 文件编码：utf-8, gbk, gb2312，默认utf-8 |
| delimiter | string | 否 | 分隔符：逗号, 分号, 制表符，默认逗号 |
| hasHeader | boolean | 否 | 是否包含表头，默认true |

#### 响应格式
同Excel导入。

### 接收API数据
```http
POST /data-engine/import/api
```

#### 请求体
```json
{
  "data": [
    {
      "customer_name": "张三",
      "mobile": "13800138000",
      "purchase_amount": 299.99,
      "purchase_date": "2026-03-29"
    }
  ],
  "dataSource": "crm_system",
  "importMode": "upsert", // insert, update, upsert
  "uniqueKey": ["customer_name", "mobile"]
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "jobId": "api_123456789",
    "importedCount": 1,
    "skippedCount": 0,
    "errorCount": 0,
    "errors": []
  },
  "message": "数据接收成功"
}
```

### 查询导入状态
```http
GET /data-engine/import/status/{jobId}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "jobId": "imp_123456789",
    "status": "completed",
    "totalRecords": 1000,
    "processedRecords": 1000,
    "successRecords": 998,
    "errorRecords": 2,
    "startTime": "2026-03-29T10:30:00Z",
    "endTime": "2026-03-29T10:35:00Z",
    "errors": [
      {
        "row": 45,
        "field": "mobile",
        "error": "手机号格式不正确",
        "value": "13800138"
      }
    ]
  },
  "message": "导入任务完成"
}
```

## 字段映射API

### 分析表头映射关系
```http
POST /data-engine/field-mapping/analyze
```

#### 请求体
```json
{
  "headers": ["顾客名", "手机", "消费额", "购买时间"],
  "sampleData": [
    ["张三", "13800138000", "299.99", "2026-03-29"]
  ],
  "industry": "零售",
  "preferredDimensions": ["基础信息", "联系方式", "消费行为", "时间戳"]
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "mappingId": "map_123456789",
    "proposedMapping": {
      "顾客名": "customer_name",
      "手机": "mobile",
      "消费额": "purchase_amount",
      "购买时间": "purchase_date"
    },
    "confidenceScores": {
      "顾客名": 0.95,
      "手机": 0.98,
      "消费额": 0.92,
      "购买时间": 0.96
    },
    "standardFields": [
      {
        "field": "customer_name",
        "dimension": "基础信息",
        "description": "客户姓名",
        "dataType": "string"
      }
    ]
  },
  "message": "表头分析完成"
}
```

### 确认映射关系
```http
POST /data-engine/field-mapping/confirm
```

#### 请求体
```json
{
  "mappingId": "map_123456789",
  "confirmedMapping": {
    "顾客名": "customer_name",
    "手机": "mobile",
    "消费额": "purchase_amount",
    "购买时间": "purchase_date"
  },
  "saveAsTemplate": true,
  "templateName": "零售行业标准映射"
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "templateId": "tpl_123456789",
    "mappingRules": { ... }
  },
  "message": "映射关系确认成功，已保存为模板"
}
```

### 获取映射模板
```http
GET /data-engine/field-mapping/templates
```

#### 查询参数
| 参数 | 类型 | 描述 |
|------|------|------|
| industry | string | 行业筛选 |
| page | number | 页码，默认1 |
| limit | number | 每页数量，默认20 |

#### 响应示例
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "tpl_123456789",
        "name": "零售行业标准映射",
        "industry": "零售",
        "fieldCount": 50,
        "createdAt": "2026-03-28T15:30:00Z",
        "usageCount": 124
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  },
  "message": "获取模板列表成功"
}
```

## 标签计算API

### 批量标签计算
```http
POST /data-engine/tag-calculation/batch
```

#### 请求体
```json
{
  "customerIds": ["cust_001", "cust_002", "cust_003"],
  "tagTypes": ["rfm", "consumption_level", "activity_score"],
  "calculationMode": "incremental", // full, incremental
  "timeRange": {
    "start": "2026-01-01",
    "end": "2026-03-29"
  },
  "priority": "normal" // low, normal, high
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "jobId": "tag_123456789",
    "totalCustomers": 3,
    "estimatedTime": "00:02:00",
    "queuePosition": 5
  },
  "message": "标签计算任务已提交"
}
```

### 查询计算任务状态
```http
GET /data-engine/tag-calculation/jobs/{jobId}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "jobId": "tag_123456789",
    "status": "completed",
    "progress": 100,
    "totalCustomers": 3,
    "processedCustomers": 3,
    "results": {
      "rfm": {
        "calculated": 3,
        "errors": 0
      },
      "consumption_level": {
        "calculated": 3,
        "errors": 0
      },
      "activity_score": {
        "calculated": 3,
        "errors": 0
      }
    },
    "startTime": "2026-03-29T10:30:00Z",
    "endTime": "2026-03-29T10:32:00Z"
  },
  "message": "标签计算任务完成"
}
```

### 增量标签更新
```http
POST /data-engine/tag-calculation/incremental
```

#### 请求体
```json
{
  "trigger": "data_update", // data_update, schedule, manual
  "updateSince": "2026-03-28T00:00:00Z",
  "tagTypes": ["activity_score", "growth_trend"]
}
```

## 用户画像API

### 获取用户画像
```http
GET /data-engine/user-profile/{customerId}
```

#### 查询参数
| 参数 | 类型 | 描述 |
|------|------|------|
| includeDimensions | string | 包含的维度，逗号分隔：basicLifecycle,consumptionPersonality,realtimeStatus,socialActivity |
| detailLevel | string | 详细程度：basic, standard, full |

#### 响应示例
```json
{
  "success": true,
  "data": {
    "customerId": "cust_001",
    "profile": {
      "basicLifecycle": {
        "ageGroup": "26-35",
        "education": "bachelor",
        "familyRole": "married_no_kids",
        "potentialValue": "high"
      },
      "consumptionPersonality": {
        "consumptionLevel": "high",
        "shoppingWidth": "wide",
        "decisionSpeed": "medium"
      },
      "realtimeStatus": {
        "activityLevel": 85,
        "growthTrend": "growing",
        "engagementScore": 78
      },
      "socialActivity": {
        "fissionPotential": "high",
        "activityPreference": ["健身", "旅游", "美食"],
        "socialInfluence": 65
      }
    },
    "tags": [
      {
        "tag": "premium_customer",
        "category": "价值分层",
        "value": "高价值客户",
        "confidence": 0.92,
        "updatedAt": "2026-03-29T10:00:00Z"
      }
    ],
    "lastUpdated": "2026-03-29T10:30:00Z"
  },
  "message": "获取用户画像成功"
}
```

### 批量查询用户画像
```http
POST /data-engine/user-profile/query
```

#### 请求体
```json
{
  "customerIds": ["cust_001", "cust_002", "cust_003"],
  "filters": {
    "consumptionLevel": ["high", "premium"],
    "ageGroup": ["26-35", "36-45"]
  },
  "sortBy": "activityLevel",
  "sortOrder": "desc",
  "page": 1,
  "limit": 10
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "profiles": [
      { "customerId": "cust_001", "profile": { ... } },
      { "customerId": "cust_002", "profile": { ... } }
    ],
    "total": 2,
    "page": 1,
    "limit": 10,
    "pages": 1
  },
  "message": "批量查询成功"
}
```

### 用户分群分析
```http
GET /data-engine/user-profile/segments
```

#### 查询参数
| 参数 | 类型 | 描述 |
|------|------|------|
| segmentationRule | string | 分群规则：rfm, consumption_level, activity_level |
| minSegmentSize | number | 最小分群大小，默认10 |
| maxSegments | number | 最大分群数量，默认10 |

#### 响应示例
```json
{
  "success": true,
  "data": {
    "segmentationRule": "rfm",
    "segments": [
      {
        "segmentId": "seg_001",
        "name": "高价值活跃客户",
        "criteria": {
          "recency": "<=30",
          "frequency": ">=5",
          "monetary": ">=1000"
        },
        "customerCount": 245,
        "percentage": 12.5,
        "characteristics": {
          "avgConsumptionLevel": "high",
          "avgActivityLevel": 88,
          "topInterests": ["奢侈品", "旅游", "高端餐饮"]
        }
      }
    ],
    "totalCustomers": 1960,
    "generatedAt": "2026-03-29T10:30:00Z"
  },
  "message": "用户分群分析完成"
}
```

## 数据质量API

### 获取质量规则
```http
GET /data-engine/data-quality/rules
```

#### 查询参数
| 参数 | 类型 | 描述 |
|------|------|------|
| table | string | 表名筛选 |
| severity | string | 严重程度：critical, high, medium, low |
| enabled | boolean | 是否启用 |

#### 响应示例
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "rule_001",
        "name": "mobile_phone_completeness",
        "table": "customer_profiles",
        "field": "mobile",
        "condition": "IS NOT NULL AND LENGTH(mobile) = 11",
        "threshold": 0.95,
        "severity": "high",
        "enabled": true,
        "lastExecuted": "2026-03-29T09:00:00Z",
        "lastResult": {
          "passed": true,
          "actualValue": 0.97,
          "message": "通过：手机号完整度97%"
        }
      }
    ],
    "total": 45,
    "critical": 5,
    "high": 15,
    "medium": 20,
    "low": 5
  },
  "message": "获取质量规则成功"
}
```

### 执行质量扫描
```http
POST /data-engine/data-quality/scan
```

#### 请求体
```json
{
  "ruleIds": ["rule_001", "rule_002", "rule_003"],
  "scope": {
    "tables": ["customer_profiles", "purchase_records"],
    "sampleSize": 1000,
    "timeRange": {
      "start": "2026-03-01",
      "end": "2026-03-29"
    }
  },
  "executionMode": "full" // quick, full
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "scanId": "scan_123456789",
    "status": "completed",
    "totalRules": 3,
    "passedRules": 2,
    "failedRules": 1,
    "results": [
      {
        "ruleId": "rule_001",
        "ruleName": "mobile_phone_completeness",
        "passed": true,
        "actualValue": 0.97,
        "threshold": 0.95,
        "message": "通过：手机号完整度97%"
      },
      {
        "ruleId": "rule_002",
        "ruleName": "email_format_check",
        "passed": false,
        "actualValue": 0.82,
        "threshold": 0.90,
        "message": "失败：邮箱格式正确率82%，低于阈值90%",
        "details": {
          "sampleErrors": [
            "invalid_email@",
            "missing_domain.com"
          ]
        }
      }
    ],
    "startTime": "2026-03-29T10:30:00Z",
    "endTime": "2026-03-29T10:35:00Z"
  },
  "message": "质量扫描完成"
}
```

### 获取质量报告
```http
GET /api/data-engine/data-quality/reports
```

#### 查询参数
| 参数 | 类型 | 描述 |
|------|------|------|
| period | string | 报告周期：daily, weekly, monthly |
| date | string | 报告日期，格式：YYYY-MM-DD |
| format | string | 报告格式：json, pdf, html |

#### 响应示例（JSON格式）
```json
{
  "success": true,
  "data": {
    "reportId": "report_123456789",
    "period": "daily",
    "date": "2026-03-29",
    "summary": {
      "totalTables": 15,
      "totalFields": 245,
      "totalRules": 45,
      "overallScore": 92.5,
      "trend": "improving" // improving, stable, declining
    },
    "bySeverity": {
      "critical": { "total": 5, "passed": 5, "score": 100 },
      "high": { "total": 15, "passed": 14, "score": 93.3 },
      "medium": { "total": 20, "passed": 18, "score": 90 },
      "low": { "total": 5, "passed": 5, "score": 100 }
    },
    "byTable": [
      {
        "table": "customer_profiles",
        "totalRules": 12,
        "passed": 11,
        "score": 91.7,
        "criticalIssues": 0
      }
    ],
    "topIssues": [
      {
        "ruleId": "rule_002",
        "ruleName": "email_format_check",
        "table": "customer_profiles",
        "field": "email",
        "severity": "high",
        "currentValue": 0.82,
        "threshold": 0.90,
        "impact": "可能影响营销邮件送达率"
      }
    ],
    "recommendations": [
      "修复customer_profiles.email字段格式问题",
      "考虑增加purchase_records.purchase_date时效性检查"
    ],
    "generatedAt": "2026-03-29T11:00:00Z"
  },
  "message": "获取质量报告成功"
}
```

## 错误码

| 错误码 | HTTP状态 | 描述 |
|--------|-----------|------|
| DE001 | 400 | 参数验证失败 |
| DE002 | 401 | 认证失败 |
| DE003 | 403 | 权限不足 |
| DE004 | 404 | 资源不存在 |
| DE005 | 409 | 资源冲突 |
| DE006 | 422 | 业务逻辑错误 |
| DE007 | 429 | 请求过于频繁 |
| DE008 | 500 | 服务器内部错误 |
| DE009 | 503 | 服务暂时不可用 |

## 速率限制

- **普通用户**: 100 请求/分钟
- **API客户端**: 1000 请求/分钟
- **批量操作**: 10 请求/分钟

超出限制将返回429状态码。

## 版本控制

API版本通过请求头指定：
```http
X-API-Version: 1.0
```

当前版本：1.0

---

**文档版本**: 1.0
**更新日期**: 2026-03-29
**相关模块**: `src/modules/data-engine/`
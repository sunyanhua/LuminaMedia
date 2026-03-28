# 矩阵分发中心操作手册

## 概述

矩阵分发中心是 LuminaMedia 2.0 的内容发布核心，实现三审三校工作流和多平台发布，支持微信、小红书、微博、抖音4个主要平台，发布成功率≥95%。

## 核心功能

### 1. 三审三校工作流
- **完整审批流程**: 草稿 → 编辑初审 → AI自检 → 主管复审 → 法务终审 → 发布
- **权限控制**: 基于角色的审批权限管理
- **通知系统**: 多渠道通知（应用内、邮件、微信、钉钉）

### 2. 跨平台发布引擎
- **平台适配器**: 抽象层支持多平台发布
- **微信发布**: 使用官方API，成功率≥98%
- **小红书发布**: 使用OpenClaw Browser Agent模拟发布，成功率≥90%
- **微博/抖音发布**: 适配器支持

### 3. 自动排版和配图
- **微信公众号自动排版**: HTML/Markdown内容自动应用微信规范样式
- **AI配图生成**: 集成AI图片生成服务（DALL-E、Stability AI等）
- **图片优化**: 压缩、水印添加、格式转换

## 工作流设计

### 状态机设计
```typescript
enum ContentStatus {
  DRAFT = 'draft',           // 草稿
  EDITOR_REVIEW = 'editor_review', // 编辑初审
  AI_CHECK = 'ai_check',     // AI安全自检
  MANAGER_REVIEW = 'manager_review', // 主管复审
  LEGAL_REVIEW = 'legal_review', // 法务终审
  APPROVED = 'approved',     // 审批通过
  PUBLISHED = 'published',   // 已发布
  REJECTED = 'rejected',     // 被拒绝
  NEEDS_REVISION = 'needs_revision', // 需要修改
}
```

### 审批节点配置
- **节点类型**: 串行审批、并行审批、条件审批
- **审批人设置**: 指定用户、角色、部门
- **加急处理**: 支持加急审批流程
- **超时处理**: 审批超时自动升级或提醒

### 通知系统
- **通知渠道**: 应用内消息、电子邮件、微信、钉钉、短信
- **通知模板**: 可配置的通知内容模板
- **触发条件**: 状态变更、审批请求、超时提醒
- **重试机制**: 通知失败自动重试

## 跨平台发布

### 平台适配器架构
```
PlatformAdapter (抽象类)
├── WechatAdapter (微信适配器)
├── XHSAdapter (小红书适配器)
├── WeiboAdapter (微博适配器)
└── DouyinAdapter (抖音适配器)
```

### 微信发布流程
1. **获取Access Token**: 调用微信API获取访问令牌
2. **上传素材**: 上传图片、视频等媒体素材
3. **组装消息**: 根据内容类型组装消息体
4. **调用发布API**: 调用微信公众号发布接口
5. **获取发布结果**: 接收发布结果和文章链接
6. **更新状态**: 更新数据库中的发布状态

### 小红书发布流程
1. **启动Browser Agent**: 启动OpenClaw Browser Agent
2. **登录账号**: 自动登录小红书账号
3. **模拟点击发布**: 模拟用户点击发布按钮
4. **填写内容**: 自动填写标题、正文、标签
5. **上传图片**: 上传配图素材
6. **提交发布**: 提交发布并等待完成
7. **获取发布链接**: 获取发布成功后的文章链接
8. **关闭Browser**: 关闭浏览器实例

### 微博/抖音发布
- **微博发布**: 使用微博开放平台API
- **抖音发布**: 使用抖音开放平台API（企业号）
- **通用流程**: 认证 → 内容准备 → 发布 → 状态检查

## 自动排版和配图

### 微信公众号排版
#### 排版功能
- **标题样式**: h1-h6分级标题样式
- **正文样式**: 字体、字号、行高、颜色
- **引用块**: 引用内容特殊样式
- **代码块**: 代码高亮显示
- **图片处理**: 居中、边框、阴影
- **分隔线**: 段落分隔线样式
- **空行处理**: 合理段落间距

#### 质量检查
- **标题质量**: 长度、关键词、吸引力
- **段落质量**: 长度、可读性、结构
- **图片质量**: 尺寸、清晰度、相关性
- **整体评分**: 综合质量评分

### AI配图生成
#### 图片生成服务
- **多AI提供商**: OpenAI DALL-E、Stability AI、本地模型
- **模拟生成**: 测试环境下的模拟生成
- **风格控制**: 写实、卡通、简约、活力等风格
- **尺寸支持**: 方形、横版、竖版

#### 图片优化
- **压缩处理**: 无损/有损压缩优化
- **水印添加**: 品牌水印自动添加
- **格式转换**: 支持JPG、PNG、WebP格式
- **尺寸调整**: 自适应平台要求尺寸

## API接口

### 工作流管理
- `POST /api/workflow/content` - 创建内容工作流
- `GET /api/workflow/content/{contentId}` - 获取工作流状态
- `POST /api/workflow/content/{contentId}/submit` - 提交审批
- `POST /api/workflow/content/{contentId}/approve` - 审批通过
- `POST /api/workflow/content/{contentId}/reject` - 审批拒绝
- `POST /api/workflow/content/{contentId}/withdraw` - 撤回审批

### 发布管理
- `POST /api/publish/content/{contentId}/schedule` - 安排发布
- `POST /api/publish/content/{contentId}/publish` - 立即发布
- `GET /api/publish/content/{contentId}/status` - 获取发布状态
- `POST /api/publish/content/{contentId}/retry` - 重试发布
- `POST /api/publish/content/{contentId}/cancel` - 取消发布

### 平台配置
- `GET /api/publish/platforms` - 获取平台列表
- `POST /api/publish/platforms/{platform}/connect` - 连接平台账号
- `GET /api/publish/platforms/{platform}/accounts` - 获取账号列表
- `POST /api/publish/platforms/{platform}/accounts/{accountId}/test` - 测试账号连接

### 排版和配图
- `POST /api/publish/format/wechat` - 微信公众号内容排版
- `POST /api/publish/images/generate` - AI生成配图
- `POST /api/publish/images/optimize` - 图片优化处理

## 配置指南

### 工作流配置
```yaml
# 审批流程配置
workflow:
  default:
    nodes:
      - type: 'editor_review'
        approvers: ['editor_role']
        timeout: '24h'
      - type: 'ai_check'
        auto: true
        timeout: '1h'
      - type: 'manager_review'
        approvers: ['manager_role']
        timeout: '48h'
      - type: 'legal_review'
        approvers: ['legal_role']
        timeout: '72h'
    emergency:
      nodes:
        - type: 'combined_review'
          approvers: ['editor_role', 'manager_role']
          timeout: '12h'
```

### 平台配置
```bash
# 微信配置
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
WECHAT_TOKEN=your_token
WECHAT_ENCODING_AES_KEY=your_aes_key

# 小红书配置
XHS_USE_BROWSER_AGENT=true
XHS_BROWSER_PATH=/path/to/chromium
XHS_ACCOUNT_USERNAME=your_username
XHS_ACCOUNT_PASSWORD=your_password

# 微博配置
WEIBO_APP_KEY=your_app_key
WEIBO_APP_SECRET=your_app_secret
WEIBO_ACCESS_TOKEN=your_access_token

# 抖音配置
DOUYIN_APP_ID=your_app_id
DOUYIN_APP_SECRET=your_app_secret
DOUYIN_ACCESS_TOKEN=your_access_token
```

### 排版配置
```bash
# 微信排版样式
WECHAT_STYLE_TEMPLATE=default
WECHAT_MAX_IMAGE_SIZE_MB=5
WECHAT_ALLOWED_IMAGE_TYPES=jpg,png,gif

# AI图片生成
AI_IMAGE_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
DEFAULT_IMAGE_STYLE=realistic
```

## 性能指标

### 发布成功率
- **微信发布成功率**: ≥98%
- **小红书发布成功率**: ≥90%
- **整体发布成功率**: ≥95%

### 性能指标
- **工作流审批平均时间**: <24小时
- **发布执行时间**: <5分钟（单平台）
- **排版处理时间**: <30秒

### 质量指标
- **排版合规率**: 100%符合平台规范
- **配图相关性**: ≥4/5用户评分
- **内容安全性**: 100%通过AI安全自检

## 监控与维护

### 健康检查
- `GET /health/workflow` - 工作流引擎健康状态
- `GET /health/publish` - 发布引擎健康状态

### 性能监控
- 发布成功率监控
- 工作流处理时间监控
- 平台API调用成功率监控

### 告警系统
- 发布失败告警
- 审批超时告警
- 平台连接异常告警

## 常见问题

### 发布失败
1. 检查平台账号认证状态
2. 验证内容是否符合平台规则
3. 查看详细错误日志和API响应

### 审批流程卡住
1. 检查审批人设置是否正确
2. 验证通知是否送达
3. 考虑启用加急流程

### 排版效果不佳
1. 调整排版模板配置
2. 检查输入内容格式
3. 手动优化后重新排版

### 图片生成质量低
1. 切换AI图片提供商
2. 优化图片生成提示词
3. 调整图片风格和尺寸参数

---

**版本**: 1.0
**更新日期**: 2026-03-29
**相关模块**: `src/modules/workflow/`, `src/modules/publish/`
# CloudProvider 配置指南

## 概述

LuminaMedia 2.0 采用 **CloudProvider 抽象层**，支持应用在不同云环境间一键切换。通过统一的接口定义和工厂模式，系统可以无缝运行在阿里云SaaS环境、企业内部私有化部署环境以及Mock演示环境中。

### 设计目标

1. **环境无关性**: 业务代码不依赖特定云服务提供商
2. **一键切换**: 通过环境变量改变部署环境
3. **渐进增强**: 从Mock环境逐步升级到生产环境
4. **本地开发友好**: 支持无云服务的本地开发
5. **成本优化**: 按需选择云服务，避免供应商锁定

### 核心特性

- **统一接口**: 所有云服务通过标准化接口访问
- **适配器模式**: 每个云环境实现统一的适配器
- **懒加载**: 服务按需初始化，减少启动时间
- **健康检查**: 统一的健康状态监控
- **资源清理**: 统一的资源释放机制

## 架构设计

### 1. CloudProvider 接口层次

```
CloudProvider (主接口)
├── StorageService (存储服务)
├── AIService (AI服务)
├── DatabaseService (数据库服务)
└── MessagingService (消息服务)
```

### 2. 适配器实现

| 适配器 | 环境 | 用途 | 状态 |
|--------|------|------|------|
| **AliCloudAdapter** | 阿里云SaaS | 生产环境，使用阿里云全家桶 | ✅ 已实现 |
| **PrivateDeployAdapter** | 私有化部署 | 企业内网，使用本地服务 | ✅ 已实现 |
| **MockAdapter** | 演示/开发 | 本地开发，无外部依赖 | ✅ 已实现 |

### 3. 工厂模式

通过 `CloudProviderFactory` 根据环境变量创建对应适配器：

```typescript
// 环境变量决定使用哪个适配器
CLOUD_PROVIDER=alicloud    # 阿里云环境
CLOUD_PROVIDER=private     # 私有化部署
CLOUD_PROVIDER=mock        # 演示/开发环境（默认）
```

## 配置指南

### 1. 环境变量配置

#### 基础配置 (.env 文件)

```env
# ==================== CloudProvider 配置 ====================
# 云服务提供商：alicloud | private | mock
CLOUD_PROVIDER=mock

# ==================== 阿里云配置 (CLOUD_PROVIDER=alicloud) ====================
ALICLOUD_ACCESS_KEY_ID=your_access_key_id
ALICLOUD_ACCESS_KEY_SECRET=your_access_key_secret
ALICLOUD_REGION=cn-hangzhou

# ==================== 私有化部署配置 (CLOUD_PROVIDER=private) ====================
PRIVATE_DEPLOY_BASE_URL=http://localhost:8080
PRIVATE_DEPLOY_ENV=development
PRIVATE_STORAGE_PATH=./storage
PRIVATE_STORAGE_BASE_URL=http://localhost:9000

# ==================== AI服务配置 ====================
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# 阿里云百炼/Qwen API
QWEN_API_KEY=your_qwen_api_key
QWEN_MODEL=qwen-max

# ==================== 数据库配置 ====================
DATABASE_URL=mysql://username:password@localhost:3306/lumina_media
```

#### Docker 环境变量

```dockerfile
# docker-compose.yml 示例
version: '3.8'
services:
  app:
    build: .
    environment:
      - CLOUD_PROVIDER=${CLOUD_PROVIDER:-mock}
      - DATABASE_URL=mysql://root:password@db:3306/lumina_media
      # 阿里云环境变量（仅在阿里云环境设置）
      - ALICLOUD_ACCESS_KEY_ID=${ALICLOUD_ACCESS_KEY_ID}
      - ALICLOUD_ACCESS_KEY_SECRET=${ALICLOUD_ACCESS_KEY_SECRET}
    depends_on:
      - db
```

### 2. 适配器选择策略

根据部署场景选择合适的适配器：

| 场景 | 推荐适配器 | 理由 | 典型配置 |
|------|-----------|------|---------|
| **本地开发** | MockAdapter | 无需外部服务，快速启动 | `CLOUD_PROVIDER=mock` |
| **演示环境** | MockAdapter | 稳定可靠，无费用 | `CLOUD_PROVIDER=mock` |
| **测试环境** | PrivateDeployAdapter | 接近生产，可控性强 | `CLOUD_PROVIDER=private` |
| **企业内网** | PrivateDeployAdapter | 数据不出内网，安全合规 | `CLOUD_PROVIDER=private` |
| **SaaS生产** | AliCloudAdapter | 弹性伸缩，高可用 | `CLOUD_PROVIDER=alicloud` |

### 3. 运行时切换

支持运行时动态切换适配器（主要用于测试）：

```typescript
import { CloudProviderFactory } from '@/shared/cloud/cloud-provider.factory';

// 销毁当前实例
CloudProviderFactory.destroyInstance();

// 修改环境变量
process.env.CLOUD_PROVIDER = 'alicloud';

// 获取新实例（会自动重新初始化）
const provider = await CloudProviderFactory.getInstance();
```

## 服务接口详解

### 1. StorageService (存储服务)

#### 接口定义

```typescript
interface StorageService {
  uploadFile(bucket: string, key: string, file: Buffer, options?: StorageOptions): Promise<StorageResult>;
  downloadFile(bucket: string, key: string): Promise<Buffer>;
  deleteFile(bucket: string, key: string): Promise<void>;
  getFileUrl(bucket: string, key: string, expiresIn?: number): Promise<string>;
  listFiles(bucket: string, prefix?: string): Promise<FileInfo[]>;
}
```

#### 各适配器实现对比

| 功能 | AliCloudAdapter | PrivateDeployAdapter | MockAdapter |
|------|----------------|---------------------|-------------|
| **后端存储** | 阿里云OSS | 本地文件系统/MinIO | 内存Map |
| **文件URL** | OSS签名URL | HTTP服务URL | 模拟URL |
| **性能** | 高（CDN加速） | 中等（本地网络） | 高（内存） |
| **持久性** | 高（多副本） | 中等（本地磁盘） | 低（重启丢失） |
| **成本** | 按使用量计费 | 固定硬件成本 | 免费 |

#### 使用示例

```typescript
import { getStorageService } from '@/shared/cloud/cloud-provider.factory';

async function handleFileUpload(file: Buffer, filename: string) {
  const storage = await getStorageService();

  // 上传到用户文件桶
  const result = await storage.uploadFile(
    'user-files',
    `uploads/${Date.now()}-${filename}`,
    file,
    {
      contentType: 'image/jpeg',
      metadata: { uploadedBy: 'user123' }
    }
  );

  // 获取可访问URL（1小时有效）
  const url = await storage.getFileUrl(result.bucket, result.key, 3600);

  return { ...result, url };
}
```

### 2. AIService (AI服务)

#### 接口定义

```typescript
interface AIService {
  callModel(model: string, prompt: string, options?: AIModelOptions): Promise<AIResponse>;
  callLocalModel(model: string, prompt: string, options?: LocalModelOptions): Promise<AIResponse>;
  listAvailableModels(): Promise<ModelInfo[]>;
  getServiceStatus(): Promise<AIServiceStatus>;
}
```

#### 各适配器实现对比

| 功能 | AliCloudAdapter | PrivateDeployAdapter | MockAdapter |
|------|----------------|---------------------|-------------|
| **云端模型** | 阿里云百炼/Qwen | 可选外部API | 模拟响应 |
| **本地模型** | 重定向到云端 | Docker容器模型 | 模拟响应 |
| **模型列表** | 通义千问系列 | Qwen/Llama Docker | Gemini/Qwen模拟 |
| **延迟** | 100-500ms | 300-1000ms | 50-200ms |
| **费用** | API调用计费 | 硬件成本 | 免费 |

#### 使用示例

```typescript
import { getAIService } from '@/shared/cloud/cloud-provider.factory';

async function generateMarketingContent(prompt: string) {
  const aiService = await getAIService();

  // 检查可用模型
  const models = await aiService.listAvailableModels();
  const preferredModel = models.find(m => m.name.includes('Qwen Max'))?.id || models[0].id;

  // 调用AI模型
  const response = await aiService.callModel(preferredModel, prompt, {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.95
  });

  // 记录使用量
  console.log(`AI调用消耗: ${response.usage?.totalTokens} tokens`);

  return response.text;
}

// 调用本地Docker模型（仅PrivateDeployAdapter有效）
async function callLocalModel() {
  const aiService = await getAIService();
  const response = await aiService.callLocalModel('qwen-7b-docker', '请写一首诗', {
    gpu: true,
    memoryLimit: '8g'
  });
  return response;
}
```

### 3. DatabaseService (数据库服务)

#### 接口定义

```typescript
interface DatabaseService {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<number>;
  beginTransaction(): Promise<Transaction>;
  getConnectionStats(): Promise<ConnectionStats>;
  sharding: ShardingService;
}
```

#### 各适配器实现对比

| 功能 | AliCloudAdapter | PrivateDeployAdapter | MockAdapter |
|------|----------------|---------------------|-------------|
| **数据库** | 阿里云RDS | 本地MySQL | 内存模拟 |
| **分表策略** | 16个分区 | 8个分区 | 16个分区 |
| **连接池** | 自动管理 | 自动管理 | 模拟连接 |
| **事务支持** | 完整事务 | 完整事务 | 模拟事务 |
| **性能** | 高（云优化） | 中等（本地） | 高（内存） |

#### 使用示例

```typescript
import { getDatabaseService } from '@/shared/cloud/cloud-provider.factory';

async function getCustomerProfiles(tenantId: string) {
  const db = await getDatabaseService();

  // 执行查询（自动处理多租户隔离）
  const profiles = await db.query<CustomerProfile>(
    'SELECT * FROM customer_profiles WHERE status = ? ORDER BY created_at DESC LIMIT 10',
    ['active']
  );

  // 获取连接池状态（监控用）
  const stats = await db.getConnectionStats();
  console.log(`数据库连接: ${stats.active}活跃/${stats.total}总数`);

  return profiles;
}

// 使用事务
async function updateCustomerWithTransaction(customerId: string, updates: any) {
  const db = await getDatabaseService();
  const transaction = await db.beginTransaction();

  try {
    // 执行多个操作
    await db.execute(
      'UPDATE customer_profiles SET name = ?, updated_at = NOW() WHERE id = ?',
      [updates.name, customerId]
    );

    await db.execute(
      'INSERT INTO customer_audit_log (customer_id, action, details) VALUES (?, ?, ?)',
      [customerId, 'UPDATE', JSON.stringify(updates)]
    );

    // 提交事务
    await transaction.commit();
    return true;
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    throw error;
  }
}
```

### 4. MessagingService (消息服务)

#### 接口定义

```typescript
interface MessagingService {
  sendMessage(queue: string, message: any, options?: MessageOptions): Promise<string>;
  receiveMessage(queue: string, options?: ReceiveOptions): Promise<Message | null>;
  acknowledgeMessage(queue: string, messageId: string): Promise<void>;
  publishEvent(topic: string, event: any): Promise<void>;
  subscribeEvent(topic: string, handler: EventHandler): Promise<Subscription>;
}
```

#### 各适配器实现对比

| 功能 | AliCloudAdapter | PrivateDeployAdapter | MockAdapter |
|------|----------------|---------------------|-------------|
| **消息队列** | 阿里云MNS | RabbitMQ/Redis | 内存队列 |
| **事件总线** | MNS主题 | 本地事件系统 | 内存事件 |
| **持久性** | 高（云存储） | 中等（本地） | 低（内存） |
| **可靠性** | 高（云保障） | 中等（自维护） | 低（重启丢失） |

#### 使用示例

```typescript
import { getMessagingService } from '@/shared/cloud/cloud-provider.factory';

// 发送异步任务消息
async function sendBackgroundTask(task: BackgroundTask) {
  const messaging = await getMessagingService();

  const messageId = await messaging.sendMessage(
    'background-tasks',
    task,
    {
      delaySeconds: task.delay || 0,
      messageAttributes: {
        taskType: task.type,
        priority: task.priority || 'normal'
      }
    }
  );

  return messageId;
}

// 处理消息
async function processMessages() {
  const messaging = await getMessagingService();

  while (true) {
    const message = await messaging.receiveMessage('background-tasks', {
      waitTimeSeconds: 20,
      maxNumberOfMessages: 1
    });

    if (!message) {
      continue; // 无消息，继续等待
    }

    try {
      // 处理消息
      await processTask(message.body);

      // 确认消息已处理
      await messaging.acknowledgeMessage('background-tasks', message.id);
    } catch (error) {
      console.error('处理消息失败:', error);
      // 不确认消息，使其重新入队
    }
  }
}

// 发布/订阅事件
async function setupEventHandlers() {
  const messaging = await getMessagingService();

  // 订阅用户注册事件
  const subscription = await messaging.subscribeEvent('user.registered', async (event) => {
    console.log('新用户注册:', event.userId);
    // 发送欢迎邮件、初始化数据等
  });

  // 发布事件
  await messaging.publishEvent('user.registered', {
    userId: 'user123',
    email: 'user@example.com',
    registeredAt: new Date()
  });

  // 取消订阅
  // await subscription.unsubscribe();
}
```

## 部署场景

### 场景1: 本地开发环境

#### 配置文件 (.env.development)

```env
# CloudProvider 配置
CLOUD_PROVIDER=mock

# 数据库配置（本地MySQL）
DATABASE_URL=mysql://root:password@localhost:3306/lumina_media_dev

# 无需配置云服务凭证
```

#### Docker Compose 配置

```yaml
version: '3.8'
services:
  app:
    build: .
    environment:
      - CLOUD_PROVIDER=mock
      - DATABASE_URL=mysql://root:password@db:3306/lumina_media_dev
    ports:
      - "3003:3003"
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=lumina_media_dev
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

#### 开发工作流

```bash
# 1. 启动开发环境
docker-compose up -d

# 2. 查看日志
docker-compose logs -f app

# 3. 运行测试（使用Mock适配器）
npm test

# 4. 停止环境
docker-compose down
```

### 场景2: 私有化部署环境

#### 配置文件 (.env.private)

```env
# CloudProvider 配置
CLOUD_PROVIDER=private

# 私有化部署配置
PRIVATE_DEPLOY_BASE_URL=http://192.168.1.100:8080
PRIVATE_DEPLOY_ENV=production
PRIVATE_STORAGE_PATH=/data/storage
PRIVATE_STORAGE_BASE_URL=http://192.168.1.100:9000

# 数据库配置
DATABASE_URL=mysql://lumina_user:password@192.168.1.101:3306/lumina_media

# AI服务配置（可选外部API）
GEMINI_API_KEY=your_gemini_api_key_here
QWEN_API_KEY=your_qwen_api_key_here
```

#### 部署架构

```
企业内网环境:
├── 应用服务器 (192.168.1.100)
│   ├── LuminaMedia 应用
│   ├── MinIO存储服务 (端口9000)
│   └── Nginx反向代理 (端口8080)
├── 数据库服务器 (192.168.1.101)
│   └── MySQL 8.0
├── AI模型服务器 (192.168.1.102) - 可选
│   └── Docker Qwen 7B模型
└── 消息队列服务器 (192.168.1.103) - 可选
    └── RabbitMQ/Redis
```

#### 部署步骤

```bash
# 1. 准备环境变量
cp .env.private .env

# 2. 构建Docker镜像
docker build -t lumina-media:private .

# 3. 部署数据库（首次）
docker run -d \
  --name lumina-mysql \
  -e MYSQL_ROOT_PASSWORD=secure_password \
  -e MYSQL_DATABASE=lumina_media \
  -v /data/mysql:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0

# 4. 部署MinIO存储（可选）
docker run -d \
  --name minio \
  -v /data/minio:/data \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -p 9000:9000 \
  -p 9001:9001 \
  minio/minio server /data --console-address ":9001"

# 5. 运行应用
docker run -d \
  --name lumina-app \
  --env-file .env \
  -p 3003:3003 \
  lumina-media:private
```

### 场景3: 阿里云SaaS生产环境

#### 配置文件 (.env.production)

```env
# CloudProvider 配置
CLOUD_PROVIDER=alicloud

# 阿里云配置
ALICLOUD_ACCESS_KEY_ID=AKLTxxxxxxxxxxxxxxxxxxxx
ALICLOUD_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ALICLOUD_REGION=cn-hangzhou

# 数据库配置（阿里云RDS）
DATABASE_URL=mysql://lumina_prod:password@rm-xxxxxxxx.mysql.rds.aliyuncs.com:3306/lumina_media_prod

# AI服务配置
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 存储配置（自动使用OSS）
# 无需额外配置，自动使用阿里云OSS
```

#### 云资源清单

| 服务 | 阿里云产品 | 规格 | 备注 |
|------|-----------|------|------|
| **计算** | ECS/容器服务 | 4核8G | 应用运行环境 |
| **数据库** | RDS MySQL | 高可用版 | 主备架构，自动备份 |
| **存储** | OSS | 标准存储 | 文件存储，CDN加速 |
| **AI服务** | 百炼平台 | Qwen Max | 按Token计费 |
| **消息队列** | MNS | 标准版 | 应用解耦 |
| **监控** | SLS+ARMS | 基础版 | 日志和APM监控 |

#### 部署架构

```
阿里云环境:
├── 容器服务 Kubernetes
│   └── LuminaMedia Deployment
├── 云数据库 RDS
│   └── MySQL 8.0 (主备)
├── 对象存储 OSS
│   └── lumina-media-bucket
├── 百炼AI平台
│   └── Qwen模型服务
├── 消息服务 MNS
│   └── 任务队列/事件主题
└── 日志服务 SLS + 应用监控 ARMS
```

#### 部署脚本

```bash
#!/bin/bash
# deploy-to-alicloud.sh

# 1. 设置环境变量
export CLOUD_PROVIDER=alicloud
export ALICLOUD_ACCESS_KEY_ID="AKLTxxxxxxxxxxxxxxxxxxxx"
export ALICLOUD_ACCESS_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 2. 构建Docker镜像
docker build -t registry.cn-hangzhou.aliyuncs.com/lumina-media/app:latest .

# 3. 推送到阿里云容器镜像服务
docker push registry.cn-hangzhou.aliyuncs.com/lumina-media/app:latest

# 4. 更新Kubernetes部署
kubectl set image deployment/lumina-media-app \
  app=registry.cn-hangzhou.aliyuncs.com/lumina-media/app:latest

# 5. 等待滚动更新完成
kubectl rollout status deployment/lumina-media-app --timeout=300s

# 6. 验证部署
kubectl get pods
kubectl logs -l app=lumina-media --tail=50
```

## 健康检查与监控

### 1. 健康检查端点

所有适配器都实现 `healthCheck()` 方法：

```typescript
import { getCloudProvider } from '@/shared/cloud/cloud-provider.factory';

// 健康检查API端点示例
app.get('/health/cloud', async (req, res) => {
  try {
    const provider = await getCloudProvider();
    const health = await provider.healthCheck();

    res.json({
      status: health.status,
      provider: provider.getName(),
      details: health.details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### 2. 监控指标

建议监控以下关键指标：

| 指标 | 描述 | 预警阈值 | 监控工具 |
|------|------|----------|----------|
| **CloudProvider健康状态** | 适配器健康状态 | status != 'healthy' | Prometheus |
| **存储服务可用性** | 文件上传/下载成功率 | < 99% | 阿里云SLS |
| **AI服务延迟** | 模型调用平均延迟 | > 2000ms | 百炼监控 |
| **数据库连接池** | 活跃连接数比例 | > 80% | RDS监控 |
| **消息队列积压** | 未处理消息数量 | > 1000 | MNS监控 |

### 3. 日志记录

每个适配器都包含详细的日志记录：

```typescript
// 示例：启用详细日志
console.log(`[${adapter.getName()}Adapter] 初始化完成`);
console.log(`[${service.constructor.name}] 执行操作: ${operation}`);

// 生产环境建议使用结构化日志
logger.info('cloud_provider_operation', {
  provider: adapter.getName(),
  operation: 'uploadFile',
  bucket,
  key,
  fileSize: file.length,
  duration: Date.now() - startTime
});
```

## 故障排除

### 常见问题1: 适配器初始化失败

**症状**: 应用启动时报错 `Failed to initialize CloudProvider`

**可能原因**:
1. 环境变量 `CLOUD_PROVIDER` 设置错误
2. 云服务凭证无效或过期
3. 网络连接问题

**解决方案**:
```bash
# 1. 检查环境变量
echo $CLOUD_PROVIDER

# 2. 验证阿里云凭证（仅阿里云环境）
ALIYUN_ACCESS_KEY_ID=your_key ALIYUN_ACCESS_KEY_SECRET=your_secret aliyun oss ls

# 3. 切换到Mock模式测试
export CLOUD_PROVIDER=mock
npm start
```

### 常见问题2: 服务调用超时

**症状**: 存储或AI服务调用超时

**可能原因**:
1. 网络防火墙阻止
2. 云服务配额用尽
3. 适配器配置错误

**解决方案**:
```typescript
// 1. 增加超时设置（在适配器初始化时）
class CustomAdapter extends CloudProvider {
  async initialize() {
    // 设置更长的超时
    this.configure({ timeout: 30000 });
  }
}

// 2. 实现重试机制
async function withRetry(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 常见问题3: 环境切换后数据不一致

**症状**: 从Mock切换到阿里云后数据丢失

**原因**: Mock适配器使用内存存储，重启后数据丢失

**解决方案**:
```typescript
// 1. 实现数据迁移工具
async function migrateMockToCloud(mockData, cloudProvider) {
  for (const file of mockData.files) {
    await cloudProvider.storage.uploadFile(
      file.bucket,
      file.key,
      file.content,
      file.options
    );
  }
}

// 2. 使用外部存储（如本地文件）作为Mock后端
class PersistentMockAdapter extends MockAdapter {
  private storagePath = './mock-storage-data.json';

  async initialize() {
    // 从文件加载数据
    if (fs.existsSync(this.storagePath)) {
      const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
      this.loadData(data);
    }
  }

  async cleanup() {
    // 保存数据到文件
    const data = this.saveData();
    fs.writeFileSync(this.storagePath, JSON.stringify(data));
  }
}
```

## 扩展开发

### 1. 添加新的云适配器

```typescript
// 1. 创建新适配器类
export class AWSAdapter implements CloudProvider {
  storage: StorageService = new AWSStorageService();
  ai: AIService = new AWSAIService();
  database: DatabaseService = new AWSDatabaseService();
  messaging: MessagingService = new AWSMessagingService();

  getName(): string { return 'aws'; }

  async initialize(): Promise<void> {
    // 初始化AWS SDK
    const credentials = new AWS.Credentials({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.s3 = new AWS.S3({ credentials, region: process.env.AWS_REGION });
    this.bedrock = new AWS.BedrockRuntime({ credentials, region: process.env.AWS_REGION });
    // ... 其他服务初始化
  }

  // ... 实现其他方法
}

// 2. 在工厂中添加新适配器
private static async createProvider(): Promise<CloudProvider> {
  const providerType = process.env.CLOUD_PROVIDER || 'mock';

  switch (providerType.toLowerCase()) {
    case 'alicloud':
      // ... 现有代码
    case 'aws':  // 新增
      const { AWSAdapter } = require('./adapters/aws.adapter');
      return new AWSAdapter();
    // ... 其他适配器
  }
}
```

### 2. 自定义服务实现

```typescript
// 混合适配器：部分服务使用云，部分使用本地
export class HybridAdapter implements CloudProvider {
  storage: StorageService;
  ai: AIService;
  database: DatabaseService;
  messaging: MessagingService;

  constructor() {
    // 存储使用阿里云OSS
    this.storage = new AliCloudStorageService();

    // AI使用本地Docker模型（降低成本）
    this.ai = new PrivateAIService();

    // 数据库使用本地MySQL
    this.database = new PrivateDatabaseService();

    // 消息使用内存队列（简单场景）
    this.messaging = new MockMessagingService();
  }

  getName(): string { return 'hybrid'; }

  async initialize(): Promise<void> {
    // 分别初始化各个服务
    await Promise.all([
      this.storage.initialize?.(),
      this.ai.initialize?.(),
      this.database.initialize?.(),
      this.messaging.initialize?.(),
    ]);
  }

  // ... 其他方法
}
```

### 3. 性能优化建议

```typescript
// 1. 连接池复用
class OptimizedAdapter {
  private connectionPools = new Map<string, any>();

  async getConnection(service: string) {
    if (!this.connectionPools.has(service)) {
      this.connectionPools.set(service, this.createConnectionPool(service));
    }
    return this.connectionPools.get(service);
  }
}

// 2. 缓存常用数据
class CachedStorageService implements StorageService {
  private cache = new LRUCache<string, Buffer>({ max: 100 });

  async downloadFile(bucket: string, key: string): Promise<Buffer> {
    const cacheKey = `${bucket}/${key}`;

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // 从实际服务获取
    const content = await this.realStorage.downloadFile(bucket, key);

    // 存入缓存
    this.cache.set(cacheKey, content);

    return content;
  }
}
```

## 附录

### A. 环境变量参考

| 变量名 | 必需 | 默认值 | 描述 |
|--------|------|--------|------|
| `CLOUD_PROVIDER` | 是 | `mock` | 云服务提供商 |
| `ALICLOUD_ACCESS_KEY_ID` | 阿里云必需 | - | 阿里云AccessKey ID |
| `ALICLOUD_ACCESS_KEY_SECRET` | 阿里云必需 | - | 阿里云AccessKey Secret |
| `ALICLOUD_REGION` | 否 | `cn-hangzhou` | 阿里云区域 |
| `PRIVATE_DEPLOY_BASE_URL` | 私有部署推荐 | `http://localhost:8080` | 私有化部署基础URL |
| `PRIVATE_STORAGE_PATH` | 否 | `./storage` | 私有化存储路径 |
| `DATABASE_URL` | 是 | - | 数据库连接URL |

### B. 适配器特性对比表

| 特性 | AliCloudAdapter | PrivateDeployAdapter | MockAdapter |
|------|----------------|---------------------|-------------|
| **生产就绪** | ✅ | ✅ | ❌ |
| **成本** | 按使用量 | 固定硬件 | 免费 |
| **扩展性** | 自动扩展 | 手动扩展 | 无扩展 |
| **数据持久性** | 高 | 中等 | 无 |
| **网络要求** | 公网访问 | 内网访问 | 无要求 |
| **适合场景** | SaaS生产 | 企业内网 | 开发测试 |

### C. 相关代码文件

- `src/shared/cloud/cloud-provider.interface.ts` - 核心接口定义
- `src/shared/cloud/cloud-provider.factory.ts` - 工厂类
- `src/shared/cloud/adapters/alicloud.adapter.ts` - 阿里云适配器
- `src/shared/cloud/adapters/private-deploy.adapter.ts` - 私有化部署适配器
- `src/shared/cloud/adapters/mock.adapter.ts` - Mock适配器
- `src/shared/cloud/index.ts` - 导出入口

---

**文档版本**: 1.0
**最后更新**: 2026-03-26
**维护者**: LuminaMedia 运维团队
**状态**: 正式发布
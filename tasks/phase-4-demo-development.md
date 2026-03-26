# LuminaMedia 2.0 实施任务清单 - 第四阶段: DEMO版本开发

## 阶段概述
**时间**: 并行进行，商务版第1-3个月，政务版第4-6个月
**目标**: 开发商务版和政务版DEMO，分别采用模拟数据和真实数据，用于市场验证和产品展示
**核心交付物**: 商务版DEMO（模拟数据+前端演示）、政务版DEMO（真实运营+全功能验证）、DEMO部署包和文档

## 详细任务分解

### 商务版DEMO开发 (第1-3个月，与第一阶段并行)

#### 任务D1.1: 模拟数据生成工具
- **任务描述**: 开发高质量模拟数据生成工具，预置10,000条商场客户数据
- **技术方案**:
  - 设计模拟数据模型和生成规则
  - 实现数据生成算法（保持统计特性）
  - 开发数据可视化验证工具
  - 创建数据导出和导入功能
- **模拟数据类型**:
  1. **客户基本信息**:
     - 姓名、性别、年龄、手机号、邮箱
     - 注册时间、会员等级、积分余额
  2. **消费行为数据**:
     - 购买记录（时间、商品、金额、门店）
     - 浏览记录、收藏记录、购物车记录
  3. **活动参与数据**:
     - 营销活动参与记录
     - 优惠券使用记录
     - 问卷调查参与记录
  4. **社交媒体数据**:
     - 公众号关注记录
     - 文章阅读、点赞、评论记录
- **数据生成算法**:
  ```python
  # 使用Faker库生成基础数据
  from faker import Faker
  import random
  from datetime import datetime, timedelta

  fake = Faker('zh_CN')

  def generate_customer_data(num_records=10000):
      customers = []
      for i in range(num_records):
          customer = {
              'id': f'CUST{str(i).zfill(6)}',
              'name': fake.name(),
              'gender': random.choice(['M', 'F']),
              'age': random.randint(18, 65),
              'mobile': fake.phone_number(),
              'email': fake.email(),
              'registration_date': fake.date_between(start_date='-2y', end_date='today'),
              'membership_level': random.choice(['bronze', 'silver', 'gold', 'platinum']),
              'points': random.randint(0, 50000),
          }
          customers.append(customer)
      return customers
  ```
- **数据质量要求**:
  - 数据分布符合真实场景（如年龄正态分布）
  - 数据关联性合理（消费行为与会员等级相关）
  - 数据完整性（关键字段无缺失）
  - 数据多样性（覆盖不同用户类型）
- **验收标准**:
  - 生成10,000条高质量模拟数据
  - 数据通过统计验证（分布合理）
  - 生成工具支持参数化配置
  - 数据可重复生成（随机种子固定）

#### 任务D1.2: DEMO数据表设计
- **任务描述**: 设计DEMO专用数据表，不污染真实业务数据
- **技术方案**:
  - 创建独立的DEMO数据库schema
  - 设计DEMO专用表结构
  - 实现数据隔离机制
  - 开发数据清理和重置工具
- **DEMO表结构**:
  ```sql
  -- 创建DEMO专用数据库
  CREATE DATABASE lumina_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  -- DEMO客户数据表
  CREATE TABLE demo_customer_profiles (
      id CHAR(36) NOT NULL,
      tenant_id CHAR(36) DEFAULT 'demo-tenant',
      name VARCHAR(100) NOT NULL,
      gender ENUM('M', 'F') NOT NULL,
      age INT NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      registration_date DATE NOT NULL,
      membership_level ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
      points INT DEFAULT 0,
      total_spent DECIMAL(10, 2) DEFAULT 0.00,
      last_purchase_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_tenant_id (tenant_id),
      INDEX idx_membership_level (membership_level),
      INDEX idx_last_purchase_date (last_purchase_date)
  ) COMMENT='DEMO客户数据表';

  -- DEMO消费记录表
  CREATE TABLE demo_purchase_records (
      id CHAR(36) NOT NULL,
      customer_id CHAR(36) NOT NULL,
      tenant_id CHAR(36) DEFAULT 'demo-tenant',
      purchase_date DATETIME NOT NULL,
      store_id VARCHAR(50) NOT NULL,
      product_category VARCHAR(100) NOT NULL,
      product_name VARCHAR(200) NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      payment_method ENUM('alipay', 'wechat', 'card', 'cash') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_customer_id (customer_id),
      INDEX idx_purchase_date (purchase_date),
      INDEX idx_product_category (product_category),
      FOREIGN KEY (customer_id) REFERENCES demo_customer_profiles(id) ON DELETE CASCADE
  ) COMMENT='DEMO消费记录表';
  ```
- **数据隔离策略**:
  1. **数据库层面**: 独立的 `lumina_demo` 数据库
  2. **应用层面**: DEMO模式开关，路由到不同数据源
  3. **API层面**: DEMO专用API端点前缀 `/api/demo/`
  4. **存储层面**: DEMO专用OSS bucket前缀 `demo/`
- **验收标准**:
  - DEMO数据与真实数据完全隔离
  - 数据表结构支持完整业务场景
  - 数据重置工具一键清理和恢复
  - 性能满足DEMO展示需求

#### 任务D1.3: 演示模式开关实现
- **任务描述**: 实现演示模式开关，控制数据操作行为
- **技术方案**:
  - 设计演示模式状态管理
  - 实现数据操作包装器
  - 开发演示模式UI指示器
  - 创建模式切换确认机制
- **演示模式状态管理**:
  ```typescript
  // 演示模式状态服务
  @Injectable()
  export class DemoModeService {
    private isDemoMode = false;
    private demoModeSubject = new BehaviorSubject<boolean>(false);

    // 切换演示模式
    toggleDemoMode(enable: boolean): void {
      this.isDemoMode = enable;
      this.demoModeSubject.next(enable);

      if (enable) {
        console.log('[DEMO] 演示模式已启用，所有数据操作将被模拟');
        this.showDemoNotification();
      } else {
        console.log('[DEMO] 演示模式已关闭，使用真实数据');
      }
    }

    // 数据操作包装器
    async executeWithDemoWrapper<T>(
      realOperation: () => Promise<T>,
      demoOperation: () => Promise<T>
    ): Promise<T> {
      if (this.isDemoMode) {
        console.log('[DEMO] 执行模拟操作');
        return await demoOperation();
      } else {
        return await realOperation();
      }
    }

    // 检查当前模式
    isInDemoMode(): boolean {
      return this.isDemoMode;
    }
  }
  ```
- **数据操作包装器示例**:
  ```typescript
  // API服务包装器
  class DemoApiService {
    constructor(
      private demoModeService: DemoModeService,
      private realApiService: RealApiService,
      private mockApiService: MockApiService
    ) {}

    // 获取客户数据
    async getCustomerData(customerId: string): Promise<CustomerData> {
      return this.demoModeService.executeWithDemoWrapper(
        () => this.realApiService.getCustomerData(customerId),
        () => this.mockApiService.getCustomerData(customerId)
      );
    }

    // 提交营销方案
    async submitMarketingPlan(plan: MarketingPlan): Promise<SubmitResult> {
      return this.demoModeService.executeWithDemoWrapper(
        () => this.realApiService.submitMarketingPlan(plan),
        async () => {
          console.log('[DEMO] 模拟提交营销方案:', plan);
          // 模拟处理延迟
          await new Promise(resolve => setTimeout(resolve, 1000));
          return {
            success: true,
            message: '演示模式：方案已模拟提交，未实际保存',
            planId: `demo-plan-${Date.now()}`
          };
        }
      );
    }
  }
  ```
- **UI指示器设计**:
  ```typescript
  // 演示模式指示器组件
  const DemoModeIndicator: React.FC = () => {
    const { isDemoMode } = useDemoMode();

    return (
      <div className={`demo-indicator ${isDemoMode ? 'demo-active' : ''}`}>
        <div className="demo-status">
          {isDemoMode ? (
            <>
              <span className="demo-badge">DEMO</span>
              <span className="demo-text">演示模式</span>
            </>
          ) : (
            <span className="demo-text">生产模式</span>
          )}
        </div>
        <DemoModeToggle />
      </div>
    );
  };
  ```
- **验收标准**:
  - 演示模式切换流畅，无页面刷新
  - 数据操作正确路由（真实/模拟）
  - 用户明确知道当前模式状态
  - 模式切换有确认提示，防止误操作

#### 任务D1.4: 前端演示界面优化
- **任务描述**: 基于Bolt.new设计风格，优化DEMO前端界面和交互
- **技术方案**:
  - 继承Bolt.new视觉设计语言
  - 实现流畅的演示流程引导
  - 添加视觉效果和动画
  - 优化移动端演示体验
- **Bolt.new设计继承**:
  1. **颜色体系**: 主色调、辅助色、中性色
  2. **字体系统**: 字体家族、字号阶梯、字重
  3. **间距系统**: 间距单位、布局网格
  4. **组件样式**: 按钮、卡片、表单、表格
- **演示流程引导设计**:
  ```typescript
  // 演示流程引导组件
  const DemoFlowGuide: React.FC = () => {
    const steps = [
      { id: 'data-import', title: '数据导入', description: '导入商场客户数据' },
      { id: 'analysis', title: '数据分析', description: 'AI智能分析用户画像' },
      { id: 'strategy', title: '营销策划', description: '生成个性化营销方案' },
      { id: 'content', title: '内容生成', description: '创建多平台宣传内容' },
      { id: 'publish', title: '发布跟踪', description: '发布并监测效果' },
    ];

    const [currentStep, setCurrentStep] = useState('data-import');

    return (
      <div className="demo-flow-guide">
        <div className="demo-steps">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`demo-step ${step.id === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="step-connector"></div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="demo-step-content">
          {/* 动态加载步骤内容 */}
          <DemoStepContent stepId={currentStep} />
        </div>
      </div>
    );
  };
  ```
- **视觉效果和动画**:
  1. **加载动画**: 数据加载时的骨架屏和进度指示
  2. **过渡动画**: 页面切换和状态变化的平滑过渡
  3. **微交互**: 按钮点击、表单交互的即时反馈
  4. **数据可视化动画**: 图表数据的动态展示
- **移动端演示优化**:
  - 触摸友好的交互元素
  - 简化移动端操作流程
  - 横竖屏自适应
  - 离线演示能力
- **验收标准**:
  - 界面美观，符合Bolt.new设计标准
  - 演示流程引导清晰，用户不会迷失
  - 动画流畅，不卡顿
  - 移动端体验优秀，操作便捷

#### 任务D1.5: 交互逻辑完整展示
- **任务描述**: 实现完整的交互逻辑展示，即使后端不实际写入数据
- **技术方案**:
  - 设计前端状态管理模拟数据流
  - 实现操作反馈和结果预览
  - 添加操作记录和回放功能
  - 开发演示脚本和场景
- **前端状态管理**:
  ```typescript
  // 演示状态管理（使用Zustand）
  interface DemoState {
    // 数据状态
    customerData: CustomerData[];
    analysisResults: AnalysisResult[];
    marketingPlans: MarketingPlan[];
    publishedContents: PublishedContent[];

    // 操作状态
    currentStep: DemoStep;
    operationHistory: OperationRecord[];
    isProcessing: boolean;

    // 操作方法
    importData: (file: File) => Promise<void>;
    runAnalysis: () => Promise<void>;
    generatePlan: () => Promise<void>;
    publishContent: (platform: string) => Promise<void>;
    resetDemo: () => void;
    replayOperation: (recordId: string) => void;
  }

  const useDemoStore = create<DemoState>((set, get) => ({
    customerData: [],
    analysisResults: [],
    marketingPlans: [],
    publishedContents: [],
    currentStep: 'data-import',
    operationHistory: [],
    isProcessing: false,

    importData: async (file: File) => {
      set({ isProcessing: true });

      // 模拟文件上传和处理
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 生成模拟数据
      const mockData = generateMockCustomerData(1000);

      set(state => ({
        customerData: mockData,
        isProcessing: false,
        currentStep: 'analysis',
        operationHistory: [
          ...state.operationHistory,
          {
            id: `op-${Date.now()}`,
            type: 'data_import',
            timestamp: new Date().toISOString(),
            details: { fileName: file.name, recordCount: 1000 }
          }
        ]
      }));
    },

    // ... 其他操作方法
  }));
  ```
- **操作反馈设计**:
  1. **即时反馈**: 操作后立即显示处理状态
  2. **结果预览**: 生成结果的缩略预览
  3. **详细视图**: 点击可查看完整结果详情
  4. **比较视图**: 不同方案的结果对比
- **操作记录和回放**:
  ```typescript
  // 操作记录组件
  const OperationHistory: React.FC = () => {
    const { operationHistory, replayOperation } = useDemoStore();

    return (
      <div className="operation-history">
        <h3>操作记录</h3>
        <div className="history-list">
          {operationHistory.map(record => (
            <div key={record.id} className="history-item">
              <div className="item-time">
                {formatTime(record.timestamp)}
              </div>
              <div className="item-type">
                {getOperationTypeLabel(record.type)}
              </div>
              <div className="item-details">
                {renderOperationDetails(record.details)}
              </div>
              <button
                className="replay-btn"
                onClick={() => replayOperation(record.id)}
              >
                回放
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  ```
- **演示脚本系统**:
  ```typescript
  // 演示脚本定义
  interface DemoScript {
    id: string;
    name: string;
    description: string;
    steps: DemoScriptStep[];
  }

  interface DemoScriptStep {
    action: 'import' | 'analyze' | 'generate' | 'publish';
    params: any;
    delay?: number; // 步骤间延迟
    validation?: (state: DemoState) => boolean; // 验证条件
  }

  // 预置演示脚本
  const demoScripts: DemoScript[] = [
    {
      id: 'quick-demo',
      name: '快速演示',
      description: '5分钟完整流程演示',
      steps: [
        { action: 'import', params: { fileType: 'csv', recordCount: 500 }, delay: 1000 },
        { action: 'analyze', params: { analysisType: 'full' }, delay: 2000 },
        { action: 'generate', params: { planType: 'promotion' }, delay: 1500 },
        { action: 'publish', params: { platforms: ['wechat', 'xiaohongshu'] } },
      ]
    },
    // ... 更多脚本
  ];
  ```
- **验收标准**:
  - 交互逻辑完整，覆盖所有核心功能
  - 操作反馈及时明确
  - 演示脚本运行流畅，无错误
  - 用户可自主探索，也可跟随引导

### 政务版DEMO开发 (第4-6个月，与第三阶段并行)

#### 任务D2.1: 真实账号配置
- **任务描述**: 配置灵曜自身的真实社交媒体账号用于DEMO
- **技术方案**:
  - 申请和配置各平台开发者账号
  - 实现账号凭证安全管理
  - 开发账号测试和验证工具
  - 创建账号监控和维护机制
- **平台账号配置清单**:
  1. **微信公众号**:
     - 服务号或订阅号（已认证）
     - 开发者ID和密钥
     - IP白名单配置
     - 消息模板配置
  2. **小红书**:
     - 企业号或达人号
     - Cookie或Token凭证
     - 发布权限验证
  3. **微博**:
     - 企业微博账号
     - API访问令牌
     - 发布频率限制配置
  4. **抖音**:
     - 企业蓝V账号
     - 开放平台接入
     - 视频发布权限
- **账号凭证安全管理**:
  ```typescript
  // 账号凭证加密存储服务
  @Injectable()
  export class AccountCredentialService {
    private readonly encryptionKey: string;

    constructor(private configService: ConfigService) {
      this.encryptionKey = configService.get('ENCRYPTION_KEY');
    }

    // 加密存储凭证
    async encryptAndStoreCredential(
      accountId: string,
      platform: string,
      credentials: Record<string, string>
    ): Promise<void> {
      const encrypted = await this.encrypt(JSON.stringify(credentials));

      await this.accountRepo.save({
        accountId,
        platform,
        encryptedCredentials: encrypted,
        lastUpdated: new Date()
      });
    }

    // 解密获取凭证
    async getDecryptedCredential(accountId: string): Promise<Record<string, string>> {
      const account = await this.accountRepo.findOne({ where: { accountId } });
      if (!account) {
        throw new Error('Account not found');
      }

      const decrypted = await this.decrypt(account.encryptedCredentials);
      return JSON.parse(decrypted);
    }

    private async encrypt(text: string): Promise<string> {
      // 使用AES-GCM加密
      const crypto = require('crypto');
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();

      return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    }
  }
  ```
- **账号测试和验证**:
  ```typescript
  // 账号连接测试服务
  @Injectable()
  export class AccountConnectionTestService {
    async testWechatConnection(credentials: WechatCredentials): Promise<TestResult> {
      try {
        // 测试获取Access Token
        const token = await this.wechatApi.getAccessToken(
          credentials.appId,
          credentials.appSecret
        );

        // 测试API调用
        const userCount = await this.wechatApi.getUserCount(token);

        return {
          success: true,
          platform: 'wechat',
          message: `连接成功，关注用户数: ${userCount}`,
          details: { tokenExpiresIn: token.expires_in }
        };
      } catch (error) {
        return {
          success: false,
          platform: 'wechat',
          message: `连接失败: ${error.message}`,
          error: error.toString()
        };
      }
    }

    // 测试其他平台...
  }
  ```
- **验收标准**:
  - 所有平台账号配置完成，API调用正常
  - 账号凭证安全存储，无明文泄露风险
  - 账号连接测试通过率100%
  - 账号监控告警机制有效

#### 任务D2.2: 政府场景模拟
- **任务描述**: 模拟政府场景，如公文发布、防诈骗宣传、政策解读等
- **技术方案**:
  - 设计政府场景内容模板
  - 实现政府风格内容生成
  - 开发合规性检查规则
  - 创建场景演示剧本
- **政府场景类型**:
  1. **公文发布**:
     - 政府公告、通知、通报
     - 政策文件解读
     - 会议纪要发布
  2. **防诈骗宣传**:
     - 诈骗案例警示
     - 防骗知识普及
     - 举报渠道宣传
  3. **政策解读**:
     - 新政策要点解析
     - 政策影响分析
     - 申报指南制作
  4. **政务服务**:
     - 办事流程说明
     - 在线服务指南
     - 常见问题解答
- **政府风格内容模板**:
  ```typescript
  // 政府公文模板
  const governmentDocumentTemplate = {
    header: {
      title: "{{document_title}}",
      documentNumber: "{{document_number}}",
      issuingAuthority: "{{issuing_authority}}",
      issueDate: "{{issue_date}}"
    },
    body: {
      preface: "{{preface_text}}",
      mainContent: [
        {
          sectionTitle: "一、背景与意义",
          content: "{{background_and_significance}}"
        },
        {
          sectionTitle: "二、主要内容",
          content: "{{main_content}}"
        },
        {
          sectionTitle: "三、工作要求",
          content: "{{work_requirements}}"
        },
        {
          sectionTitle: "四、保障措施",
          content: "{{safeguard_measures}}"
        }
      ],
      conclusion: "{{conclusion_text}}"
    },
    footer: {
      contactInfo: "{{contact_information}}",
      attachments: "{{attachments_list}}"
    }
  };

  // 防诈骗宣传模板
  const antiFraudTemplate = {
    title: "警惕新型诈骗！{{fraud_type}}防范指南",
    structure: [
      "案例回顾：{{recent_case}}",
      "诈骗手法：{{fraud_methods}}",
      "识别要点：{{identification_points}}",
      "防范措施：{{prevention_measures}}",
      "紧急应对：{{emergency_response}}",
      "举报渠道：{{reporting_channels}}"
    ],
    tone: "严肃、警示、权威",
    visualStyle: "红头文件样式、警示标志"
  };
  ```
- **合规性检查规则**:
  ```typescript
  // 政府内容合规性检查器
  class GovernmentContentComplianceChecker {
    private readonly forbiddenTerms = [
      '国家机密', '商业秘密', '个人隐私',
      // ... 其他敏感词
    ];

    private readonly requiredElements = [
      '发文机关', '文号', '标题',
      // ... 其他必需元素
    ];

    async checkCompliance(content: GovernmentContent): Promise<ComplianceResult> {
      const issues: ComplianceIssue[] = [];

      // 检查敏感词
      for (const term of this.forbiddenTerms) {
        if (content.text.includes(term)) {
          issues.push({
            type: 'forbidden_term',
            severity: 'high',
            message: `包含敏感词: ${term}`,
            location: this.findTermLocation(content.text, term)
          });
        }
      }

      // 检查必需元素
      for (const element of this.requiredElements) {
        if (!content.metadata[element]) {
          issues.push({
            type: 'missing_element',
            severity: 'medium',
            message: `缺少必需元素: ${element}`,
            suggestion: `请添加${element}字段`
          });
        }
      }

      // 检查格式规范
      if (!this.checkFormat(content)) {
        issues.push({
          type: 'format_error',
          severity: 'low',
          message: '格式不符合政府公文规范',
          suggestion: '请参考政府公文格式模板'
        });
      }

      return {
        passed: issues.length === 0,
        issues,
        score: this.calculateComplianceScore(issues)
      };
    }
  }
  ```
- **场景演示剧本**:
  ```yaml
  # 政府场景演示剧本
  scenario: "政策宣传周活动策划"
  steps:
    - name: "数据准备"
      action: "import_government_data"
      params:
        data_type: "policy_documents"
        source: "政府网站"
        timeframe: "2026年第一季度"
      expected: "导入50+政策文件"

    - name: "政策分析"
      action: "analyze_policy_trends"
      params:
        focus_areas: ["民生", "经济", "环境"]
        analysis_depth: "deep"
      expected: "生成政策热点分析报告"

    - name: "宣传策划"
      action: "generate_propaganda_plan"
      params:
        target_audience: "市民、企业"
        channels: ["公众号", "宣传栏", "社区活动"]
        budget: 50000
      expected: "产出完整宣传方案"

    - name: "内容生成"
      action: "create_propaganda_content"
      params:
        formats: ["长图文", "短视频", "宣传册"]
        platforms: ["微信", "抖音", "线下"]
      expected: "生成多平台宣传内容"

    - name: "发布执行"
      action: "publish_and_monitor"
      params:
        schedule: "2026-04-01至2026-04-07"
        monitoring: true
      expected: "内容发布并跟踪效果"
  ```
- **验收标准**:
  - 政府场景模板覆盖主要业务类型
  - 生成内容符合政府公文规范
  - 合规性检查准确率≥95%
  - 场景演示剧本执行流畅

#### 任务D2.3: 全功能真实操作
- **任务描述**: 在政务版DEMO中进行全功能真实操作验证
- **技术方案**:
  - 设计端到端测试用例
  - 实现真实数据流验证
  - 开发性能和安全测试
  - 创建用户验收测试流程
- **端到端测试用例**:
  ```typescript
  // 政务版端到端测试
  describe('政务版全功能测试', () => {
    test('完整政策宣传流程', async () => {
      // 1. 登录政务版系统
      await page.goto('https://gov.lumina-media.demo/login');
      await page.fill('#username', 'gov-admin');
      await page.fill('#password', 'password123');
      await page.click('#login-btn');

      // 2. 导入政策数据
      await page.click('#import-policy-data');
      const filePath = path.join(__dirname, 'fixtures/policy-data.xlsx');
      await page.setInputFiles('#file-upload', filePath);
      await page.waitForSelector('.import-success');

      // 3. 运行政策分析
      await page.click('#run-policy-analysis');
      await page.waitForSelector('.analysis-complete', { timeout: 30000 });

      // 4. 生成宣传方案
      await page.fill('#campaign-budget', '50000');
      await page.selectOption('#target-audience', 'citizens');
      await page.click('#generate-campaign-plan');
      await page.waitForSelector('.plan-generated');

      // 5. 创建宣传内容
      await page.click('#create-content');
      await page.check('#format-long-article');
      await page.check('#platform-wechat');
      await page.click('#generate-content');
      await page.waitForSelector('.content-ready');

      // 6. 审批流程
      await page.click('#submit-for-approval');
      await page.fill('#approver-comments', '内容审核通过');
      await page.click('#approve-content');

      // 7. 发布内容
      await page.click('#publish-content');
      await page.waitForSelector('.publish-success', { timeout: 60000 });

      // 8. 验证发布结果
      const publishResult = await page.textContent('.publish-result');
      expect(publishResult).toContain('发布成功');

      // 9. 查看效果监测
      await page.click('#view-performance');
      const performanceData = await page.textContent('.performance-metrics');
      expect(performanceData).toContain('阅读量');
      expect(performanceData).toContain('点赞量');
    });
  });
  ```
- **真实数据流验证**:
  1. **数据源验证**: 确保使用真实政府数据源
  2. **AI调用验证**: 验证真实AI服务调用和计费
  3. **发布验证**: 验证内容真实发布到平台
  4. **效果验证**: 验证真实数据反馈和统计
- **性能测试指标**:
  - 并发用户数: ≥100
  - 响应时间: P95 < 2秒
  - 吞吐量: ≥100请求/秒
  - 可用性: ≥99.9%
- **安全测试项目**:
  1. **认证授权**: 多租户隔离、角色权限
  2. **数据安全**: 加密传输、脱敏处理
  3. **API安全**: 防注入、限流、审计
  4. **合规安全**: 隐私政策、数据合规
- **用户验收测试流程**:
  ```
  1. 测试环境准备 → 2. 测试用例执行 → 3. 缺陷记录跟踪
  4. 用户反馈收集 → 5. 问题修复验证 → 6. 验收签字确认
  ```
- **验收标准**:
  - 端到端测试通过率100%
  - 真实数据流验证无误
  - 性能指标达标
  - 安全测试无高危漏洞
  - 用户验收测试通过

## DEMO版本技术架构

### 双模式运行架构
```yaml
# docker-compose.demo.yml
version: '3.8'

services:
  # 商务版DEMO服务
  demo-business:
    build:
      context: .
      dockerfile: Dockerfile.backend
      args:
        - BUILD_ENV=demo
    container_name: lumina-demo-business
    environment:
      - NODE_ENV=demo
      - DEMO_MODE=business
      - CLOUD_PROVIDER=mock
      - DATA_SOURCE=mock
      - AI_PROVIDER=mock
      - DB_HOST=db-demo
      - DB_DATABASE=lumina_demo
    ports:
      - "3004:3003"
    depends_on:
      db-demo:
        condition: service_healthy
    volumes:
      - ./demo/business/data:/app/demo-data
    networks:
      - demo-network

  # 政务版DEMO服务
  demo-government:
    build:
      context: .
      dockerfile: Dockerfile.backend
      args:
        - BUILD_ENV=production
    container_name: lumina-demo-government
    environment:
      - NODE_ENV=production
      - DEMO_MODE=government
      - CLOUD_PROVIDER=alicloud
      - DATA_SOURCE=real
      - AI_PROVIDER=gemini
      - DB_HOST=db-gov
      - DB_DATABASE=lumina_gov
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - DASHSCOPE_API_KEY=${DASHSCOPE_API_KEY}
    ports:
      - "3005:3003"
    depends_on:
      db-gov:
        condition: service_healthy
    volumes:
      - ./demo/government/config:/app/config
    networks:
      - demo-network

  # DEMO共享数据库
  db-demo:
    image: mysql:8.0
    container_name: lumina-demo-db
    environment:
      MYSQL_ROOT_PASSWORD: demo_root_password
      MYSQL_DATABASE: lumina_demo
      MYSQL_USER: demo_user
      MYSQL_PASSWORD: demo_password
    ports:
      - "3308:3306"
    volumes:
      - demo_mysql_data:/var/lib/mysql
      - ./demo/sql/init-demo.sql:/docker-entrypoint-initdb.d/init.sql
    command: >
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 10s
      retries: 5
    networks:
      - demo-network

  # 政务版数据库
  db-gov:
    image: mysql:8.0
    container_name: lumina-gov-db
    environment:
      MYSQL_ROOT_PASSWORD: gov_root_password
      MYSQL_DATABASE: lumina_gov
      MYSQL_USER: gov_user
      MYSQL_PASSWORD: gov_password
    ports:
      - "3309:3306"
    volumes:
      - gov_mysql_data:/var/lib/mysql
      - ./demo/sql/init-gov.sql:/docker-entrypoint-initdb.d/init.sql
    command: >
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 10s
      retries: 5
    networks:
      - demo-network

  # DEMO前端
  demo-frontend:
    build:
      context: ./dashboard-web
      dockerfile: Dockerfile.frontend
      args:
        - VITE_API_BASE_URL=/
        - VITE_DEMO_MODE=true
    container_name: lumina-demo-frontend
    ports:
      - "5175:5174"
    environment:
      - VITE_BUSINESS_API_URL=http://demo-business:3003
      - VITE_GOVERNMENT_API_URL=http://demo-government:3003
    depends_on:
      - demo-business
      - demo-government
    volumes:
      - ./dashboard-web:/app
      - /app/node_modules
    networks:
      - demo-network

volumes:
  demo_mysql_data:
    driver: local
  gov_mysql_data:
    driver: local

networks:
  demo-network:
    driver: bridge
```

### 数据隔离策略
1. **数据库隔离**:
   - 商务版: `lumina_demo` 数据库，模拟数据
   - 政务版: `lumina_gov` 数据库，真实数据
   - 生产版: `lumina_media` 数据库，客户数据

2. **存储隔离**:
   - 商务版: 本地文件系统模拟存储
   - 政务版: 阿里云OSS专用bucket
   - 生产版: 客户专属OSS bucket

3. **AI服务隔离**:
   - 商务版: Mock AI服务，返回预定义结果
   - 政务版: 真实Gemini/Qwen API，有限额度
   - 生产版: 客户配置的AI服务，按需计费

4. **网络隔离**:
   - DEMO环境独立网络 `demo-network`
   - 生产环境独立VPC
   - 严格的安全组规则

## DEMO部署和运维

### 部署脚本
```bash
#!/bin/bash
# deploy-demo.sh

set -e

echo "开始部署LuminaMedia DEMO环境..."

# 1. 检查依赖
if ! command -v docker &> /dev/null; then
    echo "错误: Docker未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose未安装"
    exit 1
fi

# 2. 创建环境变量文件
if [ ! -f .env.demo ]; then
    echo "创建DEMO环境变量文件..."
    cp .env.demo.example .env.demo
    echo "请编辑 .env.demo 文件配置DEMO环境变量"
    exit 1
fi

# 3. 加载环境变量
export $(grep -v '^#' .env.demo | xargs)

# 4. 启动DEMO服务
echo "启动DEMO服务..."
docker-compose -f docker-compose.demo.yml up -d

# 5. 等待服务就绪
echo "等待服务就绪..."
sleep 30

# 6. 运行健康检查
echo "运行健康检查..."
./scripts/check-demo-health.sh

# 7. 初始化DEMO数据
echo "初始化DEMO数据..."
docker-compose -f docker-compose.demo.yml exec demo-business npm run demo:init

echo "DEMO环境部署完成！"
echo "访问地址:"
echo "- 商务版DEMO: http://localhost:5175/business"
echo "- 政务版DEMO: http://localhost:5175/government"
echo "- API文档: http://localhost:3004/api/docs (商务版)"
echo "- API文档: http://localhost:3005/api/docs (政务版)"
```

### 运维监控
1. **健康检查端点**:
   - `GET /health` - 应用健康状态
   - `GET /health/db` - 数据库连接状态
   - `GET /health/ai` - AI服务连接状态
   - `GET /health/storage` - 存储服务状态

2. **监控仪表板**:
   - 服务状态监控
   - 性能指标监控
   - 使用统计监控
   - 错误日志监控

3. **告警规则**:
   - 服务不可用告警
   - 性能下降告警
   - 错误率升高告警
   - 资源不足告警

## DEMO版本交付物清单

### 代码交付物
1. `demo/` - DEMO专用代码目录
2. `dashboard-web/src/demo/` - DEMO前端组件
3. `scripts/demo/` - DEMO部署和管理脚本
4. `docker-compose.demo.yml` - DEMO容器编排配置

### 数据交付物
1. `demo/data/mock/` - 商务版模拟数据
2. `demo/data/government/` - 政务版真实数据样本
3. `demo/sql/` - DEMO数据库初始化脚本
4. `demo/templates/` - 政府场景内容模板

### 文档交付物
1. `docs/demo/business-demo-guide.md` - 商务版DEMO使用指南
2. `docs/demo/government-demo-guide.md` - 政务版DEMO使用指南
3. `docs/demo/deployment-guide.md` - DEMO部署指南
4. `docs/demo/demo-scripts.md` - DEMO演示脚本手册

### 工具交付物
1. `tools/demo-data-generator/` - 模拟数据生成工具
2. `tools/demo-reset/` - DEMO重置工具
3. `tools/demo-migrator/` - DEMO数据迁移工具
4. `tools/demo-monitor/` - DEMO监控工具

## 成功标准

### 商务版DEMO成功标准
1. ✅ 模拟数据质量高，覆盖典型业务场景
2. ✅ 演示流程完整，5分钟内展示核心价值
3. ✅ 用户体验优秀，操作直观易懂
4. ✅ 性能稳定，无崩溃和严重错误

### 政务版DEMO成功标准
1. ✅ 真实账号配置完成，API调用正常
2. ✅ 政府场景模拟真实，内容符合规范
3. ✅ 全功能验证通过，端到端流程无断点
4. ✅ 安全合规，无数据泄露风险

### 整体DEMO成功标准
1. ✅ 双版本独立运行，互不干扰
2. ✅ 部署简便，一键启动和重置
3. ✅ 监控完善，问题及时发现和处理
4. ✅ 文档完整，用户可自助使用

## DEMO验收流程
1. **内部验收**: 开发团队验收功能完整性
2. **用户验收**: 目标用户验收体验和效果
3. **安全验收**: 安全团队验收安全性
4. **性能验收**: 性能团队验收性能指标
5. **文档验收**: 文档团队验收文档质量

---

**文件**: `tasks/phase-4-demo-development.md`
**版本**: 1.0
**更新日期**: 2026-03-26
**上一阶段**: [phase-3-advanced-features.md](./phase-3-advanced-features.md)
**关联阶段**: 与第一阶段、第三阶段并行进行
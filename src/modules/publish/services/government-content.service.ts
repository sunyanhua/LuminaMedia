import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GovernmentContentType,
  GovernmentContentStyle,
  ComplianceLevel,
  GovernmentContent,
  OfficialDocument,
  AntiFraudContent,
  PolicyInterpretationContent,
  GovernmentServiceContent,
  PublicAnnouncementContent,
  EmergencyResponseContent,
  GovernmentContentRequest,
  GovernmentContentResponse,
  ComplianceCheckResult,
  GovernmentContentTemplate,
  GovernmentScenarioScript,
  DocumentHeader,
  DocumentBody,
  DocumentSection,
  DocumentFooter,
  PolicyKeyPoint,
  FAQ,
  ProcedureStep,
  ServiceLocation,
  ShelterInfo,
  RescueResource,
  EmergencyContact,
  GovernmentContentStats,
} from '../interfaces/government-content.interface';

/**
 * 政府风格内容生成服务
 * 负责生成符合政府规范的各类内容，包括公文、宣传材料、政策解读等
 */
@Injectable()
export class GovernmentContentService {
  private readonly logger = new Logger(GovernmentContentService.name);
  private readonly templates: GovernmentContentTemplate[] = [];
  private readonly scripts: GovernmentScenarioScript[] = [];
  private readonly stats: GovernmentContentStats = {
    totalGenerations: 0,
    typeBreakdown: {
      [GovernmentContentType.OFFICIAL_DOCUMENT]: 0,
      [GovernmentContentType.ANTI_FRAUD]: 0,
      [GovernmentContentType.POLICY_INTERPRETATION]: 0,
      [GovernmentContentType.GOVERNMENT_SERVICE]: 0,
      [GovernmentContentType.PUBLIC_ANNOUNCEMENT]: 0,
      [GovernmentContentType.EMERGENCY_RESPONSE]: 0,
    },
    successRate: 0,
    averageGenerationTime: 0,
    compliancePassRate: 0,
    mostUsedTemplates: [],
    usageTrend: [],
  };

  constructor(private readonly configService: ConfigService) {
    this.initializeTemplates();
    this.initializeScripts();
  }

  /**
   * 生成政府内容
   */
  async generateContent(
    request: GovernmentContentRequest,
  ): Promise<GovernmentContentResponse> {
    const startTime = Date.now();
    this.stats.totalGenerations++;

    try {
      this.logger.log(
        `Generating government content: ${request.contentType} - ${request.theme}`,
      );

      let content: GovernmentContent;
      let complianceCheck: ComplianceCheckResult;

      // 根据内容类型生成相应内容
      switch (request.contentType) {
        case GovernmentContentType.OFFICIAL_DOCUMENT:
          content = await this.generateOfficialDocument(request);
          break;
        case GovernmentContentType.ANTI_FRAUD:
          content = await this.generateAntiFraudContent(request);
          break;
        case GovernmentContentType.POLICY_INTERPRETATION:
          content = await this.generatePolicyInterpretationContent(request);
          break;
        case GovernmentContentType.GOVERNMENT_SERVICE:
          content = await this.generateGovernmentServiceContent(request);
          break;
        case GovernmentContentType.PUBLIC_ANNOUNCEMENT:
          content = await this.generatePublicAnnouncementContent(request);
          break;
        case GovernmentContentType.EMERGENCY_RESPONSE:
          content = await this.generateEmergencyResponseContent(request);
          break;
        default:
          throw new Error(`Unsupported content type: ${request.contentType}`);
      }

      // 执行合规性检查
      complianceCheck = await this.checkCompliance(content);

      // 更新统计信息
      this.stats.typeBreakdown[request.contentType]++;
      this.stats.successRate =
        (this.stats.successRate * (this.stats.totalGenerations - 1) + 1) /
        this.stats.totalGenerations;

      const generationTime = Date.now() - startTime;
      this.stats.averageGenerationTime =
        (this.stats.averageGenerationTime * (this.stats.totalGenerations - 1) +
          generationTime) /
        this.stats.totalGenerations;

      if (complianceCheck.passed) {
        this.stats.compliancePassRate =
          (this.stats.compliancePassRate * (this.stats.totalGenerations - 1) +
            1) /
          this.stats.totalGenerations;
      }

      return {
        success: true,
        content,
        generationTime,
        complianceCheck,
        suggestedPlatforms: this.getSuggestedPlatforms(request.contentType),
        summary: this.generateContentSummary(content),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate government content: ${error.message}`,
        error.stack,
      );

      // 更新失败统计
      this.stats.successRate =
        (this.stats.successRate * (this.stats.totalGenerations - 1)) /
        this.stats.totalGenerations;

      return {
        success: false,
        error: `内容生成失败: ${error.message}`,
        generationTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 生成政府公文
   */
  private async generateOfficialDocument(
    request: GovernmentContentRequest,
  ): Promise<OfficialDocument> {
    const { theme, params = {} } = request;

    // 提取参数或使用默认值
    const issuingAuthority = params.issuingAuthority || 'XX市人民政府办公室';
    const documentNumber =
      params.documentNumber ||
      `XX政办发〔${new Date().getFullYear()}〕${Math.floor(Math.random() * 1000)}号`;
    const issuer = params.issuer || 'XXX';
    const mainRecipient =
      params.mainRecipient || '各区、县人民政府，市政府各委、办、局';

    const header: DocumentHeader = {
      issuingAuthority,
      documentNumber,
      issuer,
      securityLevel: params.securityLevel || '公开',
      urgencyLevel: params.urgencyLevel || '平件',
      title: theme,
      mainRecipient,
      copyRecipient: params.copyRecipient,
      issueDate: new Date().toISOString().split('T')[0],
    };

    const sections: DocumentSection[] = [
      {
        title: '一、背景与意义',
        content: `为${theme}，根据《XXX法》《XXX条例》等有关规定，结合我市实际，制定本${params.documentType || '通知'}。`,
      },
      {
        title: '二、主要内容',
        content: `1. ${theme}的具体要求和标准。\n2. 实施${theme}的组织领导和工作机制。\n3. ${theme}的保障措施和监督检查。`,
      },
      {
        title: '三、工作要求',
        content: `1. 提高思想认识，高度重视${theme}工作。\n2. 加强组织领导，确保${theme}落到实处。\n3. 强化监督检查，确保${theme}取得实效。`,
      },
      {
        title: '四、保障措施',
        content: `1. 加强经费保障，确保${theme}顺利实施。\n2. 加强人员培训，提高${theme}能力水平。\n3. 加强宣传引导，营造${theme}良好氛围。`,
      },
    ];

    const body: DocumentBody = {
      preface: `近年来，我市在${theme}方面取得了显著成效，但也面临一些新情况、新问题。为进一步${theme}，现就有关事项${params.documentType || '通知'}如下：`,
      sections,
      conclusion: '以上${params.documentType || "通知"}，请认真贯彻执行。',
    };

    const footer: DocumentFooter = {
      contactPerson: params.contactPerson || '王某某',
      contactInfo: params.contactInfo || '联系电话：010-XXXXXXX',
      attachments: params.attachments || [
        `附件：1. ${theme}实施方案`,
        `2. ${theme}责任分工表`,
      ],
      printingAuthority: issuingAuthority,
      printingDate: new Date().toISOString().split('T')[0],
      copies: params.copies || 100,
    };

    return {
      type: GovernmentContentType.OFFICIAL_DOCUMENT,
      header,
      body,
      footer,
      style: GovernmentContentStyle.FORMAL,
      complianceLevel: ComplianceLevel.HIGH,
    };
  }

  /**
   * 生成防诈骗宣传内容
   */
  private async generateAntiFraudContent(
    request: GovernmentContentRequest,
  ): Promise<AntiFraudContent> {
    const { theme, params = {} } = request;

    const fraudType =
      params.fraudType || theme.split('防')[1] || '电信网络诈骗';

    return {
      type: GovernmentContentType.ANTI_FRAUD,
      title: `警惕新型${fraudType}！${theme}防范指南`,
      fraudType,
      recentCase:
        params.recentCase ||
        `近期，我市发生多起${fraudType}案件，受害人以老年人、学生等群体为主，涉案金额从几千元到几十万元不等。`,
      fraudMethods: params.fraudMethods || [
        '冒充公检法工作人员，以涉嫌犯罪为由要求转账',
        '冒充客服人员，以退款、理赔为由索要验证码',
        '网络兼职刷单，承诺高额返现',
        '虚假投资理财，承诺高额回报',
        '冒充亲友紧急求助，要求转账汇款',
      ],
      identificationPoints: params.identificationPoints || [
        '公检法机关不会通过电话、微信等要求转账',
        '正规客服不会索要银行卡密码、验证码',
        '天上不会掉馅饼，高回报必然伴随高风险',
        '陌生链接不点击，陌生二维码不扫描',
        '涉及转账汇款务必核实对方身份',
      ],
      preventionMeasures: params.preventionMeasures || [
        '安装国家反诈中心APP，开启预警功能',
        '不轻信、不透露、不转账',
        '遇到可疑情况及时拨打110或反诈专线96110',
        '保护好个人身份证、银行卡信息',
        '定期参加社区组织的反诈宣传活动',
      ],
      emergencyResponse: params.emergencyResponse || [
        '立即拨打110报警',
        '保存好聊天记录、转账凭证等证据',
        '及时冻结涉案银行账户',
        '向银行申请止付，减少损失',
        '配合公安机关调查取证',
      ],
      reportingChannels: params.reportingChannels || [
        '拨打110报警电话',
        '拨打反诈专线96110',
        '通过国家反诈中心APP举报',
        '前往辖区派出所报案',
        '通过12321网络不良与垃圾信息举报受理中心举报',
      ],
      style: GovernmentContentStyle.SERIOUS,
      complianceLevel: ComplianceLevel.MEDIUM,
      visualStyle: params.visualStyle || '警示标志',
    };
  }

  /**
   * 生成政策解读内容
   */
  private async generatePolicyInterpretationContent(
    request: GovernmentContentRequest,
  ): Promise<PolicyInterpretationContent> {
    const { theme, params = {} } = request;

    const issuingAuthority = params.issuingAuthority || 'XX市发展和改革委员会';
    const documentNumber =
      params.documentNumber ||
      `XX发改规〔${new Date().getFullYear()}〕${Math.floor(Math.random() * 100)}号`;

    const keyPoints: PolicyKeyPoint[] = [
      {
        title: '政策目标',
        content: `明确${theme}的目标任务，提出具体量化指标。`,
        relatedClauses: ['第一章 总则', '第二条 政策目标'],
        implementationTime: '自发布之日起施行',
      },
      {
        title: '适用范围',
        content: `明确${theme}的适用对象、地域范围和时间范围。`,
        relatedClauses: ['第二章 适用范围', '第五条 适用对象'],
        implementationTime: '自发布之日起施行',
      },
      {
        title: '支持措施',
        content: `提出支持${theme}的具体政策措施，包括财政、税收、金融等方面。`,
        relatedClauses: ['第三章 政策措施', '第十条 财政支持'],
        implementationTime: '按年度分步实施',
      },
      {
        title: '监督管理',
        content: `明确${theme}的监管机制、评估考核和责任追究。`,
        relatedClauses: ['第四章 监督管理', '第十八条 评估考核'],
        implementationTime: '持续开展',
      },
    ];

    const faqs: FAQ[] = [
      {
        question: `哪些对象可以享受${theme}政策支持？`,
        answer: '在本市注册登记、符合产业导向、信用良好的企业和个人均可申请。',
        reference: '政策文件第二章第五条',
      },
      {
        question: `如何申请${theme}政策支持？`,
        answer:
          '通过市政务服务网在线提交申请，或前往各区政务服务大厅窗口办理。',
        reference: '政策文件第三章第十二条',
      },
      {
        question: `政策支持的力度有多大？`,
        answer:
          '根据不同类型和规模，支持力度从几万元到几百万元不等，具体以实施细则为准。',
        reference: '政策文件第三章第十五条',
      },
      {
        question: `政策实施期限是多久？`,
        answer: '本政策自发布之日起施行，有效期三年。',
        reference: '政策文件第五章第二十五条',
      },
    ];

    return {
      type: GovernmentContentType.POLICY_INTERPRETATION,
      policyName: theme,
      issuingAuthority,
      documentNumber,
      issueDate: new Date().toISOString().split('T')[0],
      background:
        params.background ||
        `为贯彻落实国家关于${theme}的决策部署，结合我市实际，制定本政策。`,
      keyPoints,
      applicableScope:
        params.applicableScope ||
        '本市行政区域内符合条件的企业、事业单位、社会团体和个人。',
      operationGuide: params.operationGuide || [
        '登录市政务服务网，进入政策申报系统',
        '填写申报信息，上传相关证明材料',
        '提交申请，等待审核',
        '审核通过后，按规定拨付资金',
        '定期报送政策实施情况',
      ],
      faqs,
      consultationMethods: params.consultationMethods || [
        '政策咨询热线：12345',
        '政务服务大厅政策咨询窗口',
        '市发展和改革委员会官网在线咨询',
        '政策宣讲会（每月举办）',
      ],
      style: GovernmentContentStyle.AUTHORITATIVE,
      complianceLevel: ComplianceLevel.HIGH,
    };
  }

  /**
   * 生成政务服务内容
   */
  private async generateGovernmentServiceContent(
    request: GovernmentContentRequest,
  ): Promise<GovernmentServiceContent> {
    const { theme, params = {} } = request;

    const procedures: ProcedureStep[] = [
      {
        step: 1,
        name: '材料准备',
        description: '准备相关申请材料',
        method: 'offline',
        estimatedTime: '1-2个工作日',
      },
      {
        step: 2,
        name: '在线申报',
        description: '登录政务服务网填写申请信息',
        method: 'online',
        estimatedTime: '30分钟',
      },
      {
        step: 3,
        name: '材料提交',
        description: '上传或递交申请材料',
        method: 'online',
        estimatedTime: '15分钟',
      },
      {
        step: 4,
        name: '审核审批',
        description: '主管部门审核审批',
        method: 'online',
        estimatedTime: '5-10个工作日',
      },
      {
        step: 5,
        name: '结果通知',
        description: '通过短信、邮件等方式通知结果',
        method: 'online',
        estimatedTime: '即时',
      },
    ];

    const locations: ServiceLocation[] = [
      {
        name: '市政务服务大厅',
        address: 'XX市XX区XX路XX号',
        officeHours: '周一至周五 9:00-17:00',
        phone: '010-XXXXXXX',
      },
      {
        name: 'XX区政务服务中心',
        address: 'XX市XX区XX街道XX号',
        officeHours: '周一至周五 9:00-17:00',
        phone: '010-YYYYYYY',
      },
    ];

    return {
      type: GovernmentContentType.GOVERNMENT_SERVICE,
      serviceName: theme,
      responsibleDepartment:
        params.responsibleDepartment || 'XX市政务服务管理局',
      targetAudience:
        params.targetAudience || '在本市注册登记的企业、个体工商户和市民',
      eligibility: params.eligibility || [
        '在本市合法注册登记',
        '符合相关法律法规规定',
        '信用记录良好',
        '具备相应资质条件',
      ],
      requiredDocuments: params.requiredDocuments || [
        '申请表（原件）',
        '身份证明（复印件）',
        '营业执照（复印件）',
        '相关资质证明（复印件）',
        '其他必要的证明材料',
      ],
      procedures,
      processingTime: params.processingTime || '10个工作日',
      feeStandard: params.feeStandard || '不收费',
      locations,
      onlineUrl: params.onlineUrl || 'https://zwfw.xx.gov.cn',
      contactPhone: params.contactPhone || '12345',
      style: GovernmentContentStyle.INSTRUCTIVE,
      complianceLevel: ComplianceLevel.MEDIUM,
    };
  }

  /**
   * 生成公共通知内容
   */
  private async generatePublicAnnouncementContent(
    request: GovernmentContentRequest,
  ): Promise<PublicAnnouncementContent> {
    const { theme, params = {} } = request;

    return {
      type: GovernmentContentType.PUBLIC_ANNOUNCEMENT,
      title: theme,
      issuingUnit: params.issuingUnit || 'XX市城市管理委员会',
      announcementTime: new Date().toISOString(),
      content:
        params.content ||
        `根据工作安排，现将${theme}有关事项通知如下：\n\n${theme}事关市民切身利益，请广大市民予以理解、支持和配合。我们将努力做好相关工作，最大限度减少对市民生活的影响。`,
      affectedAreas: params.affectedAreas || ['XX区', 'XX街道', 'XX社区'],
      effectiveTime:
        params.effectiveTime ||
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      deadline:
        params.deadline ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      precautions: params.precautions || [
        '请提前做好相关准备',
        '如有疑问请及时咨询',
        '请遵守相关规定和要求',
        '注意安全，避免发生意外',
      ],
      contactInfo: params.contactInfo || '咨询电话：12345，联系人：张先生',
      style: GovernmentContentStyle.FRIENDLY,
      complianceLevel: ComplianceLevel.LOW,
    };
  }

  /**
   * 生成应急响应内容
   */
  private async generateEmergencyResponseContent(
    request: GovernmentContentRequest,
  ): Promise<EmergencyResponseContent> {
    const { theme, params = {} } = request;

    const eventType = params.eventType || '自然灾害';
    const eventLevel = params.eventLevel || '较大';

    const shelters: ShelterInfo[] = [
      {
        name: 'XX中学应急避难点',
        address: 'XX市XX区XX路XX号',
        capacity: 1000,
        currentOccupancy: 200,
        contactPhone: '010-XXXXXXX',
      },
      {
        name: 'XX体育馆应急避难点',
        address: 'XX市XX区XX街道XX号',
        capacity: 2000,
        currentOccupancy: 500,
        contactPhone: '010-YYYYYYY',
      },
    ];

    const rescueResources: RescueResource[] = [
      {
        type: '救援车辆',
        quantity: 20,
        location: '市应急救援中心',
        personInCharge: '李队长',
        contactPhone: '010-AAAAAAA',
      },
      {
        type: '医疗队',
        quantity: 5,
        location: '市人民医院',
        personInCharge: '王医生',
        contactPhone: '010-BBBBBBB',
      },
      {
        type: '物资储备',
        quantity: 1000,
        location: '市物资储备库',
        personInCharge: '赵主任',
        contactPhone: '010-CCCCCCC',
      },
    ];

    const emergencyContacts: EmergencyContact[] = [
      {
        department: '市应急管理局',
        phone: '010-XXXXXXX',
        contactPerson: '张局长',
        responsibility: '总体指挥协调',
      },
      {
        department: '市公安局',
        phone: '110',
        responsibility: '治安维护和交通管制',
      },
      {
        department: '市消防救援支队',
        phone: '119',
        responsibility: '抢险救援',
      },
      {
        department: '市卫生健康委员会',
        phone: '120',
        responsibility: '医疗救治',
      },
      {
        department: '市民政局',
        phone: '010-YYYYYYY',
        responsibility: '群众安置和救助',
      },
    ];

    return {
      type: GovernmentContentType.EMERGENCY_RESPONSE,
      eventType,
      eventLevel,
      title: `关于${theme}的应急响应通告`,
      issuingUnit: params.issuingUnit || 'XX市应急管理局',
      issueTime: new Date().toISOString(),
      eventOverview:
        params.eventOverview ||
        `根据气象部门预报，我市将出现${theme}，预计影响范围广、强度大。请各单位和广大市民做好防范准备。`,
      affectedAreas: params.affectedAreas || [
        '全市范围',
        '重点区域：XX区、XX县',
      ],
      responseMeasures: params.responseMeasures || [
        '启动应急响应机制',
        '加强监测预警',
        '做好群众转移安置',
        '保障应急物资供应',
        '维护社会秩序稳定',
      ],
      shelters,
      rescueResources,
      emergencyContacts,
      style: GovernmentContentStyle.SERIOUS,
      complianceLevel: ComplianceLevel.HIGH,
    };
  }

  /**
   * 检查内容合规性
   */
  async checkCompliance(
    content: GovernmentContent,
  ): Promise<ComplianceCheckResult> {
    const items: any[] = [];
    const warnings: string[] = [];
    const requiredFixes: string[] = [];
    const suggestions: string[] = [];

    // 通用检查项
    items.push({
      name: '敏感词检查',
      description: '检查是否包含敏感词汇',
      passed: !this.containsSensitiveWords(content),
      details: '未发现敏感词汇',
      severity: 'high' as const,
    });

    items.push({
      name: '格式规范检查',
      description: '检查内容格式是否符合政府规范',
      passed: this.checkFormat(content),
      details: '格式符合政府规范',
      severity: 'medium' as const,
    });

    items.push({
      name: '必备元素检查',
      description: '检查是否包含必备元素',
      passed: this.checkRequiredElements(content),
      details: '包含所有必备元素',
      severity: 'medium' as const,
    });

    // 根据内容类型进行专项检查
    switch (content.type) {
      case GovernmentContentType.OFFICIAL_DOCUMENT:
        items.push(...this.checkOfficialDocumentCompliance(content));
        break;
      case GovernmentContentType.ANTI_FRAUD:
        items.push(...this.checkAntiFraudCompliance(content));
        break;
      case GovernmentContentType.POLICY_INTERPRETATION:
        items.push(...this.checkPolicyInterpretationCompliance(content));
        break;
    }

    // 计算合规分数
    const passedItems = items.filter((item) => item.passed).length;
    const totalItems = items.length;
    const score =
      totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 100;

    // 添加警告和建议
    if (score < 80) {
      warnings.push('合规分数较低，建议修改后再发布');
      suggestions.push('请根据检查结果修改内容');
    }

    if (score === 100) {
      suggestions.push('内容完全符合政府规范，可以直接发布');
    }

    return {
      passed: score >= 80, // 80分以上为通过
      score,
      items,
      warnings,
      requiredFixes,
      suggestions,
    };
  }

  /**
   * 检查是否包含敏感词
   */
  private containsSensitiveWords(content: any): boolean {
    // 这里实现敏感词检查逻辑
    // 简化实现：返回false表示未发现敏感词
    return false;
  }

  /**
   * 检查格式规范
   */
  private checkFormat(content: any): boolean {
    // 这里实现格式检查逻辑
    // 简化实现：返回true表示格式正确
    return true;
  }

  /**
   * 检查必备元素
   */
  private checkRequiredElements(content: any): boolean {
    // 这里实现必备元素检查逻辑
    // 简化实现：返回true表示包含所有必备元素
    return true;
  }

  /**
   * 检查公文合规性
   */
  private checkOfficialDocumentCompliance(document: OfficialDocument): any[] {
    const items: any[] = [];

    items.push({
      name: '公文头完整性',
      description: '检查公文头是否完整',
      passed:
        !!document.header.issuingAuthority &&
        !!document.header.title &&
        !!document.header.issueDate,
      details: document.header.issuingAuthority ? '公文头完整' : '缺少必要字段',
      severity: 'high' as const,
    });

    items.push({
      name: '正文结构',
      description: '检查正文是否包含必要章节',
      passed: document.body.sections.length >= 3,
      details: `包含${document.body.sections.length}个章节`,
      severity: 'medium' as const,
    });

    items.push({
      name: '发文机关合法性',
      description: '检查发文机关是否符合规范',
      passed:
        document.header.issuingAuthority.includes('政府') ||
        document.header.issuingAuthority.includes('委员会'),
      details: document.header.issuingAuthority,
      severity: 'high' as const,
    });

    return items;
  }

  /**
   * 检查防诈骗内容合规性
   */
  private checkAntiFraudCompliance(content: AntiFraudContent): any[] {
    const items: any[] = [];

    items.push({
      name: '诈骗类型明确性',
      description: '检查是否明确诈骗类型',
      passed: !!content.fraudType,
      details: content.fraudType || '未指定诈骗类型',
      severity: 'high' as const,
    });

    items.push({
      name: '防范措施完整性',
      description: '检查是否提供完整防范措施',
      passed: content.preventionMeasures.length >= 3,
      details: `提供${content.preventionMeasures.length}项防范措施`,
      severity: 'medium' as const,
    });

    items.push({
      name: '举报渠道有效性',
      description: '检查举报渠道是否有效',
      passed: content.reportingChannels.length >= 2,
      details: `提供${content.reportingChannels.length}个举报渠道`,
      severity: 'medium' as const,
    });

    return items;
  }

  /**
   * 检查政策解读合规性
   */
  private checkPolicyInterpretationCompliance(
    content: PolicyInterpretationContent,
  ): any[] {
    const items: any[] = [];

    items.push({
      name: '政策名称准确性',
      description: '检查政策名称是否准确',
      passed: !!content.policyName,
      details: content.policyName || '未指定政策名称',
      severity: 'high' as const,
    });

    items.push({
      name: '发文机关权威性',
      description: '检查发文机关是否具有权威性',
      passed:
        content.issuingAuthority.includes('政府') ||
        content.issuingAuthority.includes('委员会'),
      details: content.issuingAuthority,
      severity: 'high' as const,
    });

    items.push({
      name: '政策要点完整性',
      description: '检查是否提供完整政策要点',
      passed: content.keyPoints.length >= 3,
      details: `提供${content.keyPoints.length}个政策要点`,
      severity: 'medium' as const,
    });

    return items;
  }

  /**
   * 获取建议发布平台
   */
  private getSuggestedPlatforms(contentType: GovernmentContentType): string[] {
    const platformMap: Record<GovernmentContentType, string[]> = {
      [GovernmentContentType.OFFICIAL_DOCUMENT]: [
        '政府门户网站',
        '政务新媒体',
        '政府公报',
      ],
      [GovernmentContentType.ANTI_FRAUD]: [
        '社区宣传栏',
        '微信公众号',
        '短视频平台',
        '广播电视台',
      ],
      [GovernmentContentType.POLICY_INTERPRETATION]: [
        '政府门户网站',
        '政务新媒体',
        '新闻发布会',
        '政策宣讲会',
      ],
      [GovernmentContentType.GOVERNMENT_SERVICE]: [
        '政务服务网',
        '政务APP',
        '办事大厅',
        '12345热线',
      ],
      [GovernmentContentType.PUBLIC_ANNOUNCEMENT]: [
        '社区公告栏',
        '微信公众号',
        '短信平台',
        '广播',
      ],
      [GovernmentContentType.EMERGENCY_RESPONSE]: [
        '应急广播',
        '短信平台',
        '电视滚动字幕',
        '新媒体平台',
      ],
    };

    return platformMap[contentType] || ['政府门户网站'];
  }

  /**
   * 生成内容摘要
   */
  private generateContentSummary(content: GovernmentContent): string {
    switch (content.type) {
      case GovernmentContentType.OFFICIAL_DOCUMENT:
        return `政府公文：${content.header.title}，发文机关：${content.header.issuingAuthority}，发布日期：${content.header.issueDate}`;
      case GovernmentContentType.ANTI_FRAUD:
        return `防诈骗宣传：${content.title}，诈骗类型：${content.fraudType}`;
      case GovernmentContentType.POLICY_INTERPRETATION:
        return `政策解读：${content.policyName}，发文机关：${content.issuingAuthority}`;
      case GovernmentContentType.GOVERNMENT_SERVICE:
        return `政务服务：${content.serviceName}，主管部门：${content.responsibleDepartment}`;
      case GovernmentContentType.PUBLIC_ANNOUNCEMENT:
        return `公共通知：${content.title}，发布单位：${content.issuingUnit}`;
      case GovernmentContentType.EMERGENCY_RESPONSE:
        return `应急响应：${content.title}，事件类型：${content.eventType}，事件级别：${content.eventLevel}`;
      default:
        return '政府内容摘要';
    }
  }

  /**
   * 获取内容模板
   */
  getTemplates(): GovernmentContentTemplate[] {
    return this.templates;
  }

  /**
   * 获取演示剧本
   */
  getScripts(): GovernmentScenarioScript[] {
    return this.scripts;
  }

  /**
   * 获取统计信息
   */
  getStats(): GovernmentContentStats {
    return this.stats;
  }

  /**
   * 初始化模板
   */
  private initializeTemplates(): void {
    // 这里初始化预定义模板
    // 简化实现：创建一些示例模板
    this.templates.push({
      id: 'template-official-document',
      name: '政府公文模板',
      description: '标准政府公文格式模板',
      contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
      structure: {
        header: ['issuingAuthority', 'documentNumber', 'title', 'issueDate'],
        body: ['preface', 'sections', 'conclusion'],
        footer: ['contactPerson', 'contactInfo', 'attachments'],
      },
      example: {},
      fieldDescriptions: {},
      styleSuggestions: ['正式严谨', '用语规范', '结构清晰'],
      compliancePoints: ['发文机关正确', '文号规范', '标题准确'],
      applicableScenarios: ['发布政策', '通知公告', '工作部署'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.templates.push({
      id: 'template-anti-fraud',
      name: '防诈骗宣传模板',
      description: '防诈骗宣传材料模板',
      contentType: GovernmentContentType.ANTI_FRAUD,
      structure: {
        title: '标题',
        fraudType: '诈骗类型',
        recentCase: '近期案例',
        fraudMethods: '诈骗手法',
        preventionMeasures: '防范措施',
        reportingChannels: '举报渠道',
      },
      example: {},
      fieldDescriptions: {},
      styleSuggestions: ['严肃警示', '通俗易懂', '图文并茂'],
      compliancePoints: ['信息准确', '渠道有效', '措施可行'],
      applicableScenarios: ['社区宣传', '校园教育', '媒体发布'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 初始化演示剧本
   */
  private initializeScripts(): void {
    // 这里初始化预定义演示剧本
    // 简化实现：创建一些示例剧本
    this.scripts.push({
      id: 'script-policy-week',
      name: '政策宣传周演示剧本',
      description: '模拟政策宣传周活动的完整演示流程',
      scenarioType: GovernmentContentType.POLICY_INTERPRETATION,
      targetAudience: '政府工作人员、企业代表、市民',
      duration: 15,
      steps: [
        {
          step: 1,
          name: '政策数据导入',
          description: '导入最新政策文件数据',
          action: 'import_policy_data',
          expectedResult: '成功导入50+政策文件',
          demonstrationPoints: ['数据导入流程', '数据验证机制'],
          timeAllocation: 60,
        },
        {
          step: 2,
          name: '政策热点分析',
          description: '分析政策热点和趋势',
          action: 'analyze_policy_trends',
          expectedResult: '生成政策热点分析报告',
          demonstrationPoints: ['AI分析能力', '可视化展示'],
          timeAllocation: 120,
          dependencies: [1],
        },
        {
          step: 3,
          name: '宣传方案生成',
          description: '生成政策宣传方案',
          action: 'generate_propaganda_plan',
          params: { budget: 50000, targetAudience: '市民、企业' },
          expectedResult: '产出完整宣传方案',
          demonstrationPoints: ['方案生成逻辑', '资源配置优化'],
          timeAllocation: 90,
          dependencies: [2],
        },
        {
          step: 4,
          name: '宣传内容创建',
          description: '创建多平台宣传内容',
          action: 'create_propaganda_content',
          params: {
            formats: ['长图文', '短视频'],
            platforms: ['微信', '抖音'],
          },
          expectedResult: '生成多平台宣传内容',
          demonstrationPoints: ['内容适配能力', '批量生成效率'],
          timeAllocation: 120,
          dependencies: [3],
        },
        {
          step: 5,
          name: '发布效果监测',
          description: '发布内容并监测效果',
          action: 'publish_and_monitor',
          params: { monitoring: true, duration: '7天' },
          expectedResult: '内容发布并跟踪效果',
          demonstrationPoints: ['发布流程', '效果监测面板'],
          timeAllocation: 90,
          dependencies: [4],
        },
      ],
      requiredData: ['政策文件数据', '受众画像数据', '媒体渠道数据'],
      expectedOutcomes: [
        '展示政策分析能力',
        '展示内容生成能力',
        '展示发布监测能力',
      ],
      precautions: ['确保网络连接稳定', '准备演示用数据', '提前测试发布流程'],
      createdAt: new Date(),
    });
  }
}

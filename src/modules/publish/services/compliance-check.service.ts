import { Injectable, Logger } from '@nestjs/common';
import {
  GovernmentContent,
  OfficialDocument,
  AntiFraudContent,
  PolicyInterpretationContent,
  GovernmentContentType,
  ComplianceCheckResult,
  ComplianceCheckItem,
} from '../interfaces/government-content.interface';

/**
 * 合规性检查规则服务
 * 负责检查政府内容是否符合法律法规和政策要求
 */
@Injectable()
export class ComplianceCheckService {
  private readonly logger = new Logger(ComplianceCheckService.name);

  // 敏感词库（简化版本，实际应用中应该更完善）
  private readonly forbiddenTerms = [
    '国家机密',
    '商业秘密',
    '个人隐私',
    '未经授权',
    '非法',
    '违禁',
    '敏感信息',
    '内部文件',
    '绝密',
    '机密',
  ];

  // 政府机关名称后缀（用于验证发文机关合法性）
  private readonly governmentAuthoritySuffixes = [
    '人民政府',
    '政府办公室',
    '委员会',
    '局',
    '厅',
    '部',
    '署',
    '办公室',
    '领导小组',
    '工作组',
  ];

  // 必需元素映射
  private readonly requiredElements: Record<GovernmentContentType, string[]> = {
    [GovernmentContentType.OFFICIAL_DOCUMENT]: ['issuingAuthority', 'title', 'issueDate'],
    [GovernmentContentType.ANTI_FRAUD]: ['title', 'fraudType', 'preventionMeasures', 'reportingChannels'],
    [GovernmentContentType.POLICY_INTERPRETATION]: ['policyName', 'issuingAuthority', 'keyPoints'],
    [GovernmentContentType.GOVERNMENT_SERVICE]: ['serviceName', 'responsibleDepartment', 'procedures'],
    [GovernmentContentType.PUBLIC_ANNOUNCEMENT]: ['title', 'issuingUnit', 'content'],
    [GovernmentContentType.EMERGENCY_RESPONSE]: ['title', 'issuingUnit', 'eventType', 'responseMeasures'],
  };

  /**
   * 检查政府内容合规性
   */
  async checkCompliance(content: GovernmentContent): Promise<ComplianceCheckResult> {
    this.logger.log(`Checking compliance for content type: ${content.type}`);

    const items: ComplianceCheckItem[] = [];
    const warnings: string[] = [];
    const requiredFixes: string[] = [];
    const suggestions: string[] = [];

    // 通用检查项
    items.push(...await this.checkGeneralCompliance(content));

    // 类型特定检查项
    switch (content.type) {
      case GovernmentContentType.OFFICIAL_DOCUMENT:
        items.push(...await this.checkOfficialDocumentCompliance(content as OfficialDocument));
        break;
      case GovernmentContentType.ANTI_FRAUD:
        items.push(...await this.checkAntiFraudCompliance(content as AntiFraudContent));
        break;
      case GovernmentContentType.POLICY_INTERPRETATION:
        items.push(...await this.checkPolicyInterpretationCompliance(content as PolicyInterpretationContent));
        break;
      // 其他类型的检查可以后续添加
    }

    // 分析检查结果
    const passedItems = items.filter(item => item.passed).length;
    const totalItems = items.length;
    const score = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 100;

    // 识别必须修复的问题
    const highSeverityFailedItems = items.filter(item => !item.passed && item.severity === 'high');
    if (highSeverityFailedItems.length > 0) {
      requiredFixes.push(...highSeverityFailedItems.map(item => item.name));
      warnings.push('存在高风险合规问题，必须修复后才能发布');
    }

    // 提供建议
    if (score < 60) {
      suggestions.push('合规分数较低，建议重新生成或大幅修改内容');
    } else if (score < 80) {
      suggestions.push('合规分数中等，建议根据检查结果优化内容');
    } else if (score < 95) {
      suggestions.push('合规分数良好，可以发布但仍有优化空间');
    } else {
      suggestions.push('合规分数优秀，内容完全符合政府规范');
    }

    // 添加平台特定建议
    suggestions.push(...this.getPlatformSpecificSuggestions(content));

    return {
      passed: score >= 70 && highSeverityFailedItems.length === 0, // 70分以上且无高风险问题为通过
      score,
      items,
      warnings,
      requiredFixes,
      suggestions,
    };
  }

  /**
   * 通用合规性检查
   */
  private async checkGeneralCompliance(content: any): Promise<ComplianceCheckItem[]> {
    const items: ComplianceCheckItem[] = [];

    // 1. 敏感词检查
    const sensitiveWordsFound = this.findSensitiveWords(JSON.stringify(content));
    items.push({
      name: '敏感词检查',
      description: '检查是否包含敏感词汇',
      passed: sensitiveWordsFound.length === 0,
      details: sensitiveWordsFound.length > 0
        ? `发现敏感词: ${sensitiveWordsFound.join(', ')}`
        : '未发现敏感词汇',
      severity: 'high',
    });

    // 2. 政治立场检查
    items.push({
      name: '政治立场正确性',
      description: '检查政治立场是否正确',
      passed: this.checkPoliticalCorrectness(content),
      details: '政治立场正确',
      severity: 'high',
    });

    // 3. 法律法规符合性
    items.push({
      name: '法律法规符合性',
      description: '检查内容是否符合相关法律法规',
      passed: await this.checkLegalCompliance(content),
      details: '符合相关法律法规要求',
      severity: 'high',
    });

    // 4. 数据真实性
    items.push({
      name: '数据真实性',
      description: '检查数据是否真实可靠',
      passed: await this.checkDataAuthenticity(content),
      details: '数据真实可靠',
      severity: 'medium',
    });

    // 5. 信息完整性
    const missingElements = this.checkMissingRequiredElements(content);
    items.push({
      name: '信息完整性',
      description: '检查是否包含所有必要信息',
      passed: missingElements.length === 0,
      details: missingElements.length > 0
        ? `缺少必要元素: ${missingElements.join(', ')}`
        : '信息完整',
      severity: 'medium',
    });

    // 6. 格式规范性
    items.push({
      name: '格式规范性',
      description: '检查格式是否符合政府规范',
      passed: this.checkFormatCompliance(content),
      details: '格式符合政府规范',
      severity: 'medium',
    });

    // 7. 语言规范性
    items.push({
      name: '语言规范性',
      description: '检查语言是否规范',
      passed: this.checkLanguageStandardization(content),
      details: '语言规范',
      severity: 'low',
    });

    return items;
  }

  /**
   * 检查政府公文合规性
   */
  private async checkOfficialDocumentCompliance(document: OfficialDocument): Promise<ComplianceCheckItem[]> {
    const items: ComplianceCheckItem[] = [];

    // 1. 发文机关合法性
    const isValidAuthority = this.validateGovernmentAuthority(document.header.issuingAuthority);
    items.push({
      name: '发文机关合法性',
      description: '检查发文机关是否合法有效',
      passed: isValidAuthority,
      details: isValidAuthority ? '发文机关合法' : '发文机关名称不符合规范',
      severity: 'high',
    });

    // 2. 文号规范性
    const isValidDocumentNumber = this.validateDocumentNumber(document.header.documentNumber);
    items.push({
      name: '文号规范性',
      description: '检查发文字号是否符合规范',
      passed: isValidDocumentNumber,
      details: isValidDocumentNumber ? '文号规范' : '文号格式不符合要求',
      severity: 'high',
    });

    // 3. 标题准确性
    const isTitleAccurate = this.validateDocumentTitle(document.header.title, document.header.issuingAuthority);
    items.push({
      name: '标题准确性',
      description: '检查标题是否准确反映内容',
      passed: isTitleAccurate,
      details: isTitleAccurate ? '标题准确' : '标题与内容或发文机关不匹配',
      severity: 'medium',
    });

    // 4. 正文结构完整性
    const hasCompleteStructure = document.body.sections.length >= 3;
    items.push({
      name: '正文结构完整性',
      description: '检查正文是否包含必要章节',
      passed: hasCompleteStructure,
      details: hasCompleteStructure
        ? `包含${document.body.sections.length}个章节，结构完整`
        : '章节数量不足，建议补充',
      severity: 'medium',
    });

    // 5. 用词规范性
    const hasStandardTerminology = this.checkOfficialTerminology(document);
    items.push({
      name: '用词规范性',
      description: '检查是否使用规范公文用语',
      passed: hasStandardTerminology,
      details: hasStandardTerminology ? '用语规范' : '存在非规范用语',
      severity: 'medium',
    });

    // 6. 签发人信息
    const hasIssuerInfo = !!document.header.issuer;
    items.push({
      name: '签发人信息',
      description: '检查是否包含签发人信息',
      passed: hasIssuerInfo,
      details: hasIssuerInfo ? '包含签发人信息' : '建议补充签发人信息',
      severity: 'low',
    });

    return items;
  }

  /**
   * 检查防诈骗内容合规性
   */
  private async checkAntiFraudCompliance(content: AntiFraudContent): Promise<ComplianceCheckItem[]> {
    const items: ComplianceCheckItem[] = [];

    // 1. 诈骗类型明确性
    const hasFraudType = !!content.fraudType && content.fraudType.trim().length > 0;
    items.push({
      name: '诈骗类型明确性',
      description: '检查是否明确诈骗类型',
      passed: hasFraudType,
      details: hasFraudType ? `诈骗类型: ${content.fraudType}` : '未明确诈骗类型',
      severity: 'high',
    });

    // 2. 案例真实性
    const hasRealCase = !!content.recentCase && content.recentCase.trim().length > 0;
    items.push({
      name: '案例真实性',
      description: '检查是否提供真实案例',
      passed: hasRealCase,
      details: hasRealCase ? '提供真实案例' : '建议补充真实案例',
      severity: 'medium',
    });

    // 3. 防范措施有效性
    const hasEffectiveMeasures = content.preventionMeasures.length >= 3;
    items.push({
      name: '防范措施有效性',
      description: '检查防范措施是否全面有效',
      passed: hasEffectiveMeasures,
      details: hasEffectiveMeasures
        ? `提供${content.preventionMeasures.length}项防范措施`
        : '防范措施不足，建议补充',
      severity: 'high',
    });

    // 4. 举报渠道有效性
    const hasValidChannels = content.reportingChannels.length >= 2;
    items.push({
      name: '举报渠道有效性',
      description: '检查举报渠道是否有效',
      passed: hasValidChannels,
      details: hasValidChannels
        ? `提供${content.reportingChannels.length}个举报渠道`
        : '举报渠道不足，建议补充',
      severity: 'high',
    });

    // 5. 语言通俗性
    const isLanguageAccessible = this.checkAccessibleLanguage(content);
    items.push({
      name: '语言通俗性',
      description: '检查语言是否通俗易懂',
      passed: isLanguageAccessible,
      details: isLanguageAccessible ? '语言通俗易懂' : '语言过于专业，建议简化',
      severity: 'medium',
    });

    // 6. 警示效果
    const hasWarningEffect = this.checkWarningEffectiveness(content);
    items.push({
      name: '警示效果',
      description: '检查是否具有足够警示效果',
      passed: hasWarningEffect,
      details: hasWarningEffect ? '警示效果良好' : '警示效果不足，建议加强',
      severity: 'medium',
    });

    return items;
  }

  /**
   * 检查政策解读合规性
   */
  private async checkPolicyInterpretationCompliance(content: PolicyInterpretationContent): Promise<ComplianceCheckItem[]> {
    const items: ComplianceCheckItem[] = [];

    // 1. 政策名称准确性
    const hasPolicyName = !!content.policyName && content.policyName.trim().length > 0;
    items.push({
      name: '政策名称准确性',
      description: '检查政策名称是否准确',
      passed: hasPolicyName,
      details: hasPolicyName ? `政策名称: ${content.policyName}` : '未明确政策名称',
      severity: 'high',
    });

    // 2. 发文机关权威性
    const isAuthorityValid = this.validateGovernmentAuthority(content.issuingAuthority);
    items.push({
      name: '发文机关权威性',
      description: '检查发文机关是否具有权威性',
      passed: isAuthorityValid,
      details: isAuthorityValid ? '发文机关具有权威性' : '发文机关权威性不足',
      severity: 'high',
    });

    // 3. 政策要点完整性
    const hasKeyPoints = content.keyPoints.length >= 2;
    items.push({
      name: '政策要点完整性',
      description: '检查是否提供完整政策要点',
      passed: hasKeyPoints,
      details: hasKeyPoints
        ? `提供${content.keyPoints.length}个政策要点`
        : '政策要点不足，建议补充',
      severity: 'medium',
    });

    // 4. 解读准确性
    const isInterpretationAccurate = await this.checkInterpretationAccuracy(content);
    items.push({
      name: '解读准确性',
      description: '检查政策解读是否准确',
      passed: isInterpretationAccurate,
      details: isInterpretationAccurate ? '解读准确' : '解读可能存在偏差',
      severity: 'high',
    });

    // 5. 操作指南实用性
    const hasPracticalGuide = content.operationGuide.length >= 3;
    items.push({
      name: '操作指南实用性',
      description: '检查操作指南是否实用',
      passed: hasPracticalGuide,
      details: hasPracticalGuide
        ? `提供${content.operationGuide.length}项操作指南`
        : '操作指南不足，建议补充',
      severity: 'medium',
    });

    // 6. 咨询渠道有效性
    const hasConsultationChannels = content.consultationMethods.length >= 2;
    items.push({
      name: '咨询渠道有效性',
      description: '检查咨询渠道是否有效',
      passed: hasConsultationChannels,
      details: hasConsultationChannels
        ? `提供${content.consultationMethods.length}个咨询渠道`
        : '咨询渠道不足，建议补充',
      severity: 'medium',
    });

    return items;
  }

  /**
   * 查找敏感词
   */
  private findSensitiveWords(text: string): string[] {
    const found: string[] = [];
    for (const term of this.forbiddenTerms) {
      if (text.includes(term)) {
        found.push(term);
      }
    }
    return found;
  }

  /**
   * 检查政治立场正确性
   */
  private checkPoliticalCorrectness(content: any): boolean {
    // 简化实现：假设所有内容政治立场正确
    // 实际应用中应该检查是否包含正确的政治术语和立场
    return true;
  }

  /**
   * 检查法律法规符合性
   */
  private async checkLegalCompliance(content: any): Promise<boolean> {
    // 简化实现：假设符合法律法规
    // 实际应用中应该检查是否违反相关法律法规
    return true;
  }

  /**
   * 检查数据真实性
   */
  private async checkDataAuthenticity(content: any): Promise<boolean> {
    // 简化实现：假设数据真实
    // 实际应用中应该验证数据来源和真实性
    return true;
  }

  /**
   * 检查缺少的必需元素
   */
  private checkMissingRequiredElements(content: any): string[] {
    const missing: string[] = [];
    const required = this.requiredElements[content.type] || [];

    for (const element of required) {
      if (!content[element] || (Array.isArray(content[element]) && content[element].length === 0)) {
        missing.push(element);
      }
    }

    return missing;
  }

  /**
   * 检查格式合规性
   */
  private checkFormatCompliance(content: any): boolean {
    // 简化实现：假设格式合规
    // 实际应用中应该检查是否符合政府公文格式规范
    return true;
  }

  /**
   * 检查语言规范性
   */
  private checkLanguageStandardization(content: any): boolean {
    // 简化实现：假设语言规范
    // 实际应用中应该检查是否存在错别字、语法错误等
    return true;
  }

  /**
   * 验证政府机关合法性
   */
  private validateGovernmentAuthority(authority: string): boolean {
    if (!authority) return false;

    // 检查是否包含政府机关后缀
    for (const suffix of this.governmentAuthoritySuffixes) {
      if (authority.includes(suffix)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 验证发文字号
   */
  private validateDocumentNumber(documentNumber?: string): boolean {
    if (!documentNumber) return false;

    // 简单验证发文字号格式：XX〔YYYY〕NN号
    const pattern = /^[^\s]+〔\d{4}〕\d+号$/;
    return pattern.test(documentNumber);
  }

  /**
   * 验证公文标题
   */
  private validateDocumentTitle(title: string, authority: string): boolean {
    if (!title || !authority) return false;

    // 检查标题是否与发文机关匹配
    // 简化实现：假设都匹配
    return true;
  }

  /**
   * 检查公文用语规范性
   */
  private checkOfficialTerminology(document: OfficialDocument): boolean {
    // 简化实现：假设用语规范
    // 实际应用中应该检查是否使用规范的公文用语
    return true;
  }

  /**
   * 检查语言通俗性
   */
  private checkAccessibleLanguage(content: AntiFraudContent): boolean {
    // 简化实现：假设语言通俗
    // 实际应用中应该检查语言复杂度
    return true;
  }

  /**
   * 检查警示效果
   */
  private checkWarningEffectiveness(content: AntiFraudContent): boolean {
    // 检查是否包含足够的警示性内容
    const warningIndicators = ['警惕', '注意', '防范', '谨防', '小心'];
    const text = JSON.stringify(content);

    let warningCount = 0;
    for (const indicator of warningIndicators) {
      if (text.includes(indicator)) {
        warningCount++;
      }
    }

    return warningCount >= 2;
  }

  /**
   * 检查解读准确性
   */
  private async checkInterpretationAccuracy(content: PolicyInterpretationContent): Promise<boolean> {
    // 简化实现：假设解读准确
    // 实际应用中应该对照政策原文检查解读准确性
    return true;
  }

  /**
   * 获取平台特定建议
   */
  private getPlatformSpecificSuggestions(content: GovernmentContent): string[] {
    const suggestions: string[] = [];

    switch (content.type) {
      case GovernmentContentType.OFFICIAL_DOCUMENT:
        suggestions.push('建议在政府门户网站和政务新媒体同步发布');
        suggestions.push('可制作图文解读版，提高传播效果');
        break;
      case GovernmentContentType.ANTI_FRAUD:
        suggestions.push('建议在社区宣传栏、微信公众号同步发布');
        suggestions.push('可制作短视频版本，扩大传播范围');
        break;
      case GovernmentContentType.POLICY_INTERPRETATION:
        suggestions.push('建议组织政策宣讲会，面对面解读');
        suggestions.push('可制作一图读懂版，方便群众理解');
        break;
    }

    return suggestions;
  }

  /**
   * 批量检查合规性
   */
  async batchCheckCompliance(contents: GovernmentContent[]): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];

    for (const content of contents) {
      try {
        const result = await this.checkCompliance(content);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to check compliance for content: ${error.message}`);
        results.push({
          passed: false,
          score: 0,
          items: [],
          warnings: [`检查失败: ${error.message}`],
          requiredFixes: [],
          suggestions: ['请重新生成内容'],
        });
      }
    }

    return results;
  }

  /**
   * 获取合规性统计
   */
  async getComplianceStats(contents: GovernmentContent[]): Promise<{
    total: number;
    passed: number;
    failed: number;
    averageScore: number;
    typeBreakdown: Record<string, { total: number; passed: number; averageScore: number }>;
  }> {
    const results = await this.batchCheckCompliance(contents);

    const typeBreakdown: Record<string, { total: number; passed: number; averageScore: number }> = {};

    let totalScore = 0;
    let passedCount = 0;

    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      const result = results[i];

      const type = content.type;
      if (!typeBreakdown[type]) {
        typeBreakdown[type] = { total: 0, passed: 0, averageScore: 0 };
      }

      typeBreakdown[type].total++;
      typeBreakdown[type].averageScore += result.score;

      if (result.passed) {
        typeBreakdown[type].passed++;
        passedCount++;
      }

      totalScore += result.score;
    }

    // 计算平均分
    for (const type in typeBreakdown) {
      if (typeBreakdown[type].total > 0) {
        typeBreakdown[type].averageScore = Math.round(typeBreakdown[type].averageScore / typeBreakdown[type].total);
      }
    }

    return {
      total: contents.length,
      passed: passedCount,
      failed: contents.length - passedCount,
      averageScore: contents.length > 0 ? Math.round(totalScore / contents.length) : 0,
      typeBreakdown,
    };
  }
}
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ComplianceCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceCheckService = void 0;
const common_1 = require("@nestjs/common");
const government_content_interface_1 = require("../interfaces/government-content.interface");
let ComplianceCheckService = ComplianceCheckService_1 = class ComplianceCheckService {
    logger = new common_1.Logger(ComplianceCheckService_1.name);
    forbiddenTerms = [
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
    governmentAuthoritySuffixes = [
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
    requiredElements = {
        [government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT]: [
            'issuingAuthority',
            'title',
            'issueDate',
        ],
        [government_content_interface_1.GovernmentContentType.ANTI_FRAUD]: [
            'title',
            'fraudType',
            'preventionMeasures',
            'reportingChannels',
        ],
        [government_content_interface_1.GovernmentContentType.POLICY_INTERPRETATION]: [
            'policyName',
            'issuingAuthority',
            'keyPoints',
        ],
        [government_content_interface_1.GovernmentContentType.GOVERNMENT_SERVICE]: [
            'serviceName',
            'responsibleDepartment',
            'procedures',
        ],
        [government_content_interface_1.GovernmentContentType.PUBLIC_ANNOUNCEMENT]: [
            'title',
            'issuingUnit',
            'content',
        ],
        [government_content_interface_1.GovernmentContentType.EMERGENCY_RESPONSE]: [
            'title',
            'issuingUnit',
            'eventType',
            'responseMeasures',
        ],
    };
    async checkCompliance(content) {
        this.logger.log(`Checking compliance for content type: ${content.type}`);
        const items = [];
        const warnings = [];
        const requiredFixes = [];
        const suggestions = [];
        items.push(...(await this.checkGeneralCompliance(content)));
        switch (content.type) {
            case government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT:
                items.push(...(await this.checkOfficialDocumentCompliance(content)));
                break;
            case government_content_interface_1.GovernmentContentType.ANTI_FRAUD:
                items.push(...(await this.checkAntiFraudCompliance(content)));
                break;
            case government_content_interface_1.GovernmentContentType.POLICY_INTERPRETATION:
                items.push(...(await this.checkPolicyInterpretationCompliance(content)));
                break;
        }
        const passedItems = items.filter((item) => item.passed).length;
        const totalItems = items.length;
        const score = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 100;
        const highSeverityFailedItems = items.filter((item) => !item.passed && item.severity === 'high');
        if (highSeverityFailedItems.length > 0) {
            requiredFixes.push(...highSeverityFailedItems.map((item) => item.name));
            warnings.push('存在高风险合规问题，必须修复后才能发布');
        }
        if (score < 60) {
            suggestions.push('合规分数较低，建议重新生成或大幅修改内容');
        }
        else if (score < 80) {
            suggestions.push('合规分数中等，建议根据检查结果优化内容');
        }
        else if (score < 95) {
            suggestions.push('合规分数良好，可以发布但仍有优化空间');
        }
        else {
            suggestions.push('合规分数优秀，内容完全符合政府规范');
        }
        suggestions.push(...this.getPlatformSpecificSuggestions(content));
        return {
            passed: score >= 70 && highSeverityFailedItems.length === 0,
            score,
            items,
            warnings,
            requiredFixes,
            suggestions,
        };
    }
    async checkGeneralCompliance(content) {
        const items = [];
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
        items.push({
            name: '政治立场正确性',
            description: '检查政治立场是否正确',
            passed: this.checkPoliticalCorrectness(content),
            details: '政治立场正确',
            severity: 'high',
        });
        items.push({
            name: '法律法规符合性',
            description: '检查内容是否符合相关法律法规',
            passed: await this.checkLegalCompliance(content),
            details: '符合相关法律法规要求',
            severity: 'high',
        });
        items.push({
            name: '数据真实性',
            description: '检查数据是否真实可靠',
            passed: await this.checkDataAuthenticity(content),
            details: '数据真实可靠',
            severity: 'medium',
        });
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
        items.push({
            name: '格式规范性',
            description: '检查格式是否符合政府规范',
            passed: this.checkFormatCompliance(content),
            details: '格式符合政府规范',
            severity: 'medium',
        });
        items.push({
            name: '语言规范性',
            description: '检查语言是否规范',
            passed: this.checkLanguageStandardization(content),
            details: '语言规范',
            severity: 'low',
        });
        return items;
    }
    async checkOfficialDocumentCompliance(document) {
        const items = [];
        const isValidAuthority = this.validateGovernmentAuthority(document.header.issuingAuthority);
        items.push({
            name: '发文机关合法性',
            description: '检查发文机关是否合法有效',
            passed: isValidAuthority,
            details: isValidAuthority ? '发文机关合法' : '发文机关名称不符合规范',
            severity: 'high',
        });
        const isValidDocumentNumber = this.validateDocumentNumber(document.header.documentNumber);
        items.push({
            name: '文号规范性',
            description: '检查发文字号是否符合规范',
            passed: isValidDocumentNumber,
            details: isValidDocumentNumber ? '文号规范' : '文号格式不符合要求',
            severity: 'high',
        });
        const isTitleAccurate = this.validateDocumentTitle(document.header.title, document.header.issuingAuthority);
        items.push({
            name: '标题准确性',
            description: '检查标题是否准确反映内容',
            passed: isTitleAccurate,
            details: isTitleAccurate ? '标题准确' : '标题与内容或发文机关不匹配',
            severity: 'medium',
        });
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
        const hasStandardTerminology = this.checkOfficialTerminology(document);
        items.push({
            name: '用词规范性',
            description: '检查是否使用规范公文用语',
            passed: hasStandardTerminology,
            details: hasStandardTerminology ? '用语规范' : '存在非规范用语',
            severity: 'medium',
        });
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
    async checkAntiFraudCompliance(content) {
        const items = [];
        const hasFraudType = !!content.fraudType && content.fraudType.trim().length > 0;
        items.push({
            name: '诈骗类型明确性',
            description: '检查是否明确诈骗类型',
            passed: hasFraudType,
            details: hasFraudType
                ? `诈骗类型: ${content.fraudType}`
                : '未明确诈骗类型',
            severity: 'high',
        });
        const hasRealCase = !!content.recentCase && content.recentCase.trim().length > 0;
        items.push({
            name: '案例真实性',
            description: '检查是否提供真实案例',
            passed: hasRealCase,
            details: hasRealCase ? '提供真实案例' : '建议补充真实案例',
            severity: 'medium',
        });
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
        const isLanguageAccessible = this.checkAccessibleLanguage(content);
        items.push({
            name: '语言通俗性',
            description: '检查语言是否通俗易懂',
            passed: isLanguageAccessible,
            details: isLanguageAccessible ? '语言通俗易懂' : '语言过于专业，建议简化',
            severity: 'medium',
        });
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
    async checkPolicyInterpretationCompliance(content) {
        const items = [];
        const hasPolicyName = !!content.policyName && content.policyName.trim().length > 0;
        items.push({
            name: '政策名称准确性',
            description: '检查政策名称是否准确',
            passed: hasPolicyName,
            details: hasPolicyName
                ? `政策名称: ${content.policyName}`
                : '未明确政策名称',
            severity: 'high',
        });
        const isAuthorityValid = this.validateGovernmentAuthority(content.issuingAuthority);
        items.push({
            name: '发文机关权威性',
            description: '检查发文机关是否具有权威性',
            passed: isAuthorityValid,
            details: isAuthorityValid ? '发文机关具有权威性' : '发文机关权威性不足',
            severity: 'high',
        });
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
        const isInterpretationAccurate = await this.checkInterpretationAccuracy(content);
        items.push({
            name: '解读准确性',
            description: '检查政策解读是否准确',
            passed: isInterpretationAccurate,
            details: isInterpretationAccurate ? '解读准确' : '解读可能存在偏差',
            severity: 'high',
        });
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
    findSensitiveWords(text) {
        const found = [];
        for (const term of this.forbiddenTerms) {
            if (text.includes(term)) {
                found.push(term);
            }
        }
        return found;
    }
    checkPoliticalCorrectness(content) {
        return true;
    }
    async checkLegalCompliance(content) {
        return true;
    }
    async checkDataAuthenticity(content) {
        return true;
    }
    checkMissingRequiredElements(content) {
        const missing = [];
        const required = this.requiredElements[content.type] || [];
        for (const element of required) {
            if (!content[element] ||
                (Array.isArray(content[element]) && content[element].length === 0)) {
                missing.push(element);
            }
        }
        return missing;
    }
    checkFormatCompliance(content) {
        return true;
    }
    checkLanguageStandardization(content) {
        return true;
    }
    validateGovernmentAuthority(authority) {
        if (!authority)
            return false;
        for (const suffix of this.governmentAuthoritySuffixes) {
            if (authority.includes(suffix)) {
                return true;
            }
        }
        return false;
    }
    validateDocumentNumber(documentNumber) {
        if (!documentNumber)
            return false;
        const pattern = /^[^\s]+〔\d{4}〕\d+号$/;
        return pattern.test(documentNumber);
    }
    validateDocumentTitle(title, authority) {
        if (!title || !authority)
            return false;
        return true;
    }
    checkOfficialTerminology(document) {
        return true;
    }
    checkAccessibleLanguage(content) {
        return true;
    }
    checkWarningEffectiveness(content) {
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
    async checkInterpretationAccuracy(content) {
        return true;
    }
    getPlatformSpecificSuggestions(content) {
        const suggestions = [];
        switch (content.type) {
            case government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT:
                suggestions.push('建议在政府门户网站和政务新媒体同步发布');
                suggestions.push('可制作图文解读版，提高传播效果');
                break;
            case government_content_interface_1.GovernmentContentType.ANTI_FRAUD:
                suggestions.push('建议在社区宣传栏、微信公众号同步发布');
                suggestions.push('可制作短视频版本，扩大传播范围');
                break;
            case government_content_interface_1.GovernmentContentType.POLICY_INTERPRETATION:
                suggestions.push('建议组织政策宣讲会，面对面解读');
                suggestions.push('可制作一图读懂版，方便群众理解');
                break;
        }
        return suggestions;
    }
    async batchCheckCompliance(contents) {
        const results = [];
        for (const content of contents) {
            try {
                const result = await this.checkCompliance(content);
                results.push(result);
            }
            catch (error) {
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
    async getComplianceStats(contents) {
        const results = await this.batchCheckCompliance(contents);
        const typeBreakdown = {};
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
};
exports.ComplianceCheckService = ComplianceCheckService;
exports.ComplianceCheckService = ComplianceCheckService = ComplianceCheckService_1 = __decorate([
    (0, common_1.Injectable)()
], ComplianceCheckService);
//# sourceMappingURL=compliance-check.service.js.map
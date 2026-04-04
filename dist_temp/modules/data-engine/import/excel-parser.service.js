"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelParserService = void 0;
const common_1 = require("@nestjs/common");
let ExcelParserService = class ExcelParserService {
    async parseExcel(fileBuffer, originalFilename, options = {}) {
        const fileType = this.detectFileType(originalFilename);
        if (!this.isSupportedExcelType(fileType)) {
            throw new common_1.BadRequestException(`不支持的文件类型: ${fileType}。支持的类型: .xlsx, .xls, .csv`);
        }
        const maxSize = 100 * 1024 * 1024;
        if (fileBuffer.length > maxSize) {
            throw new common_1.BadRequestException(`文件大小超过限制: ${fileBuffer.length} bytes。最大允许: ${maxSize} bytes (100MB)`);
        }
        return this.mockParse(fileBuffer, originalFilename, options);
    }
    async parseCSV(fileBuffer, originalFilename, options = {}) {
        return this.mockParse(fileBuffer, originalFilename, options);
    }
    async parseFile(fileBuffer, originalFilename, options = {}) {
        const fileType = this.detectFileType(originalFilename);
        switch (fileType) {
            case '.xlsx':
            case '.xls':
                return this.parseExcel(fileBuffer, originalFilename, options);
            case '.csv':
                return this.parseCSV(fileBuffer, originalFilename, options);
            default:
                throw new common_1.BadRequestException(`不支持的文件类型: ${fileType}。支持的类型: .xlsx, .xls, .csv`);
        }
    }
    detectFileType(filename) {
        const ext = filename.toLowerCase().match(/\.\w+$/);
        return ext ? ext[0] : '';
    }
    isSupportedExcelType(fileType) {
        return ['.xlsx', '.xls', '.csv'].includes(fileType);
    }
    mockParse(fileBuffer, originalFilename, options) {
        const rows = [];
        const totalRows = 100;
        const headers = [
            '客户ID',
            '姓名',
            '手机号',
            '邮箱',
            '消费金额',
            '购买时间',
        ];
        for (let i = 0; i < Math.min(totalRows, 10); i++) {
            rows.push({
                客户ID: `CUST${1000 + i}`,
                姓名: `测试客户${i}`,
                手机号: `1380013800${i}`,
                邮箱: `customer${i}@example.com`,
                消费金额: (Math.random() * 1000).toFixed(2),
                购买时间: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
        const validationErrors = [];
        if (Math.random() > 0.8) {
            validationErrors.push({
                row: 5,
                field: '手机号',
                error: '手机号格式不正确',
                value: 'invalid-phone',
            });
        }
        return {
            rows,
            totalRows,
            headers,
            sheetNames: ['Sheet1'],
            metadata: {
                fileType: this.detectFileType(originalFilename),
                fileSize: fileBuffer.length,
                originalFilename,
                detectedEncoding: 'UTF-8',
            },
            validationErrors,
        };
    }
    validateRow(row, rowIndex) {
        const errors = [];
        if (row['手机号'] && !/^1[3-9]\d{9}$/.test(row['手机号'])) {
            errors.push({
                field: '手机号',
                error: '手机号格式不正确',
                value: row['手机号'],
            });
        }
        if (row['邮箱'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row['邮箱'])) {
            errors.push({
                field: '邮箱',
                error: '邮箱格式不正确',
                value: row['邮箱'],
            });
        }
        if (row['消费金额'] &&
            (isNaN(parseFloat(row['消费金额'])) || parseFloat(row['消费金额']) < 0)) {
            errors.push({
                field: '消费金额',
                error: '消费金额必须是正数',
                value: row['消费金额'],
            });
        }
        return errors;
    }
    async detectHeaderMapping(headers, targetFields) {
        const mapping = {};
        const fieldPatterns = {
            age_group: [/年龄/i, /年龄段/i, /年龄分组/i, /age/i],
            education: [/学历/i, /教育程度/i, /教育背景/i],
            family_role: [/家庭角色/i, /家庭身份/i, /婚姻状况/i, /家庭状况/i],
            potential_value: [/潜在价值/i, /价值潜力/i, /客户价值/i],
            consumption_level: [/消费水平/i, /消费等级/i, /消费能力/i, /消费层级/i],
            shopping_width: [/品类宽度/i, /购物广度/i, /消费范围/i],
            decision_speed: [/决策速度/i, /购买决策速度/i, /决策时间/i],
            activity_level: [/活跃度/i, /活动水平/i, /活跃等级/i],
            growth_trend: [/增长趋势/i, /成长趋势/i, /发展趋势/i],
            engagement_score: [/参与度/i, /互动得分/i, /互动评分/i],
            fission_potential: [/裂变潜力/i, /传播潜力/i, /分享潜力/i],
            activity_preference: [/活动偏好/i, /偏好活动/i, /兴趣偏好/i],
            social_influence: [/社交影响力/i, /影响力分数/i, /社交影响/i],
            customer_id: [/客户ID/i, /会员号/i, /用户ID/i, /顾客编号/i],
            name: [/姓名/i, /名字/i, /客户名称/i, /顾客姓名/i],
            mobile: [/手机号/i, /电话/i, /手机/i, /联系电话/i, /手机号码/i],
            email: [/邮箱/i, /电子邮件/i, /email/i, /电子邮箱/i],
            amount: [/消费金额/i, /金额/i, /消费/i, /支付金额/i, /交易金额/i],
            purchase_time: [/购买时间/i, /消费时间/i, /下单时间/i, /交易时间/i],
            gender: [/性别/i, /gender/i],
            birth_date: [/出生日期/i, /生日/i, /出生年月/i],
            address: [/地址/i, /居住地址/i, /联系地址/i],
            city: [/城市/i, /所在城市/i],
            province: [/省份/i, /地区/i],
            occupation: [/职业/i, /工作岗位/i],
            income: [/收入/i, /月收入/i, /年收入/i],
        };
        const targetPatterns = targetFields.length > 0
            ? Object.fromEntries(Object.entries(fieldPatterns).filter(([key]) => targetFields.includes(key)))
            : fieldPatterns;
        for (const header of headers) {
            let matched = false;
            const normalizedHeader = header.trim();
            for (const [targetField, patterns] of Object.entries(targetPatterns)) {
                if (patterns.some((pattern) => pattern.test(normalizedHeader))) {
                    mapping[header] = targetField;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                for (const [targetField, patterns] of Object.entries(targetPatterns)) {
                    const keywords = patterns.map((p) => p.source
                        .replace(/[\/\\^$.*+?()[\]{}|]/g, '')
                        .replace('i', '')
                        .toLowerCase());
                    const headerLower = normalizedHeader.toLowerCase();
                    if (keywords.some((keyword) => headerLower.includes(keyword) && keyword.length > 1)) {
                        mapping[header] = targetField;
                        break;
                    }
                }
            }
        }
        const matchRate = headers.length > 0 ? Object.keys(mapping).length / headers.length : 0;
        console.log(`表头匹配完成: ${Object.keys(mapping).length}/${headers.length} (${(matchRate * 100).toFixed(1)}%)`);
        return mapping;
    }
};
exports.ExcelParserService = ExcelParserService;
exports.ExcelParserService = ExcelParserService = __decorate([
    (0, common_1.Injectable)()
], ExcelParserService);
//# sourceMappingURL=excel-parser.service.js.map
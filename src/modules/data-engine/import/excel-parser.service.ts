import { Injectable, BadRequestException } from '@nestjs/common';

export interface ExcelParseOptions {
  sheetName?: string;
  headerRow?: number;
  skipRows?: number;
  maxRows?: number;
  columnMapping?: Record<string, string>;
}

export interface ParseResult {
  rows: Record<string, any>[];
  totalRows: number;
  headers: string[];
  sheetNames: string[];
  metadata: {
    fileType: string;
    fileSize: number;
    originalFilename: string;
    detectedEncoding?: string;
  };
  validationErrors: Array<{
    row: number;
    field: string;
    error: string;
    value: any;
  }>;
}

@Injectable()
export class ExcelParserService {
  /**
   * 解析Excel文件（.xlsx, .xls）
   * @param fileBuffer 文件Buffer
   * @param originalFilename 原始文件名
   * @param options 解析选项
   */
  async parseExcel(
    fileBuffer: Buffer,
    originalFilename: string,
    options: ExcelParseOptions = {},
  ): Promise<ParseResult> {
    const fileType = this.detectFileType(originalFilename);

    if (!this.isSupportedExcelType(fileType)) {
      throw new BadRequestException(
        `不支持的文件类型: ${fileType}。支持的类型: .xlsx, .xls, .csv`,
      );
    }

    // 检查文件大小（最大100MB）
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (fileBuffer.length > maxSize) {
      throw new BadRequestException(
        `文件大小超过限制: ${fileBuffer.length} bytes。最大允许: ${maxSize} bytes (100MB)`,
      );
    }

    // TODO: 实现实际的Excel解析逻辑
    // 临时模拟实现
    return this.mockParse(fileBuffer, originalFilename, options);
  }

  /**
   * 解析CSV文件
   * @param fileBuffer 文件Buffer
   * @param originalFilename 原始文件名
   * @param options 解析选项
   */
  async parseCSV(
    fileBuffer: Buffer,
    originalFilename: string,
    options: ExcelParseOptions = {},
  ): Promise<ParseResult> {
    // TODO: 实现实际的CSV解析逻辑
    return this.mockParse(fileBuffer, originalFilename, options);
  }

  /**
   * 智能检测文件类型并解析
   * @param fileBuffer 文件Buffer
   * @param originalFilename 原始文件名
   * @param options 解析选项
   */
  async parseFile(
    fileBuffer: Buffer,
    originalFilename: string,
    options: ExcelParseOptions = {},
  ): Promise<ParseResult> {
    const fileType = this.detectFileType(originalFilename);

    switch (fileType) {
      case '.xlsx':
      case '.xls':
        return this.parseExcel(fileBuffer, originalFilename, options);
      case '.csv':
        return this.parseCSV(fileBuffer, originalFilename, options);
      default:
        throw new BadRequestException(
          `不支持的文件类型: ${fileType}。支持的类型: .xlsx, .xls, .csv`,
        );
    }
  }

  /**
   * 检测文件类型
   */
  private detectFileType(filename: string): string {
    const ext = filename.toLowerCase().match(/\.\w+$/);
    return ext ? ext[0] : '';
  }

  /**
   * 检查是否支持的Excel类型
   */
  private isSupportedExcelType(fileType: string): boolean {
    return ['.xlsx', '.xls', '.csv'].includes(fileType);
  }

  /**
   * 模拟解析实现（临时）
   */
  private mockParse(
    fileBuffer: Buffer,
    originalFilename: string,
    options: ExcelParseOptions,
  ): ParseResult {
    // 模拟解析逻辑
    const rows: Record<string, any>[] = [];
    const totalRows = 100;
    const headers = ['客户ID', '姓名', '手机号', '邮箱', '消费金额', '购买时间'];

    // 生成模拟数据
    for (let i = 0; i < Math.min(totalRows, 10); i++) {
      rows.push({
        '客户ID': `CUST${1000 + i}`,
        '姓名': `测试客户${i}`,
        '手机号': `1380013800${i}`,
        '邮箱': `customer${i}@example.com`,
        '消费金额': (Math.random() * 1000).toFixed(2),
        '购买时间': new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const validationErrors: Array<{ row: number; field: string; error: string; value: any }> = [];
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

  /**
   * 验证数据行
   */
  validateRow(row: Record<string, any>, rowIndex: number): Array<{
    field: string;
    error: string;
    value: any;
  }> {
    const errors: Array<{ field: string; error: string; value: any }> = [];

    // 手机号验证
    if (row['手机号'] && !/^1[3-9]\d{9}$/.test(row['手机号'])) {
      errors.push({
        field: '手机号',
        error: '手机号格式不正确',
        value: row['手机号'],
      });
    }

    // 邮箱验证
    if (row['邮箱'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row['邮箱'])) {
      errors.push({
        field: '邮箱',
        error: '邮箱格式不正确',
        value: row['邮箱'],
      });
    }

    // 消费金额验证
    if (row['消费金额'] && (isNaN(parseFloat(row['消费金额'])) || parseFloat(row['消费金额']) < 0)) {
      errors.push({
        field: '消费金额',
        error: '消费金额必须是正数',
        value: row['消费金额'],
      });
    }

    return errors;
  }

  /**
   * 自动检测表头映射（AI功能占位）
   */
  async detectHeaderMapping(
    headers: string[],
    targetFields: string[],
  ): Promise<Record<string, string>> {
    // TODO: 集成AI自动识别表头映射
    const mapping: Record<string, string> = {};

    // 标准4维度字段体系映射
    const fieldPatterns: Record<string, RegExp[]> = {
      // 基础生命周期维度
      'age_group': [/年龄/i, /年龄段/i, /年龄分组/i, /age/i],
      'education': [/学历/i, /教育程度/i, /教育背景/i],
      'family_role': [/家庭角色/i, /家庭身份/i, /婚姻状况/i, /家庭状况/i],
      'potential_value': [/潜在价值/i, /价值潜力/i, /客户价值/i],

      // 消费性格维度
      'consumption_level': [/消费水平/i, /消费等级/i, /消费能力/i, /消费层级/i],
      'shopping_width': [/品类宽度/i, /购物广度/i, /消费范围/i],
      'decision_speed': [/决策速度/i, /购买决策速度/i, /决策时间/i],

      // 实时状态维度
      'activity_level': [/活跃度/i, /活动水平/i, /活跃等级/i],
      'growth_trend': [/增长趋势/i, /成长趋势/i, /发展趋势/i],
      'engagement_score': [/参与度/i, /互动得分/i, /互动评分/i],

      // 社交与活动维度
      'fission_potential': [/裂变潜力/i, /传播潜力/i, /分享潜力/i],
      'activity_preference': [/活动偏好/i, /偏好活动/i, /兴趣偏好/i],
      'social_influence': [/社交影响力/i, /影响力分数/i, /社交影响/i],

      // 通用字段
      'customer_id': [/客户ID/i, /会员号/i, /用户ID/i, /顾客编号/i],
      'name': [/姓名/i, /名字/i, /客户名称/i, /顾客姓名/i],
      'mobile': [/手机号/i, /电话/i, /手机/i, /联系电话/i, /手机号码/i],
      'email': [/邮箱/i, /电子邮件/i, /email/i, /电子邮箱/i],
      'amount': [/消费金额/i, /金额/i, /消费/i, /支付金额/i, /交易金额/i],
      'purchase_time': [/购买时间/i, /消费时间/i, /下单时间/i, /交易时间/i],
      'gender': [/性别/i, /gender/i],
      'birth_date': [/出生日期/i, /生日/i, /出生年月/i],
      'address': [/地址/i, /居住地址/i, /联系地址/i],
      'city': [/城市/i, /所在城市/i],
      'province': [/省份/i, /地区/i],
      'occupation': [/职业/i, /工作岗位/i],
      'income': [/收入/i, /月收入/i, /年收入/i],
    };

    // 如果提供了目标字段，优先匹配目标字段
    const targetPatterns = targetFields.length > 0
      ? Object.fromEntries(
          Object.entries(fieldPatterns).filter(([key]) => targetFields.includes(key))
        )
      : fieldPatterns;

    for (const header of headers) {
      let matched = false;
      const normalizedHeader = header.trim();

      for (const [targetField, patterns] of Object.entries(targetPatterns)) {
        if (patterns.some(pattern => pattern.test(normalizedHeader))) {
          mapping[header] = targetField;
          matched = true;
          break;
        }
      }

      // 如果没有匹配到，尝试模糊匹配（包含关系）
      if (!matched) {
        for (const [targetField, patterns] of Object.entries(targetPatterns)) {
          // 检查表头是否包含关键词
          const keywords = patterns.map(p => p.source.replace(/[\/\\^$.*+?()[\]{}|]/g, '').replace('i', '').toLowerCase());
          const headerLower = normalizedHeader.toLowerCase();
          if (keywords.some(keyword => headerLower.includes(keyword) && keyword.length > 1)) {
            mapping[header] = targetField;
            break;
          }
        }
      }
    }

    // 计算匹配准确率
    const matchRate = headers.length > 0 ? (Object.keys(mapping).length / headers.length) : 0;
    console.log(`表头匹配完成: ${Object.keys(mapping).length}/${headers.length} (${(matchRate * 100).toFixed(1)}%)`);

    return mapping;
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../../entities/report.entity';
import { UserDocument } from '../../../entities/user-document.entity';

export interface WordExportOptions {
  includeCharts?: boolean;
  includeAnalysis?: boolean;
  template?: 'government' | 'business' | 'simple';
  fontSize?: number;
  margins?: { top: number; right: number; bottom: number; left: number };
}

export interface PPTOutline {
  slides: Array<{
    title: string;
    content: string[];
    notes?: string;
    layout?: 'title' | 'titleAndContent' | 'sectionHeader' | 'twoContent';
  }>;
  theme?: string;
  notes?: string;
}

@Injectable()
export class ReportExportService {
  private readonly logger = new Logger(ReportExportService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(UserDocument)
    private readonly userDocumentRepository: Repository<UserDocument>,
  ) {}

  /**
   * 导出报告为Word格式
   */
  async exportReportToWord(
    reportId: string,
    options: WordExportOptions = {},
  ): Promise<{ url: string; filename: string; size?: number }> {
    try {
      const report = await this.reportRepository.findOne({
        where: { id: reportId },
      });

      if (!report) {
        throw new Error(`报告不存在: ${reportId}`);
      }

      // 构建Word文档内容
      const wordContent = this.buildWordContent(report, options);

      // 生成模拟文件URL（实际应用中应该生成真正的Word文件并上传到OSS）
      const filename = `${report.title.replace(/[^\w\u4e00-\u9fa5]/g, '_')}_${Date.now()}.docx`;
      const url = `/api/v1/analytics/reports/${reportId}/exports/${filename}`;

      // 更新报告的文件URL
      report.fileUrl = url;
      await this.reportRepository.save(report);

      return {
        url,
        filename,
        size: wordContent.length, // 模拟文件大小
      };
    } catch (error) {
      this.logger.error(`导出Word报告失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 从用户文档生成PPT大纲
   */
  async generatePPTOutlineFromDocument(
    documentId: string,
    options?: {
      maxSlides?: number;
      includeNotes?: boolean;
      theme?: string;
    },
  ): Promise<PPTOutline> {
    try {
      const document = await this.userDocumentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error(`文档不存在: ${documentId}`);
      }

      // 使用AI生成PPT大纲（模拟）
      return this.generatePPTOutlineFromContent(
        document.content || document.title,
        document.reportType,
        options,
      );
    } catch (error) {
      this.logger.error(`生成PPT大纲失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 从报告生成PPT大纲
   */
  async generatePPTOutlineFromReport(
    reportId: string,
    options?: {
      maxSlides?: number;
      includeNotes?: boolean;
      theme?: string;
    },
  ): Promise<PPTOutline> {
    try {
      const report = await this.reportRepository.findOne({
        where: { id: reportId },
      });

      if (!report) {
        throw new Error(`报告不存在: ${reportId}`);
      }

      // 从报告内容生成PPT大纲
      const reportContent = report.content || {};
      const contentText = this.extractTextFromReportContent(reportContent);

      return this.generatePPTOutlineFromContent(
        contentText,
        report.type,
        options,
      );
    } catch (error) {
      this.logger.error(`生成PPT大纲失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 构建Word文档内容（模拟）
   */
  private buildWordContent(report: Report, options: WordExportOptions): string {
    const { template = 'government', includeCharts = true, includeAnalysis = true } = options;

    let content = '';

    // 报告标题
    content += `# ${report.title}\n\n`;

    // 报告信息
    content += `**报告类型:** ${this.getReportTypeLabel(report.type)}\n`;
    content += `**生成时间:** ${report.createdAt.toLocaleString('zh-CN')}\n`;
    if (report.completedAt) {
      content += `**完成时间:** ${report.completedAt.toLocaleString('zh-CN')}\n`;
    }
    content += `\n`;

    // 报告摘要（如果有）
    if (report.content?.summary) {
      content += `## 摘要\n\n${report.content.summary}\n\n`;
    }

    // 报告正文内容
    if (report.content) {
      for (const [section, sectionContent] of Object.entries(report.content)) {
        if (section === 'summary') continue; // 摘要已处理

        content += `## ${this.getSectionLabel(section)}\n\n`;

        if (typeof sectionContent === 'string') {
          content += `${sectionContent}\n\n`;
        } else if (Array.isArray(sectionContent)) {
          sectionContent.forEach((item, index) => {
            content += `${index + 1}. ${item}\n`;
          });
          content += '\n';
        } else if (typeof sectionContent === 'object') {
          for (const [key, value] of Object.entries(sectionContent)) {
            content += `### ${key}\n\n${value}\n\n`;
          }
        }
      }
    }

    // 分析结论
    if (includeAnalysis && report.analysis) {
      content += `## 分析结论和建议\n\n${report.analysis}\n\n`;
    }

    // 图表说明（如果有图表数据）
    if (includeCharts && report.charts) {
      content += `## 数据图表\n\n`;
      content += `报告中包含 ${Object.keys(report.charts).length} 个数据图表，展示了关键数据和分析结果。\n\n`;
    }

    // 页脚
    content += `---\n`;
    content += `*报告由 LuminaMedia 灵曜智媒系统生成*\n`;
    content += `*生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;

    return content;
  }

  /**
   * 从文本内容生成PPT大纲（模拟）
   */
  private generatePPTOutlineFromContent(
    content: string,
    reportType: string,
    options?: {
      maxSlides?: number;
      includeNotes?: boolean;
      theme?: string;
    },
  ): PPTOutline {
    const maxSlides = options?.maxSlides || 10;
    const includeNotes = options?.includeNotes || false;
    const theme = options?.theme || '政务蓝';

    // 根据内容类型和长度生成幻灯片结构
    const slides: PPTOutline['slides'] = [];

    // 标题页
    slides.push({
      title: this.getReportTypeLabel(reportType) + '汇报',
      content: ['基于AI分析生成的汇报材料', 'LuminaMedia 灵曜智媒系统'],
      layout: 'title',
      notes: includeNotes ? '开场介绍，说明汇报目的和来源' : undefined,
    });

    // 目录页
    slides.push({
      title: '目录',
      content: ['背景介绍', '核心发现', '数据展示', '分析结论', '行动计划'],
      layout: 'titleAndContent',
      notes: includeNotes ? '简要介绍汇报结构' : undefined,
    });

    // 根据内容生成其他幻灯片
    const contentLines = content.split('\n').filter(line => line.trim().length > 0);
    const linesPerSlide = Math.max(3, Math.ceil(contentLines.length / (maxSlides - 2)));

    for (let i = 0; i < contentLines.length && slides.length < maxSlides; i += linesPerSlide) {
      const slideContent = contentLines.slice(i, i + linesPerSlide);
      const slideNum = slides.length;

      slides.push({
        title: `核心要点 ${slideNum - 1}`,
        content: slideContent.map(line => line.substring(0, 100)),
        layout: slideNum % 2 === 0 ? 'titleAndContent' : 'twoContent',
        notes: includeNotes ? `第${slideNum}页，展示关键信息` : undefined,
      });
    }

    // 总结页
    slides.push({
      title: '总结与建议',
      content: ['关键发现总结', '下一步行动计划', '预期效果评估'],
      layout: 'sectionHeader',
      notes: includeNotes ? '总结汇报要点，提出明确建议' : undefined,
    });

    // 致谢页
    slides.push({
      title: '谢谢',
      content: ['感谢聆听', 'Q&A'],
      layout: 'title',
      notes: includeNotes ? '结束语，开放提问' : undefined,
    });

    return {
      slides,
      theme,
      notes: includeNotes ? '本PPT大纲由AI自动生成，可根据实际需要进行调整。' : undefined,
    };
  }

  /**
   * 从报告内容提取文本
   */
  private extractTextFromReportContent(content: any): string {
    if (!content) return '';

    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content.join('\n');
    }

    if (typeof content === 'object') {
      let text = '';
      for (const [key, value] of Object.entries(content)) {
        text += `${key}: ${this.extractTextFromReportContent(value)}\n`;
      }
      return text;
    }

    return String(content);
  }

  /**
   * 获取报告类型标签
   */
  private getReportTypeLabel(reportType: string): string {
    const labels: Record<string, string> = {
      'sentiment_daily': '舆情监测日报',
      'sentiment_weekly': '舆情监测周报',
      'wechat_monthly': '公众号运营月报',
      'spread_analysis': '传播分析报告',
      'custom': '自定义报告',
      'work_summary': '工作总结',
      'activity_review': '活动复盘',
      'research_analysis': '调研分析',
      'policy_interpretation': '政策解读',
    };

    return labels[reportType] || '报告';
  }

  /**
   * 获取章节标签
   */
  private getSectionLabel(section: string): string {
    const labels: Record<string, string> = {
      'background': '背景分析',
      'findings': '主要发现',
      'analysis': '分析',
      'recommendations': '建议',
      'conclusion': '结论',
      'executive_summary': '摘要',
      'key_metrics': '关键指标',
      'trends': '趋势分析',
      'comparisons': '对比分析',
      'challenges': '挑战',
      'opportunities': '机会',
    };

    return labels[section] || section;
  }
}
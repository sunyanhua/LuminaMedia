import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { htmlToText } from 'html-to-text';

/**
 * 微信公众号自动排版服务
 * 提供以下功能：
 * 1. HTML内容格式化，符合微信公众平台规范
 * 2. 样式模板应用（标题、正文、引用、代码块等）
 * 3. 图片优化建议和自动排版
 * 4. 内容质量检查
 */
@Injectable()
export class WechatFormatterService {
  private readonly logger = new Logger(WechatFormatterService.name);

  /**
   * 微信排版模板库
   */
  private templates = {
    // 标题模板
    title: {
      h1: '<h1 style="font-size: 20px; font-weight: bold; color: #333; line-height: 1.4; margin: 20px 0 10px; border-left: 4px solid #1890ff; padding-left: 10px;">$content</h1>',
      h2: '<h2 style="font-size: 18px; font-weight: bold; color: #333; line-height: 1.4; margin: 18px 0 9px; border-left: 3px solid #52c41a; padding-left: 10px;">$content</h2>',
      h3: '<h3 style="font-size: 16px; font-weight: bold; color: #333; line-height: 1.4; margin: 16px 0 8px; border-left: 2px solid #faad14; padding-left: 10px;">$content</h3>',
    },
    // 正文模板
    paragraph: '<p style="font-size: 15px; color: #555; line-height: 1.8; margin: 0 0 15px; text-align: justify;">$content</p>',
    // 引用模板
    blockquote: '<blockquote style="border-left: 4px solid #d9d9d9; margin: 15px 0; padding: 10px 15px; background-color: #f9f9f9; color: #666; font-style: italic;">$content</blockquote>',
    // 代码块模板
    code: {
      inline: '<code style="font-family: Consolas, Monaco, monospace; background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 14px; color: #c7254e;">$content</code>',
      block: '<pre style="font-family: Consolas, Monaco, monospace; background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 14px; line-height: 1.5; margin: 15px 0;"><code>$content</code></pre>',
    },
    // 列表模板
    list: {
      ul: '<ul style="margin: 15px 0; padding-left: 25px; color: #555;">$content</ul>',
      ol: '<ol style="margin: 15px 0; padding-left: 25px; color: #555;">$content</ol>',
      li: '<li style="margin: 8px 0; line-height: 1.6;">$content</li>',
    },
    // 分隔线
    hr: '<hr style="border: none; border-top: 1px solid #e8e8e8; margin: 20px 0;">',
    // 图片容器
    image: '<div style="margin: 20px 0; text-align: center;"><img src="$src" alt="$alt" style="max-width: 100%; height: auto; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><p style="font-size: 13px; color: #999; margin-top: 8px;">$caption</p></div>',
    // 表格模板
    table: '<div style="overflow-x: auto; margin: 20px 0;"><table style="width: 100%; border-collapse: collapse; font-size: 14px;">$content</table></div>',
    tableRow: '<tr>$content</tr>',
    tableHeader: '<th style="border: 1px solid #d9d9d9; padding: 10px; background-color: #fafafa; font-weight: bold; text-align: left;">$content</th>',
    tableCell: '<td style="border: 1px solid #d9d9d9; padding: 10px;">$content</td>',
  };

  /**
   * 格式化微信公众号内容
   * @param content 原始内容（HTML或Markdown）
   * @param options 格式化选项
   * @returns 格式化后的HTML内容
   */
  async formatContent(
    content: string,
    options: WechatFormatOptions = {},
  ): Promise<FormattedContent> {
    this.logger.log('Formatting content for WeChat');

    const startTime = Date.now();

    try {
      // 1. 预处理内容（转换为HTML，如果是Markdown）
      let htmlContent = await this.preprocessContent(content, options);

      // 2. 清理HTML，移除不安全标签
      htmlContent = this.cleanHtml(htmlContent);

      // 3. 应用排版模板
      htmlContent = this.applyTemplates(htmlContent, options);

      // 4. 优化图片
      htmlContent = await this.optimizeImages(htmlContent, options);

      // 5. 内容质量检查
      const qualityReport = this.checkContentQuality(htmlContent);

      const processingTime = Date.now() - startTime;

      this.logger.log(`Content formatted successfully in ${processingTime}ms`);

      return {
        html: htmlContent,
        plainText: this.extractPlainText(htmlContent),
        qualityReport,
        processingTime,
        imageCount: this.countImages(htmlContent),
        wordCount: this.countWords(htmlContent),
        formattedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to format content: ${error.message}`, error.stack);
      throw new Error(`Content formatting failed: ${error.message}`);
    }
  }

  /**
   * 预处理内容（Markdown转HTML等）
   */
  private async preprocessContent(content: string, options: WechatFormatOptions): Promise<string> {
    // 如果内容包含Markdown语法，转换为HTML
    if (this.isMarkdown(content)) {
      return this.markdownToHtml(content);
    }

    // 如果已经是HTML，直接返回
    if (this.isHtml(content)) {
      return content;
    }

    // 纯文本，转换为段落
    return this.textToHtml(content);
  }

  /**
   * 清理HTML，移除不安全标签和属性
   */
  private cleanHtml(html: string): string {
    const $ = cheerio.load(html, { decodeEntities: false });

    // 移除危险标签
    const dangerousTags = ['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet'];
    dangerousTags.forEach(tag => $(tag).remove());

    // 移除危险属性
    $('*').each((_, element) => {
      const $elem = $(element);
      const attrs = $elem.attr();

      if (attrs) {
        Object.keys(attrs).forEach(attr => {
          // 移除on*事件处理器和javascript:协议
          if (attr.startsWith('on') || attrs[attr]?.startsWith('javascript:')) {
            $elem.removeAttr(attr);
          }
        });
      }
    });

    // 确保所有标签都有合适的闭合
    return $.html();
  }

  /**
   * 应用排版模板
   */
  private applyTemplates(html: string, options: WechatFormatOptions): string {
    const $ = cheerio.load(html, { decodeEntities: false });

    // 处理标题
    $('h1').each((_, element) => {
      const $elem = $(element);
      const content = $elem.html() || '';
      $elem.replaceWith(this.templates.title.h1.replace('$content', content));
    });

    $('h2').each((_, element) => {
      const $elem = $(element);
      const content = $elem.html() || '';
      $elem.replaceWith(this.templates.title.h2.replace('$content', content));
    });

    $('h3').each((_, element) => {
      const $elem = $(element);
      const content = $elem.html() || '';
      $elem.replaceWith(this.templates.title.h3.replace('$content', content));
    });

    // 处理段落
    $('p').each((_, element) => {
      const $elem = $(element);
      const content = $elem.html() || '';
      $elem.replaceWith(this.templates.paragraph.replace('$content', content));
    });

    // 处理引用
    $('blockquote').each((_, element) => {
      const $elem = $(element);
      const content = $elem.html() || '';
      $elem.replaceWith(this.templates.blockquote.replace('$content', content));
    });

    // 处理代码
    $('code').each((_, element) => {
      const $elem = $(element);
      const content = $elem.html() || '';
      const isBlock = $elem.parent().is('pre');

      if (isBlock) {
        // 代码块
        $elem.parent().replaceWith(this.templates.code.block.replace('$content', content));
      } else {
        // 行内代码
        $elem.replaceWith(this.templates.code.inline.replace('$content', content));
      }
    });

    // 处理列表
    $('ul').each((_, element) => {
      const $elem = $(element);
      const content = $elem.html() || '';
      $elem.replaceWith(this.templates.list.ul.replace('$content', content));
    });

    $('ol').each((_, element) => {
      const $elem = $(element);
      const content = $elem.html() || '';
      $elem.replaceWith(this.templates.list.ol.replace('$content', content));
    });

    $('li').each((_, element) => {
      const $elem = $(element);
      const content = $elem.html() || '';
      $elem.replaceWith(this.templates.list.li.replace('$content', content));
    });

    // 处理分隔线
    $('hr').each((_, element) => {
      $(element).replaceWith(this.templates.hr);
    });

    // 处理图片
    $('img').each((_, element) => {
      const $elem = $(element);
      const src = $elem.attr('src') || '';
      const alt = $elem.attr('alt') || '';
      const title = $elem.attr('title') || alt;

      let caption = '';
      // 尝试获取图片标题（下一个p标签可能包含标题）
      const $next = $elem.next();
      if ($next.is('p') && $next.text().trim().length < 50) {
        caption = $next.text().trim();
        $next.remove();
      }

      const imageHtml = this.templates.image
        .replace('$src', src)
        .replace('$alt', alt)
        .replace('$caption', caption || title);

      $elem.replaceWith(imageHtml);
    });

    // 处理表格
    $('table').each((_, element) => {
      const $table = $(element);
      const $rows = $table.find('tr');
      const processedRows: string[] = [];

      $rows.each((rowIndex, row) => {
        const $row = $(row);
        const $cells = $row.find('th, td');
        const processedCells: string[] = [];

        $cells.each((cellIndex, cell) => {
          const $cell = $(cell);
          const content = $cell.html() || '';
          const isHeader = $cell.is('th');

          const cellTemplate = isHeader ? this.templates.tableHeader : this.templates.tableCell;
          const cellHtml = cellTemplate.replace('$content', content);
          processedCells.push(cellHtml);
        });

        const rowHtml = this.templates.tableRow.replace('$content', processedCells.join(''));
        processedRows.push(rowHtml);
      });

      const tableHtml = this.templates.table.replace('$content', processedRows.join(''));
      $table.replaceWith(tableHtml);
    });

    return $.html();
  }

  /**
   * 优化图片（生成图片建议、压缩等）
   */
  private async optimizeImages(html: string, options: WechatFormatOptions): Promise<string> {
    const $ = cheerio.load(html, { decodeEntities: false });
    const images = $('img');

    if (images.length === 0) {
      return html;
    }

    // 这里可以集成图片优化服务
    // 例如：检查图片大小、生成缩略图、添加水印等

    // 暂时只添加图片计数和优化建议
    images.each((index, element) => {
      const $elem = $(element);
      const src = $elem.attr('src') || '';

      // 添加图片序号
      $elem.attr('data-image-index', (index + 1).toString());

      // 为没有alt标签的图片添加默认alt
      if (!$elem.attr('alt')) {
        $elem.attr('alt', `图片${index + 1}`);
      }
    });

    return $.html();
  }

  /**
   * 内容质量检查
   */
  private checkContentQuality(html: string): ContentQualityReport {
    const $ = cheerio.load(html, { decodeEntities: false });
    const text = $.root().text();

    const issues: ContentQualityIssue[] = [];
    const suggestions: string[] = [];

    // 检查标题
    const h1Count = $('h1').length;
    if (h1Count === 0) {
      issues.push({
        type: 'warning',
        message: '缺少H1标题',
        severity: 'medium',
      });
      suggestions.push('建议添加一个H1标题作为文章主标题');
    } else if (h1Count > 1) {
      issues.push({
        type: 'warning',
        message: '多个H1标题',
        severity: 'low',
      });
      suggestions.push('建议只保留一个H1标题，其他使用H2/H3');
    }

    // 检查段落长度
    $('p').each((index, element) => {
      const text = $(element).text();
      if (text.length > 500) {
        issues.push({
          type: 'warning',
          message: `段落${index + 1}过长（${text.length}字符）`,
          severity: 'low',
        });
        suggestions.push(`建议将段落${index + 1}拆分为多个小段落`);
      }
    });

    // 检查图片数量
    const imageCount = $('img').length;
    if (imageCount === 0) {
      issues.push({
        type: 'suggestion',
        message: '文章中没有图片',
        severity: 'low',
      });
      suggestions.push('建议添加1-3张相关图片提升阅读体验');
    } else if (imageCount > 10) {
      issues.push({
        type: 'warning',
        message: `图片数量过多（${imageCount}张）`,
        severity: 'low',
      });
      suggestions.push('建议精选3-5张最具代表性的图片');
    }

    // 检查总字数
    const wordCount = this.countWords(text);
    if (wordCount < 300) {
      issues.push({
        type: 'warning',
        message: `文章内容过短（${wordCount}字）`,
        severity: 'medium',
      });
      suggestions.push('建议补充内容至300字以上，提供更完整的信息');
    } else if (wordCount > 3000) {
      issues.push({
        type: 'warning',
        message: `文章内容过长（${wordCount}字）`,
        severity: 'low',
      });
      suggestions.push('建议将长文拆分为系列文章或添加目录导航');
    }

    // 检查可读性（简单的句子长度检查）
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    let longSentenceCount = 0;
    sentences.forEach(sentence => {
      if (sentence.length > 100) {
        longSentenceCount++;
      }
    });

    if (longSentenceCount > 0) {
      issues.push({
        type: 'suggestion',
        message: `有${longSentenceCount}个句子过长`,
        severity: 'low',
      });
      suggestions.push('建议将长句拆分为短句，提高可读性');
    }

    return {
      issues,
      suggestions,
      score: this.calculateQualityScore(issues),
      checkedAt: new Date(),
    };
  }

  /**
   * 计算内容质量分数
   */
  private calculateQualityScore(issues: ContentQualityIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * 提取纯文本
   */
  private extractPlainText(html: string): string {
    return htmlToText.convert(html, {
      wordwrap: false,
      ignoreHref: true,
      ignoreImage: true,
    });
  }

  /**
   * 统计图片数量
   */
  private countImages(html: string): number {
    const $ = cheerio.load(html, { decodeEntities: false });
    return $('img').length;
  }

  /**
   * 统计字数
   */
  private countWords(text: string): number {
    // 中文按字符数，英文按单词数
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    const englishWords = text.replace(/[\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    return chineseChars.length + englishWords.length;
  }

  /**
   * 检查是否为Markdown
   */
  private isMarkdown(content: string): boolean {
    const markdownPatterns = [
      /^#{1,6}\s/, // 标题
      /^[-*]\s/,   // 列表
      /^\d+\.\s/,  // 有序列表
      /^>/,        // 引用
      /```/,       // 代码块
      /\[.*\]\(.*\)/, // 链接
      /!\[.*\]\(.*\)/, // 图片
    ];

    return markdownPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 检查是否为HTML
   */
  private isHtml(content: string): boolean {
    const htmlPatterns = [
      /<[a-z][\s\S]*>/i, // HTML标签
      /&[a-z]+;/i,       // HTML实体
    ];

    return htmlPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Markdown转HTML（简化实现）
   */
  private markdownToHtml(markdown: string): string {
    // 这里可以使用marked等库，为了简化先实现基本转换
    let html = markdown;

    // 标题
    html = html.replace(/^#{6}\s(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#{5}\s(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#{4}\s(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^#{3}\s(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#{2}\s(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s(.+)$/gm, '<h1>$1</h1>');

    // 粗体
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // 斜体
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // 代码
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // 链接
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    // 图片
    html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">');

    // 无序列表
    html = html.replace(/^[-*]\s(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');

    // 有序列表
    html = html.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>\n)+/g, '<ol>$&</ol>');

    // 引用
    html = html.replace(/^>\s(.+)$/gm, '<blockquote>$1</blockquote>');

    // 段落
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    return html;
  }

  /**
   * 纯文本转HTML
   */
  private textToHtml(text: string): string {
    // 将换行转换为段落
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const htmlParagraphs = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`);
    return htmlParagraphs.join('');
  }

  /**
   * 获取排版模板
   */
  getTemplates(): Record<string, any> {
    return { ...this.templates };
  }

  /**
   * 更新排版模板
   */
  updateTemplates(newTemplates: Partial<typeof this.templates>): void {
    this.templates = { ...this.templates, ...newTemplates };
    this.logger.log('WeChat formatting templates updated');
  }
}

/**
 * 微信格式化选项
 */
export interface WechatFormatOptions {
  /** 是否启用高级格式化 */
  enableAdvancedFormatting?: boolean;
  /** 是否生成图片建议 */
  generateImageSuggestions?: boolean;
  /** 是否检查内容质量 */
  enableQualityCheck?: boolean;
  /** 自定义样式 */
  customStyles?: Record<string, string>;
  /** 图片优化选项 */
  imageOptimization?: {
    compress?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
  /** 是否添加水印 */
  addWatermark?: boolean;
  /** 水印文本 */
  watermarkText?: string;
}

/**
 * 格式化后的内容
 */
export interface FormattedContent {
  /** 格式化后的HTML内容 */
  html: string;
  /** 纯文本内容 */
  plainText: string;
  /** 内容质量报告 */
  qualityReport: ContentQualityReport;
  /** 处理耗时（毫秒） */
  processingTime: number;
  /** 图片数量 */
  imageCount: number;
  /** 字数统计 */
  wordCount: number;
  /** 格式化时间 */
  formattedAt: Date;
}

/**
 * 内容质量报告
 */
export interface ContentQualityReport {
  /** 问题列表 */
  issues: ContentQualityIssue[];
  /** 改进建议 */
  suggestions: string[];
  /** 质量分数（0-100） */
  score: number;
  /** 检查时间 */
  checkedAt: Date;
}

/**
 * 内容质量问题
 */
export interface ContentQualityIssue {
  /** 问题类型：error, warning, suggestion */
  type: 'error' | 'warning' | 'suggestion';
  /** 问题描述 */
  message: string;
  /** 严重程度：high, medium, low */
  severity: 'high' | 'medium' | 'low';
  /** 位置信息（可选） */
  location?: {
    line?: number;
    column?: number;
    element?: string;
  };
}
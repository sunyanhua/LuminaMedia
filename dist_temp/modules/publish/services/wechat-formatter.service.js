"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var WechatFormatterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatFormatterService = void 0;
const common_1 = require("@nestjs/common");
const cheerio = __importStar(require("cheerio"));
const html_to_text_1 = require("html-to-text");
let WechatFormatterService = WechatFormatterService_1 = class WechatFormatterService {
    logger = new common_1.Logger(WechatFormatterService_1.name);
    templates = {
        title: {
            h1: '<h1 style="font-size: 20px; font-weight: bold; color: #333; line-height: 1.4; margin: 20px 0 10px; border-left: 4px solid #1890ff; padding-left: 10px;">$content</h1>',
            h2: '<h2 style="font-size: 18px; font-weight: bold; color: #333; line-height: 1.4; margin: 18px 0 9px; border-left: 3px solid #52c41a; padding-left: 10px;">$content</h2>',
            h3: '<h3 style="font-size: 16px; font-weight: bold; color: #333; line-height: 1.4; margin: 16px 0 8px; border-left: 2px solid #faad14; padding-left: 10px;">$content</h3>',
        },
        paragraph: '<p style="font-size: 15px; color: #555; line-height: 1.8; margin: 0 0 15px; text-align: justify;">$content</p>',
        blockquote: '<blockquote style="border-left: 4px solid #d9d9d9; margin: 15px 0; padding: 10px 15px; background-color: #f9f9f9; color: #666; font-style: italic;">$content</blockquote>',
        code: {
            inline: '<code style="font-family: Consolas, Monaco, monospace; background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 14px; color: #c7254e;">$content</code>',
            block: '<pre style="font-family: Consolas, Monaco, monospace; background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 14px; line-height: 1.5; margin: 15px 0;"><code>$content</code></pre>',
        },
        list: {
            ul: '<ul style="margin: 15px 0; padding-left: 25px; color: #555;">$content</ul>',
            ol: '<ol style="margin: 15px 0; padding-left: 25px; color: #555;">$content</ol>',
            li: '<li style="margin: 8px 0; line-height: 1.6;">$content</li>',
        },
        hr: '<hr style="border: none; border-top: 1px solid #e8e8e8; margin: 20px 0;">',
        image: '<div style="margin: 20px 0; text-align: center;"><img src="$src" alt="$alt" style="max-width: 100%; height: auto; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><p style="font-size: 13px; color: #999; margin-top: 8px;">$caption</p></div>',
        table: '<div style="overflow-x: auto; margin: 20px 0;"><table style="width: 100%; border-collapse: collapse; font-size: 14px;">$content</table></div>',
        tableRow: '<tr>$content</tr>',
        tableHeader: '<th style="border: 1px solid #d9d9d9; padding: 10px; background-color: #fafafa; font-weight: bold; text-align: left;">$content</th>',
        tableCell: '<td style="border: 1px solid #d9d9d9; padding: 10px;">$content</td>',
    };
    async formatContent(content, options = {}) {
        this.logger.log('Formatting content for WeChat');
        const startTime = Date.now();
        try {
            let htmlContent = await this.preprocessContent(content, options);
            htmlContent = this.cleanHtml(htmlContent);
            htmlContent = this.applyTemplates(htmlContent, options);
            htmlContent = await this.optimizeImages(htmlContent, options);
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
        }
        catch (error) {
            this.logger.error(`Failed to format content: ${error.message}`, error.stack);
            throw new Error(`Content formatting failed: ${error.message}`);
        }
    }
    async preprocessContent(content, options) {
        if (this.isMarkdown(content)) {
            return this.markdownToHtml(content);
        }
        if (this.isHtml(content)) {
            return content;
        }
        return this.textToHtml(content);
    }
    cleanHtml(html) {
        const $ = cheerio.load(html, { decodeEntities: false });
        const dangerousTags = [
            'script',
            'style',
            'iframe',
            'frame',
            'frameset',
            'object',
            'embed',
            'applet',
        ];
        dangerousTags.forEach((tag) => $(tag).remove());
        $('*').each((_, element) => {
            const $elem = $(element);
            const attrs = $elem.attr();
            if (attrs) {
                Object.keys(attrs).forEach((attr) => {
                    if (attr.startsWith('on') || attrs[attr]?.startsWith('javascript:')) {
                        $elem.removeAttr(attr);
                    }
                });
            }
        });
        return $.html();
    }
    applyTemplates(html, options) {
        const $ = cheerio.load(html, { decodeEntities: false });
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
        $('p').each((_, element) => {
            const $elem = $(element);
            const content = $elem.html() || '';
            $elem.replaceWith(this.templates.paragraph.replace('$content', content));
        });
        $('blockquote').each((_, element) => {
            const $elem = $(element);
            const content = $elem.html() || '';
            $elem.replaceWith(this.templates.blockquote.replace('$content', content));
        });
        $('code').each((_, element) => {
            const $elem = $(element);
            const content = $elem.html() || '';
            const isBlock = $elem.parent().is('pre');
            if (isBlock) {
                $elem
                    .parent()
                    .replaceWith(this.templates.code.block.replace('$content', content));
            }
            else {
                $elem.replaceWith(this.templates.code.inline.replace('$content', content));
            }
        });
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
        $('hr').each((_, element) => {
            $(element).replaceWith(this.templates.hr);
        });
        $('img').each((_, element) => {
            const $elem = $(element);
            const src = $elem.attr('src') || '';
            const alt = $elem.attr('alt') || '';
            const title = $elem.attr('title') || alt;
            let caption = '';
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
        $('table').each((_, element) => {
            const $table = $(element);
            const $rows = $table.find('tr');
            const processedRows = [];
            $rows.each((rowIndex, row) => {
                const $row = $(row);
                const $cells = $row.find('th, td');
                const processedCells = [];
                $cells.each((cellIndex, cell) => {
                    const $cell = $(cell);
                    const content = $cell.html() || '';
                    const isHeader = $cell.is('th');
                    const cellTemplate = isHeader
                        ? this.templates.tableHeader
                        : this.templates.tableCell;
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
    async optimizeImages(html, options) {
        const $ = cheerio.load(html, { decodeEntities: false });
        const images = $('img');
        if (images.length === 0) {
            return html;
        }
        images.each((index, element) => {
            const $elem = $(element);
            const src = $elem.attr('src') || '';
            $elem.attr('data-image-index', (index + 1).toString());
            if (!$elem.attr('alt')) {
                $elem.attr('alt', `图片${index + 1}`);
            }
        });
        return $.html();
    }
    checkContentQuality(html) {
        const $ = cheerio.load(html, { decodeEntities: false });
        const text = $.root().text();
        const issues = [];
        const suggestions = [];
        const h1Count = $('h1').length;
        if (h1Count === 0) {
            issues.push({
                type: 'warning',
                message: '缺少H1标题',
                severity: 'medium',
            });
            suggestions.push('建议添加一个H1标题作为文章主标题');
        }
        else if (h1Count > 1) {
            issues.push({
                type: 'warning',
                message: '多个H1标题',
                severity: 'low',
            });
            suggestions.push('建议只保留一个H1标题，其他使用H2/H3');
        }
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
        const imageCount = $('img').length;
        if (imageCount === 0) {
            issues.push({
                type: 'suggestion',
                message: '文章中没有图片',
                severity: 'low',
            });
            suggestions.push('建议添加1-3张相关图片提升阅读体验');
        }
        else if (imageCount > 10) {
            issues.push({
                type: 'warning',
                message: `图片数量过多（${imageCount}张）`,
                severity: 'low',
            });
            suggestions.push('建议精选3-5张最具代表性的图片');
        }
        const wordCount = this.countWords(text);
        if (wordCount < 300) {
            issues.push({
                type: 'warning',
                message: `文章内容过短（${wordCount}字）`,
                severity: 'medium',
            });
            suggestions.push('建议补充内容至300字以上，提供更完整的信息');
        }
        else if (wordCount > 3000) {
            issues.push({
                type: 'warning',
                message: `文章内容过长（${wordCount}字）`,
                severity: 'low',
            });
            suggestions.push('建议将长文拆分为系列文章或添加目录导航');
        }
        const sentences = text
            .split(/[。！？.!?]/)
            .filter((s) => s.trim().length > 0);
        let longSentenceCount = 0;
        sentences.forEach((sentence) => {
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
    calculateQualityScore(issues) {
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
    extractPlainText(html) {
        return (0, html_to_text_1.htmlToText)(html, {
            wordwrap: false,
        });
    }
    countImages(html) {
        const $ = cheerio.load(html, { decodeEntities: false });
        return $('img').length;
    }
    countWords(text) {
        const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
        const englishWords = text
            .replace(/[\u4e00-\u9fa5]/g, ' ')
            .split(/\s+/)
            .filter((word) => word.length > 0);
        return chineseChars.length + englishWords.length;
    }
    isMarkdown(content) {
        const markdownPatterns = [
            /^#{1,6}\s/,
            /^[-*]\s/,
            /^\d+\.\s/,
            /^>/,
            /```/,
            /\[.*\]\(.*\)/,
            /!\[.*\]\(.*\)/,
        ];
        return markdownPatterns.some((pattern) => pattern.test(content));
    }
    isHtml(content) {
        const htmlPatterns = [
            /<[a-z][\s\S]*>/i,
            /&[a-z]+;/i,
        ];
        return htmlPatterns.some((pattern) => pattern.test(content));
    }
    markdownToHtml(markdown) {
        let html = markdown;
        html = html.replace(/^#{6}\s(.+)$/gm, '<h6>$1</h6>');
        html = html.replace(/^#{5}\s(.+)$/gm, '<h5>$1</h5>');
        html = html.replace(/^#{4}\s(.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^#{3}\s(.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^#{2}\s(.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^#\s(.+)$/gm, '<h1>$1</h1>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');
        html = html.replace(/`(.+?)`/g, '<code>$1</code>');
        html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
        html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">');
        html = html.replace(/^[-*]\s(.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');
        html = html.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.+<\/li>\n)+/g, '<ol>$&</ol>');
        html = html.replace(/^>\s(.+)$/gm, '<blockquote>$1</blockquote>');
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        return html;
    }
    textToHtml(text) {
        const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
        const htmlParagraphs = paragraphs.map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`);
        return htmlParagraphs.join('');
    }
    getTemplates() {
        return { ...this.templates };
    }
    updateTemplates(newTemplates) {
        this.templates = { ...this.templates, ...newTemplates };
        this.logger.log('WeChat formatting templates updated');
    }
};
exports.WechatFormatterService = WechatFormatterService;
exports.WechatFormatterService = WechatFormatterService = WechatFormatterService_1 = __decorate([
    (0, common_1.Injectable)()
], WechatFormatterService);
//# sourceMappingURL=wechat-formatter.service.js.map
export declare class WechatFormatterService {
    private readonly logger;
    private templates;
    formatContent(content: string, options?: WechatFormatOptions): Promise<FormattedContent>;
    private preprocessContent;
    private cleanHtml;
    private applyTemplates;
    private optimizeImages;
    private checkContentQuality;
    private calculateQualityScore;
    private extractPlainText;
    private countImages;
    private countWords;
    private isMarkdown;
    private isHtml;
    private markdownToHtml;
    private textToHtml;
    getTemplates(): Record<string, any>;
    updateTemplates(newTemplates: Partial<typeof this.templates>): void;
}
export interface WechatFormatOptions {
    enableAdvancedFormatting?: boolean;
    generateImageSuggestions?: boolean;
    enableQualityCheck?: boolean;
    customStyles?: Record<string, string>;
    imageOptimization?: {
        compress?: boolean;
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    };
    addWatermark?: boolean;
    watermarkText?: string;
}
export interface FormattedContent {
    html: string;
    plainText: string;
    qualityReport: ContentQualityReport;
    processingTime: number;
    imageCount: number;
    wordCount: number;
    formattedAt: Date;
}
export interface ContentQualityReport {
    issues: ContentQualityIssue[];
    suggestions: string[];
    score: number;
    checkedAt: Date;
}
export interface ContentQualityIssue {
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    severity: 'high' | 'medium' | 'low';
    location?: {
        line?: number;
        column?: number;
        element?: string;
    };
}

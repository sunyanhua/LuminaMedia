export declare class AIImageGeneratorService {
    private readonly logger;
    private readonly config;
    constructor();
    generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>;
    generateImages(prompts: string[], options?: ImageGenerationOptions): Promise<ImageGenerationResult[]>;
    optimizeImage(imageResult: ImageGenerationResult, options?: ImageOptimizationOptions): Promise<ImageGenerationResult>;
    optimizeImages(imageResults: ImageGenerationResult[], options?: ImageOptimizationOptions): Promise<ImageGenerationResult[]>;
    generateImageSuggestions(content: string, count?: number): Promise<ImageSuggestion[]>;
    generateWatermarkedImage(imageData: string | Buffer, watermarkText: string, options?: WatermarkOptions): Promise<string>;
    getSupportedFormats(): string[];
    getProviderStatus(): Record<string, ProviderStatus>;
    private generateWithOpenAI;
    private generateWithStabilityAI;
    private generateMockImage;
    private selectProvider;
    private extractKeywords;
    private createImagePrompts;
    private generateImageDescription;
    private calculateRelevanceScore;
    private suggestImagePosition;
    private delay;
}
export interface ImageGenerationOptions {
    provider?: string;
    size?: string;
    quality?: string;
    style?: string;
    n?: number;
    optimize?: boolean;
    optimization?: ImageOptimizationOptions;
    customParams?: Record<string, any>;
}
export interface ImageOptimizationOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    addWatermark?: boolean;
    watermarkText?: string;
}
export interface ImageGenerationResult {
    id: string;
    prompt: string;
    imageUrl?: string;
    imageData?: string;
    provider: string;
    metadata: Record<string, any>;
    processingTime?: number;
    generatedAt?: Date;
}
export interface ImageSuggestion {
    id: string;
    prompt: string;
    imageUrl?: string;
    imageData?: string;
    description: string;
    relevanceScore: number;
    suggestedPosition: string;
    metadata: Record<string, any>;
}
export interface WatermarkOptions {
    text?: string;
    fontSize?: number;
    color?: string;
    position?: string;
    padding?: number;
}
export interface ProviderStatus {
    available: boolean;
    quota: 'unknown' | 'sufficient' | 'limited' | 'exhausted' | 'unlimited';
    latency: number;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AIImageGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIImageGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const sharp_1 = __importDefault(require("sharp"));
const { v4: uuidv4 } = require('uuid');
let AIImageGeneratorService = AIImageGeneratorService_1 = class AIImageGeneratorService {
    logger = new common_1.Logger(AIImageGeneratorService_1.name);
    config = {
        defaultGenerationOptions: {
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid',
            n: 1,
        },
        optimizationOptions: {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 80,
            format: 'jpeg',
        },
        apiEndpoints: {
            openai: 'https://api.openai.com/v1/images/generations',
            stabilityai: 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
        },
    };
    constructor() {
        this.logger.log('AIImageGeneratorService initialized');
    }
    async generateImage(prompt, options = {}) {
        this.logger.log(`Generating AI image with prompt: ${prompt.substring(0, 50)}...`);
        const startTime = Date.now();
        try {
            const generationOptions = {
                ...this.config.defaultGenerationOptions,
                ...options,
            };
            const provider = options.provider || this.selectProvider();
            let result;
            switch (provider) {
                case 'openai':
                    result = await this.generateWithOpenAI(prompt, generationOptions);
                    break;
                case 'stabilityai':
                    result = await this.generateWithStabilityAI(prompt, generationOptions);
                    break;
                case 'mock':
                    result = await this.generateMockImage(prompt, generationOptions);
                    break;
                default:
                    throw new Error(`Unsupported AI provider: ${provider}`);
            }
            if (options.optimize !== false) {
                result = await this.optimizeImage(result, options.optimization);
            }
            const processingTime = Date.now() - startTime;
            this.logger.log(`AI image generated in ${processingTime}ms, provider: ${provider}`);
            return {
                ...result,
                processingTime,
                generatedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate AI image: ${error.message}`, error.stack);
            throw new Error(`AI image generation failed: ${error.message}`);
        }
    }
    async generateImages(prompts, options = {}) {
        this.logger.log(`Generating ${prompts.length} AI images`);
        const results = [];
        const errors = [];
        const batchSize = 3;
        for (let i = 0; i < prompts.length; i += batchSize) {
            const batch = prompts.slice(i, i + batchSize);
            const batchPromises = batch.map(async (prompt) => {
                try {
                    const result = await this.generateImage(prompt, options);
                    results.push(result);
                }
                catch (error) {
                    errors.push({ prompt, error: error.message });
                    this.logger.error(`Failed to generate image for prompt: ${prompt.substring(0, 50)}...`);
                }
            });
            await Promise.allSettled(batchPromises);
            if (i + batchSize < prompts.length) {
                await this.delay(1000);
            }
        }
        if (errors.length > 0) {
            this.logger.warn(`Batch generation completed with ${errors.length} errors`);
        }
        return results;
    }
    async optimizeImage(imageResult, options = {}) {
        if (!imageResult.imageUrl && !imageResult.imageData) {
            throw new Error('No image data to optimize');
        }
        const optimizationOptions = {
            ...this.config.optimizationOptions,
            ...options,
        };
        try {
            let imageBuffer;
            if (imageResult.imageData) {
                const base64Data = imageResult.imageData.replace(/^data:image\/\w+;base64,/, '');
                imageBuffer = Buffer.from(base64Data, 'base64');
            }
            else if (imageResult.imageUrl) {
                const response = await axios_1.default.get(imageResult.imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 30000,
                });
                imageBuffer = Buffer.from(response.data);
            }
            else {
                throw new Error('No image data available for optimization');
            }
            let sharpInstance = (0, sharp_1.default)(imageBuffer);
            const metadata = await sharpInstance.metadata();
            if (optimizationOptions.maxWidth || optimizationOptions.maxHeight) {
                const targetWidth = optimizationOptions.maxWidth || metadata.width;
                const targetHeight = optimizationOptions.maxHeight || metadata.height;
                sharpInstance = sharpInstance.resize({
                    width: targetWidth,
                    height: targetHeight,
                    fit: 'inside',
                    withoutEnlargement: true,
                });
            }
            const format = optimizationOptions.format || 'jpeg';
            let optimizedBuffer;
            switch (format) {
                case 'jpeg':
                    optimizedBuffer = await sharpInstance
                        .jpeg({ quality: optimizationOptions.quality })
                        .toBuffer();
                    break;
                case 'png':
                    optimizedBuffer = await sharpInstance
                        .png({ quality: optimizationOptions.quality })
                        .toBuffer();
                    break;
                case 'webp':
                    optimizedBuffer = await sharpInstance
                        .webp({ quality: optimizationOptions.quality })
                        .toBuffer();
                    break;
                default:
                    throw new Error(`Unsupported image format: ${format}`);
            }
            const originalSize = imageBuffer.length;
            const optimizedSize = optimizedBuffer.length;
            const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;
            this.logger.log(`Image optimized: ${originalSize} bytes -> ${optimizedSize} bytes (${compressionRatio.toFixed(1)}% reduction)`);
            const mimeType = `image/${format}`;
            const base64Data = `data:${mimeType};base64,${optimizedBuffer.toString('base64')}`;
            return {
                ...imageResult,
                imageData: base64Data,
                imageUrl: undefined,
                metadata: {
                    ...imageResult.metadata,
                    optimization: {
                        originalSize,
                        optimizedSize,
                        compressionRatio,
                        format,
                        quality: optimizationOptions.quality,
                        width: metadata.width,
                        height: metadata.height,
                        optimizedAt: new Date(),
                    },
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to optimize image: ${error.message}`, error.stack);
            return imageResult;
        }
    }
    async optimizeImages(imageResults, options = {}) {
        const optimizedResults = [];
        const errors = [];
        const batchSize = 5;
        for (let i = 0; i < imageResults.length; i += batchSize) {
            const batch = imageResults.slice(i, i + batchSize);
            const batchPromises = batch.map(async (imageResult, index) => {
                try {
                    const optimized = await this.optimizeImage(imageResult, options);
                    optimizedResults.push(optimized);
                }
                catch (error) {
                    errors.push({ index: i + index, error: error.message });
                    optimizedResults.push(imageResult);
                }
            });
            await Promise.allSettled(batchPromises);
        }
        if (errors.length > 0) {
            this.logger.warn(`Batch optimization completed with ${errors.length} errors`);
        }
        return optimizedResults;
    }
    async generateImageSuggestions(content, count = 3) {
        this.logger.log(`Generating ${count} image suggestions for content`);
        const keywords = this.extractKeywords(content);
        this.logger.log(`Extracted keywords: ${keywords.join(', ')}`);
        const prompts = this.createImagePrompts(keywords, count);
        const imageResults = await this.generateImages(prompts, {
            size: '1024x1024',
            style: 'vivid',
            n: 1,
        });
        const suggestions = imageResults.map((result, index) => ({
            id: uuidv4(),
            prompt: prompts[index],
            imageUrl: result.imageUrl,
            imageData: result.imageData,
            description: this.generateImageDescription(prompts[index]),
            relevanceScore: this.calculateRelevanceScore(prompts[index], content),
            suggestedPosition: this.suggestImagePosition(content, index, imageResults.length),
            metadata: {
                ...result.metadata,
                keywords: keywords.slice(0, 3),
            },
        }));
        suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
        return suggestions;
    }
    async generateWatermarkedImage(imageData, watermarkText, options = {}) {
        try {
            let imageBuffer;
            if (typeof imageData === 'string') {
                const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
                imageBuffer = Buffer.from(base64Data, 'base64');
            }
            else {
                imageBuffer = imageData;
            }
            const watermarkOptions = {
                text: watermarkText,
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.7)',
                position: 'bottom-right',
                padding: 20,
                ...options,
            };
            const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
            const { width, height } = metadata;
            const svgText = `
        <svg width="${width}" height="${height}">
          <style>
            .watermark {
              font-family: Arial, sans-serif;
              font-size: ${watermarkOptions.fontSize}px;
              fill: ${watermarkOptions.color};
              font-weight: bold;
            }
          </style>
          <text x="${width - watermarkOptions.padding}" y="${height - watermarkOptions.padding}"
                text-anchor="end" class="watermark">
            ${watermarkOptions.text}
          </text>
        </svg>
      `;
            const svgBuffer = Buffer.from(svgText);
            const watermarkedBuffer = await (0, sharp_1.default)(imageBuffer)
                .composite([{ input: svgBuffer, blend: 'over' }])
                .toBuffer();
            return `data:image/jpeg;base64,${watermarkedBuffer.toString('base64')}`;
        }
        catch (error) {
            this.logger.error(`Failed to generate watermarked image: ${error.message}`, error.stack);
            throw new Error(`Watermark generation failed: ${error.message}`);
        }
    }
    getSupportedFormats() {
        return ['jpeg', 'png', 'webp', 'gif'];
    }
    getProviderStatus() {
        return {
            openai: { available: true, quota: 'unknown', latency: 0 },
            stabilityai: { available: true, quota: 'unknown', latency: 0 },
            mock: { available: true, quota: 'unlimited', latency: 0 },
        };
    }
    async generateWithOpenAI(prompt, options) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not configured');
        }
        const requestData = {
            prompt,
            n: options.n || 1,
            size: options.size || '1024x1024',
            quality: options.quality || 'standard',
            style: options.style || 'vivid',
            response_format: 'url',
        };
        try {
            const response = await axios_1.default.post(this.config.apiEndpoints.openai, requestData, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            });
            const imageUrl = response.data.data[0]?.url;
            if (!imageUrl) {
                throw new Error('No image URL returned from OpenAI API');
            }
            return {
                id: uuidv4(),
                prompt,
                imageUrl,
                provider: 'openai',
                metadata: {
                    size: options.size,
                    quality: options.quality,
                    style: options.style,
                    model: 'dall-e-3',
                    apiResponse: response.data,
                },
            };
        }
        catch (error) {
            this.logger.error(`OpenAI DALL-E API error: ${error.message}`);
            throw error;
        }
    }
    async generateWithStabilityAI(prompt, options) {
        const apiKey = process.env.STABILITYAI_API_KEY;
        if (!apiKey) {
            throw new Error('STABILITYAI_API_KEY is not configured');
        }
        const [width, height] = options.size?.split('x').map(Number) || [
            1024, 1024,
        ];
        const requestData = {
            text_prompts: [{ text: prompt, weight: 1 }],
            cfg_scale: 7,
            height,
            width,
            steps: 30,
            samples: options.n || 1,
        };
        try {
            const response = await axios_1.default.post(this.config.apiEndpoints.stabilityai, requestData, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            });
            const imageBase64 = response.data.artifacts[0]?.base64;
            if (!imageBase64) {
                throw new Error('No image data returned from Stability AI API');
            }
            return {
                id: uuidv4(),
                prompt,
                imageData: `data:image/png;base64,${imageBase64}`,
                provider: 'stabilityai',
                metadata: {
                    size: options.size,
                    width,
                    height,
                    model: 'stable-diffusion-v1.6',
                    apiResponse: response.data,
                },
            };
        }
        catch (error) {
            this.logger.error(`Stability AI API error: ${error.message}`);
            throw error;
        }
    }
    async generateMockImage(prompt, options) {
        const [width, height] = options.size?.split('x').map(Number) || [
            1024, 1024,
        ];
        const svg = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(74, 144, 226);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(146, 83, 214);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gradient)" />
        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">
          ${prompt.substring(0, 30)}
        </text>
      </svg>
    `;
        const svgBuffer = Buffer.from(svg);
        const pngBuffer = await (0, sharp_1.default)(svgBuffer).png().toBuffer();
        const base64Data = pngBuffer.toString('base64');
        await this.delay(1000);
        return {
            id: uuidv4(),
            prompt,
            imageData: `data:image/png;base64,${base64Data}`,
            provider: 'mock',
            metadata: {
                size: options.size,
                width,
                height,
                model: 'mock-generator',
                note: 'This is a mock image for development and testing',
            },
        };
    }
    selectProvider() {
        if (process.env.OPENAI_API_KEY) {
            return 'openai';
        }
        else if (process.env.STABILITYAI_API_KEY) {
            return 'stabilityai';
        }
        else {
            return 'mock';
        }
    }
    extractKeywords(content) {
        const chineseWords = content.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
        const stopWords = [
            '的',
            '了',
            '在',
            '是',
            '我',
            '有',
            '和',
            '就',
            '不',
            '人',
            '都',
            '一',
            '一个',
            '上',
            '也',
            '很',
            '到',
            '说',
            '要',
            '去',
            '你',
            '会',
            '着',
            '没有',
            '看',
            '好',
            '自己',
            '这',
        ];
        const filteredWords = chineseWords.filter((word) => !stopWords.includes(word));
        const wordCount = {};
        filteredWords.forEach((word) => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        const sortedWords = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
        return sortedWords;
    }
    createImagePrompts(keywords, count) {
        if (keywords.length === 0) {
            return Array(count).fill('精美的抽象艺术，简约设计，现代风格');
        }
        const prompts = [];
        for (let i = 0; i < count; i++) {
            const selectedKeywords = [...keywords]
                .sort(() => Math.random() - 0.5)
                .slice(0, 2 + Math.floor(Math.random() * 2));
            const style = ['简约设计', '现代风格', '艺术感', '高质量', '专业摄影'][i % 5];
            const prompt = `${selectedKeywords.join('、')}，${style}，高清，4K`;
            prompts.push(prompt);
        }
        return prompts;
    }
    generateImageDescription(prompt) {
        return `基于"${prompt.substring(0, 50)}..."生成的配图，适合用于文章插图`;
    }
    calculateRelevanceScore(prompt, content) {
        const promptKeywords = prompt.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
        const contentKeywords = content.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
        if (promptKeywords.length === 0 || contentKeywords.length === 0) {
            return 0.5;
        }
        const matches = promptKeywords.filter((keyword) => contentKeywords.some((contentKeyword) => contentKeyword.includes(keyword) || keyword.includes(contentKeyword))).length;
        return matches / promptKeywords.length;
    }
    suggestImagePosition(content, index, total) {
        const positions = [
            '文章开头',
            '第一段后',
            '中间位置',
            '结尾前',
            '文章结尾',
        ];
        return positions[index % positions.length];
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.AIImageGeneratorService = AIImageGeneratorService;
exports.AIImageGeneratorService = AIImageGeneratorService = AIImageGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AIImageGeneratorService);
//# sourceMappingURL=ai-image-generator.service.js.map
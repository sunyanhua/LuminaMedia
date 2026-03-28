import { Injectable, Logger, Inject } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
const { v4: uuidv4 } = require('uuid');

/**
 * AI图片生成服务
 * 集成多种AI图片生成API（DALL-E、Midjourney、Stable Diffusion等）
 * 提供图片生成、优化、压缩功能
 */
@Injectable()
export class AIImageGeneratorService {
  private readonly logger = new Logger(AIImageGeneratorService.name);

  /**
   * 配置项
   */
  private readonly config = {
    // 默认图片生成选项
    defaultGenerationOptions: {
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
      n: 1,
    },
    // 图片优化选项
    optimizationOptions: {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 80,
      format: 'jpeg' as const,
    },
    // API端点（可配置）
    apiEndpoints: {
      openai: 'https://api.openai.com/v1/images/generations',
      stabilityai: 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
      // 其他AI图片生成API
    },
  };

  constructor() {
    this.logger.log('AIImageGeneratorService initialized');
  }

  /**
   * 生成AI图片
   * @param prompt 图片生成提示词
   * @param options 生成选项
   * @returns 生成的图片URL或Base64数据
   */
  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {},
  ): Promise<ImageGenerationResult> {
    this.logger.log(`Generating AI image with prompt: ${prompt.substring(0, 50)}...`);

    const startTime = Date.now();

    try {
      // 合并选项
      const generationOptions = {
        ...this.config.defaultGenerationOptions,
        ...options,
      };

      // 选择AI提供商（根据配置或自动选择）
      const provider = options.provider || this.selectProvider();

      // 调用对应的AI图片生成API
      let result: ImageGenerationResult;
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

      // 如果需要优化图片
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
    } catch (error) {
      this.logger.error(`Failed to generate AI image: ${error.message}`, error.stack);
      throw new Error(`AI image generation failed: ${error.message}`);
    }
  }

  /**
   * 批量生成图片
   */
  async generateImages(
    prompts: string[],
    options: ImageGenerationOptions = {},
  ): Promise<ImageGenerationResult[]> {
    this.logger.log(`Generating ${prompts.length} AI images`);

    const results: ImageGenerationResult[] = [];
    const errors: Array<{ prompt: string; error: string }> = [];

    // 限制并发数量，避免API限制
    const batchSize = 3;
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const batchPromises = batch.map(async (prompt) => {
        try {
          const result = await this.generateImage(prompt, options);
          results.push(result);
        } catch (error) {
          errors.push({ prompt, error: error.message });
          this.logger.error(`Failed to generate image for prompt: ${prompt.substring(0, 50)}...`);
        }
      });

      await Promise.allSettled(batchPromises);

      // 批次之间延迟，避免API限流
      if (i + batchSize < prompts.length) {
        await this.delay(1000);
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`Batch generation completed with ${errors.length} errors`);
    }

    return results;
  }

  /**
   * 优化图片（压缩、调整大小、格式转换等）
   */
  async optimizeImage(
    imageResult: ImageGenerationResult,
    options: ImageOptimizationOptions = {},
  ): Promise<ImageGenerationResult> {
    if (!imageResult.imageUrl && !imageResult.imageData) {
      throw new Error('No image data to optimize');
    }

    const optimizationOptions = {
      ...this.config.optimizationOptions,
      ...options,
    };

    try {
      // 获取图片数据
      let imageBuffer: Buffer;
      if (imageResult.imageData) {
        // Base64数据
        const base64Data = imageResult.imageData.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (imageResult.imageUrl) {
        // 从URL下载
        const response = await axios.get(imageResult.imageUrl, {
          responseType: 'arraybuffer',
          timeout: 30000,
        });
        imageBuffer = Buffer.from(response.data);
      } else {
        throw new Error('No image data available for optimization');
      }

      // 使用sharp进行图片优化
      let sharpInstance = sharp(imageBuffer);

      // 获取元数据
      const metadata = await sharpInstance.metadata();

      // 调整大小（如果需要）
      if (optimizationOptions.maxWidth || optimizationOptions.maxHeight) {
        const targetWidth = optimizationOptions.maxWidth || metadata.width;
        const targetHeight = optimizationOptions.maxHeight || metadata.height;

        sharpInstance = sharpInstance.resize({
          width: targetWidth,
          height: targetHeight,
          fit: 'inside', // 保持宽高比，不裁剪
          withoutEnlargement: true, // 不放大图片
        });
      }

      // 设置质量（JPEG/WebP）
      const format = optimizationOptions.format || 'jpeg';
      let optimizedBuffer: Buffer;

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

      // 计算优化效果
      const originalSize = imageBuffer.length;
      const optimizedSize = optimizedBuffer.length;
      const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

      this.logger.log(`Image optimized: ${originalSize} bytes -> ${optimizedSize} bytes (${compressionRatio.toFixed(1)}% reduction)`);

      // 转换为Base64
      const mimeType = `image/${format}`;
      const base64Data = `data:${mimeType};base64,${optimizedBuffer.toString('base64')}`;

      return {
        ...imageResult,
        imageData: base64Data,
        imageUrl: undefined, // 清除URL，使用Base64数据
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
    } catch (error) {
      this.logger.error(`Failed to optimize image: ${error.message}`, error.stack);
      // 优化失败时返回原始结果
      return imageResult;
    }
  }

  /**
   * 批量优化图片
   */
  async optimizeImages(
    imageResults: ImageGenerationResult[],
    options: ImageOptimizationOptions = {},
  ): Promise<ImageGenerationResult[]> {
    const optimizedResults: ImageGenerationResult[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    const batchSize = 5;
    for (let i = 0; i < imageResults.length; i += batchSize) {
      const batch = imageResults.slice(i, i + batchSize);
      const batchPromises = batch.map(async (imageResult, index) => {
        try {
          const optimized = await this.optimizeImage(imageResult, options);
          optimizedResults.push(optimized);
        } catch (error) {
          errors.push({ index: i + index, error: error.message });
          // 失败时保留原始结果
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

  /**
   * 生成图片建议（基于文本内容）
   */
  async generateImageSuggestions(
    content: string,
    count: number = 3,
  ): Promise<ImageSuggestion[]> {
    this.logger.log(`Generating ${count} image suggestions for content`);

    // 从内容中提取关键词
    const keywords = this.extractKeywords(content);
    this.logger.log(`Extracted keywords: ${keywords.join(', ')}`);

    // 基于关键词生成图片提示词
    const prompts = this.createImagePrompts(keywords, count);

    // 生成图片
    const imageResults = await this.generateImages(prompts, {
      size: '1024x1024',
      style: 'vivid',
      n: 1,
    });

    // 转换为建议格式
    const suggestions: ImageSuggestion[] = imageResults.map((result, index) => ({
      id: uuidv4(),
      prompt: prompts[index],
      imageUrl: result.imageUrl,
      imageData: result.imageData,
      description: this.generateImageDescription(prompts[index]),
      relevanceScore: this.calculateRelevanceScore(prompts[index], content),
      suggestedPosition: this.suggestImagePosition(content, index, imageResults.length),
      metadata: {
        ...result.metadata,
        keywords: keywords.slice(0, 3), // 前3个关键词
      },
    }));

    // 按相关性排序
    suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return suggestions;
  }

  /**
   * 生成水印图片
   */
  async generateWatermarkedImage(
    imageData: string | Buffer,
    watermarkText: string,
    options: WatermarkOptions = {},
  ): Promise<string> {
    try {
      let imageBuffer: Buffer;
      if (typeof imageData === 'string') {
        // Base64字符串
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
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

      // 使用sharp添加水印
      const metadata = await sharp(imageBuffer).metadata();
      const { width, height } = metadata;

      // 创建水印SVG
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

      const watermarkedBuffer = await sharp(imageBuffer)
        .composite([{ input: svgBuffer, blend: 'over' }])
        .toBuffer();

      return `data:image/jpeg;base64,${watermarkedBuffer.toString('base64')}`;
    } catch (error) {
      this.logger.error(`Failed to generate watermarked image: ${error.message}`, error.stack);
      throw new Error(`Watermark generation failed: ${error.message}`);
    }
  }

  /**
   * 获取支持的图片格式
   */
  getSupportedFormats(): string[] {
    return ['jpeg', 'png', 'webp', 'gif'];
  }

  /**
   * 获取AI提供商状态
   */
  getProviderStatus(): Record<string, ProviderStatus> {
    // 这里可以检查各AI提供商API可用性
    return {
      openai: { available: true, quota: 'unknown', latency: 0 },
      stabilityai: { available: true, quota: 'unknown', latency: 0 },
      mock: { available: true, quota: 'unlimited', latency: 0 },
    };
  }

  // ========== 私有方法 ==========

  /**
   * 使用OpenAI DALL-E生成图片
   */
  private async generateWithOpenAI(
    prompt: string,
    options: ImageGenerationOptions,
  ): Promise<ImageGenerationResult> {
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
      const response = await axios.post(
        this.config.apiEndpoints.openai,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        },
      );

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
    } catch (error) {
      this.logger.error(`OpenAI DALL-E API error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 使用Stability AI生成图片
   */
  private async generateWithStabilityAI(
    prompt: string,
    options: ImageGenerationOptions,
  ): Promise<ImageGenerationResult> {
    const apiKey = process.env.STABILITYAI_API_KEY;
    if (!apiKey) {
      throw new Error('STABILITYAI_API_KEY is not configured');
    }

    // 解析尺寸
    const [width, height] = options.size?.split('x').map(Number) || [1024, 1024];

    const requestData = {
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      height,
      width,
      steps: 30,
      samples: options.n || 1,
    };

    try {
      const response = await axios.post(
        this.config.apiEndpoints.stabilityai,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        },
      );

      // Stability AI返回Base64编码的图片
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
    } catch (error) {
      this.logger.error(`Stability AI API error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 生成模拟图片（用于测试和开发）
   */
  private async generateMockImage(
    prompt: string,
    options: ImageGenerationOptions,
  ): Promise<ImageGenerationResult> {
    // 创建模拟图片（简单的彩色渐变）
    const [width, height] = options.size?.split('x').map(Number) || [1024, 1024];

    // 使用sharp创建渐变图片
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
    const pngBuffer = await sharp(svgBuffer).png().toBuffer();
    const base64Data = pngBuffer.toString('base64');

    // 模拟延迟
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

  /**
   * 选择AI提供商
   */
  private selectProvider(): string {
    // 简单的提供商选择逻辑
    // 可以根据配置、配额、成本等因素选择

    if (process.env.OPENAI_API_KEY) {
      return 'openai';
    } else if (process.env.STABILITYAI_API_KEY) {
      return 'stabilityai';
    } else {
      return 'mock'; // 没有配置时使用模拟
    }
  }

  /**
   * 从内容中提取关键词
   */
  private extractKeywords(content: string): string[] {
    // 简单的中文关键词提取
    const chineseWords = content.match(/[\u4e00-\u9fa5]{2,4}/g) || [];

    // 去除停用词
    const stopWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];

    const filteredWords = chineseWords.filter(word => !stopWords.includes(word));

    // 统计词频
    const wordCount: Record<string, number> = {};
    filteredWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // 按词频排序，取前10个
    const sortedWords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return sortedWords;
  }

  /**
   * 基于关键词创建图片提示词
   */
  private createImagePrompts(keywords: string[], count: number): string[] {
    if (keywords.length === 0) {
      // 默认提示词
      return Array(count).fill('精美的抽象艺术，简约设计，现代风格');
    }

    const prompts: string[] = [];
    for (let i = 0; i < count; i++) {
      // 从关键词中随机选择2-3个
      const selectedKeywords = [...keywords]
        .sort(() => Math.random() - 0.5)
        .slice(0, 2 + Math.floor(Math.random() * 2));

      const style = ['简约设计', '现代风格', '艺术感', '高质量', '专业摄影'][i % 5];
      const prompt = `${selectedKeywords.join('、')}，${style}，高清，4K`;
      prompts.push(prompt);
    }

    return prompts;
  }

  /**
   * 生成图片描述
   */
  private generateImageDescription(prompt: string): string {
    return `基于"${prompt.substring(0, 50)}..."生成的配图，适合用于文章插图`;
  }

  /**
   * 计算图片与内容的相关性分数
   */
  private calculateRelevanceScore(prompt: string, content: string): number {
    // 简单的相关性计算：计算提示词中的关键词在内容中出现的比例
    const promptKeywords = prompt.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    const contentKeywords = content.match(/[\u4e00-\u9fa5]{2,4}/g) || [];

    if (promptKeywords.length === 0 || contentKeywords.length === 0) {
      return 0.5;
    }

    const matches = promptKeywords.filter(keyword =>
      contentKeywords.some(contentKeyword => contentKeyword.includes(keyword) || keyword.includes(contentKeyword))
    ).length;

    return matches / promptKeywords.length;
  }

  /**
   * 建议图片位置
   */
  private suggestImagePosition(content: string, index: number, total: number): string {
    const positions = ['文章开头', '第一段后', '中间位置', '结尾前', '文章结尾'];
    return positions[index % positions.length];
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 图片生成选项
 */
export interface ImageGenerationOptions {
  /** AI提供商：openai, stabilityai, mock等 */
  provider?: string;
  /** 图片尺寸，如 "1024x1024" */
  size?: string;
  /** 图片质量：standard, hd */
  quality?: string;
  /** 图片风格：vivid, natural */
  style?: string;
  /** 生成数量 */
  n?: number;
  /** 是否优化图片 */
  optimize?: boolean;
  /** 优化选项 */
  optimization?: ImageOptimizationOptions;
  /** 自定义参数 */
  customParams?: Record<string, any>;
}

/**
 * 图片优化选项
 */
export interface ImageOptimizationOptions {
  /** 最大宽度 */
  maxWidth?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 图片质量（0-100） */
  quality?: number;
  /** 输出格式：jpeg, png, webp */
  format?: 'jpeg' | 'png' | 'webp';
  /** 是否添加水印 */
  addWatermark?: boolean;
  /** 水印文本 */
  watermarkText?: string;
}

/**
 * 图片生成结果
 */
export interface ImageGenerationResult {
  /** 唯一标识 */
  id: string;
  /** 生成提示词 */
  prompt: string;
  /** 图片URL（如果API返回URL） */
  imageUrl?: string;
  /** 图片Base64数据 */
  imageData?: string;
  /** AI提供商 */
  provider: string;
  /** 元数据 */
  metadata: Record<string, any>;
  /** 处理时间（毫秒） */
  processingTime?: number;
  /** 生成时间 */
  generatedAt?: Date;
}

/**
 * 图片建议
 */
export interface ImageSuggestion {
  /** 建议ID */
  id: string;
  /** 生成提示词 */
  prompt: string;
  /** 图片URL */
  imageUrl?: string;
  /** 图片Base64数据 */
  imageData?: string;
  /** 图片描述 */
  description: string;
  /** 与内容的相关性分数（0-1） */
  relevanceScore: number;
  /** 建议位置 */
  suggestedPosition: string;
  /** 元数据 */
  metadata: Record<string, any>;
}

/**
 * 水印选项
 */
export interface WatermarkOptions {
  /** 水印文本 */
  text?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 颜色 */
  color?: string;
  /** 位置：top-left, top-right, bottom-left, bottom-right, center */
  position?: string;
  /** 边距 */
  padding?: number;
}

/**
 * AI提供商状态
 */
export interface ProviderStatus {
  /** 是否可用 */
  available: boolean;
  /** 配额状态 */
  quota: 'unknown' | 'sufficient' | 'limited' | 'exhausted' | 'unlimited';
  /** 平均延迟（毫秒） */
  latency: number;
}
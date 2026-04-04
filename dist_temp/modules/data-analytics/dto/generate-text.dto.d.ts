import { Platform } from '../../../shared/enums/platform.enum';
export declare class GenerateTextDto {
    prompt: string;
    platform: Platform;
    tone?: 'formal' | 'casual' | 'friendly' | 'professional';
    wordCount?: number;
    includeHashtags?: boolean;
    includeImageSuggestions?: boolean;
    temperature?: number;
    maxTokens?: number;
}

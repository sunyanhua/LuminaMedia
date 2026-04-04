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
var WeChatCollectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeChatCollectorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const data_collection_interface_1 = require("../../interfaces/data-collection.interface");
let WeChatCollectorService = WeChatCollectorService_1 = class WeChatCollectorService {
    configService;
    httpService;
    logger = new common_1.Logger(WeChatCollectorService_1.name);
    apiBaseUrl = 'https://api.weixin.qq.com';
    accessToken = null;
    tokenExpiresAt = null;
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
    }
    getPlatform() {
        return data_collection_interface_1.PlatformType.WECHAT;
    }
    getSupportedMethods() {
        return [data_collection_interface_1.CollectionMethod.API];
    }
    async getAccessToken(credentials) {
        if (this.accessToken &&
            this.tokenExpiresAt &&
            new Date() < this.tokenExpiresAt) {
            return this.accessToken;
        }
        const { appId, appSecret } = credentials;
        if (!appId || !appSecret) {
            throw new Error('微信API凭证缺失: appId和appSecret为必填项');
        }
        try {
            const url = `${this.apiBaseUrl}/cgi-bin/token`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                params: {
                    grant_type: 'client_credential',
                    appid: appId,
                    secret: appSecret,
                },
            }));
            const { access_token, expires_in } = response.data;
            if (!access_token) {
                throw new Error(`获取访问令牌失败: ${JSON.stringify(response.data)}`);
            }
            this.accessToken = access_token;
            this.tokenExpiresAt = new Date(Date.now() + (expires_in - 300) * 1000);
            this.logger.debug(`获取微信访问令牌成功，有效期至: ${this.tokenExpiresAt}`);
            return access_token;
        }
        catch (error) {
            this.logger.error(`获取微信访问令牌失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async validateCredentials(credentials) {
        try {
            await this.getAccessToken(credentials);
            return true;
        }
        catch (error) {
            this.logger.warn(`微信凭证验证失败: ${error.message}`);
            return false;
        }
    }
    async collect(data) {
        const { credentials, config } = data;
        const results = [];
        try {
            const accessToken = await this.getAccessToken(credentials);
            const officialAccountIds = config.officialAccountIds || [];
            if (officialAccountIds.length === 0) {
                this.logger.warn('未指定公众号ID，跳过采集');
                return [];
            }
            for (const accountId of officialAccountIds) {
                try {
                    const articles = await this.fetchOfficialAccountArticles(accessToken, accountId, config);
                    results.push(...articles);
                    this.logger.debug(`公众号 ${accountId} 采集到 ${articles.length} 篇文章`);
                }
                catch (error) {
                    this.logger.error(`采集公众号 ${accountId} 失败: ${error.message}`);
                }
            }
            if (config.keywords && config.keywords.length > 0) {
                const filteredResults = results.filter((item) => config.keywords.some((keyword) => item.title.includes(keyword) || item.content.includes(keyword)));
                this.logger.debug(`关键词过滤: ${results.length} -> ${filteredResults.length} 条`);
                return filteredResults.slice(0, config.maxResults || 100);
            }
            return results.slice(0, config.maxResults || 100);
        }
        catch (error) {
            this.logger.error(`微信采集失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async fetchOfficialAccountArticles(accessToken, officialAccountId, config) {
        const url = `${this.apiBaseUrl}/cgi-bin/material/batchget_material`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
                type: 'news',
                offset: 0,
                count: config.maxResults || 20,
            }, {
                params: { access_token: accessToken },
            }));
            const articles = response.data.item || [];
            const results = [];
            for (const article of articles) {
                try {
                    const content = await this.fetchArticleContent(accessToken, article.media_id);
                    const collectedItem = {
                        platform: data_collection_interface_1.PlatformType.WECHAT,
                        sourceId: article.media_id,
                        url: article.url || `https://mp.weixin.qq.com/s/${article.media_id}`,
                        title: article.title || '无标题',
                        content: content,
                        author: article.author || officialAccountId,
                        publishDate: new Date(article.update_time * 1000),
                        collectedAt: new Date(),
                        metadata: {
                            likes: article.like_num,
                            shares: article.share_num,
                            comments: article.comment_num,
                            views: article.read_num,
                            mediaUrls: article.thumb_url ? [article.thumb_url] : [],
                            rawData: article,
                        },
                        status: data_collection_interface_1.DataStatus.RAW,
                        qualityScore: this.calculateQualityScore(article),
                    };
                    results.push(collectedItem);
                }
                catch (error) {
                    this.logger.warn(`解析文章 ${article.media_id} 失败: ${error.message}`);
                }
            }
            return results;
        }
        catch (error) {
            const axiosError = error;
            if (axiosError.response?.data) {
                this.logger.error(`微信API错误: ${JSON.stringify(axiosError.response.data)}`);
            }
            throw error;
        }
    }
    async fetchArticleContent(accessToken, mediaId) {
        const url = `${this.apiBaseUrl}/cgi-bin/material/get_material`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
                media_id: mediaId,
            }, {
                params: { access_token: accessToken },
                responseType: 'json',
            }));
            const content = response.data.content || '';
            const textContent = content
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            return textContent || '内容为空';
        }
        catch (error) {
            this.logger.warn(`获取文章内容失败 ${mediaId}: ${error.message}`);
            return '内容获取失败';
        }
    }
    calculateQualityScore(article) {
        let score = 50;
        if (article.title && article.title.length > 10)
            score += 10;
        if (article.author)
            score += 5;
        if (article.update_time)
            score += 5;
        if (article.read_num > 100)
            score += 10;
        if (article.like_num > 10)
            score += 10;
        if (article.share_num > 5)
            score += 10;
        return Math.min(100, score);
    }
    async testConnection(credentials) {
        try {
            const accessToken = await this.getAccessToken(credentials);
            return {
                success: true,
                message: '微信API连接成功',
                data: { accessToken: accessToken.substring(0, 10) + '...' },
            };
        }
        catch (error) {
            return {
                success: false,
                message: `微信API连接失败: ${error.message}`,
            };
        }
    }
    async getApiUsage(credentials) {
        return {
            dailyLimit: 1000,
            remaining: 950,
            resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
    }
};
exports.WeChatCollectorService = WeChatCollectorService;
exports.WeChatCollectorService = WeChatCollectorService = WeChatCollectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], WeChatCollectorService);
//# sourceMappingURL=wechat-collector.service.js.map
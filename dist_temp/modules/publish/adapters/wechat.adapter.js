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
var WechatAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatAdapter = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const platform_adapter_interface_1 = require("../interfaces/platform-adapter.interface");
let WechatAdapter = WechatAdapter_1 = class WechatAdapter {
    logger = new common_1.Logger(WechatAdapter_1.name);
    http;
    credentials;
    config;
    accessToken = '';
    accessTokenExpiresAt = new Date(0);
    constructor(config) {
        if (config.type !== platform_adapter_interface_1.PlatformType.WECHAT) {
            throw new Error(`Invalid platform type for WechatAdapter: ${config.type}`);
        }
        this.config = config;
        this.credentials = config.credentials;
        this.http = axios_1.default.create({
            baseURL: 'https://api.weixin.qq.com/cgi-bin/',
            timeout: config.options?.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                ...config.options?.customHeaders,
            },
        });
        this.http.interceptors.request.use(async (config) => {
            if (config.url && !config.url.includes('token')) {
                const token = await this.getAccessToken();
                config.params = {
                    ...config.params,
                    access_token: token,
                };
            }
            return config;
        });
        this.http.interceptors.response.use((response) => {
            const data = response.data;
            if (data.errcode && data.errcode !== 0) {
                throw new Error(`WeChat API error: ${data.errmsg} (code: ${data.errcode})`);
            }
            return response;
        }, (error) => {
            this.logger.error(`WeChat API request failed: ${error.message}`, error.stack);
            throw error;
        });
    }
    getPlatformName() {
        return `微信公众号 - ${this.credentials.wechatName || this.credentials.wechatId}`;
    }
    getPlatformType() {
        return platform_adapter_interface_1.PlatformType.WECHAT;
    }
    async initialize() {
        this.logger.log(`Initializing WeChat adapter for: ${this.credentials.wechatId}`);
        await this.getAccessToken();
        this.logger.log('WeChat adapter initialized successfully');
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            await this.getAccessToken();
            const latency = Date.now() - startTime;
            return {
                status: 'healthy',
                message: 'WeChat API is accessible',
                lastChecked: new Date(),
                metrics: {
                    availability: 100,
                    latency,
                    successRate: 100,
                    quotaUsed: 0,
                    quotaRemaining: 1000,
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: `WeChat API health check failed: ${error.message}`,
                lastChecked: new Date(),
                metrics: {
                    availability: 0,
                    latency: 0,
                    successRate: 0,
                    quotaUsed: 0,
                    quotaRemaining: 0,
                },
            };
        }
    }
    async publishContent(content) {
        this.logger.log(`Publishing content to WeChat: ${content.title}`);
        try {
            const imageMediaIds = [];
            if (content.coverImages && content.coverImages.length > 0) {
                for (const imageUrl of content.coverImages.slice(0, 3)) {
                    const mediaId = await this.uploadImage(imageUrl);
                    imageMediaIds.push(mediaId);
                }
            }
            const articles = [
                {
                    title: content.title,
                    thumb_media_id: imageMediaIds[0],
                    author: content.metadata?.author || '灵曜智媒',
                    digest: content.summary || content.content.substring(0, 100),
                    content: this.formatWechatContent(content.content),
                    content_source_url: content.externalLinks?.[0]?.url || '',
                    show_cover_pic: 1,
                    need_open_comment: content.metadata?.enableComment ? 1 : 0,
                    only_fans_can_comment: content.metadata?.onlyFansComment ? 1 : 0,
                },
            ];
            const response = await this.http.post('/material/add_news', { articles });
            const mediaId = response.data.media_id;
            let publishResult;
            if (content.publishAt && content.publishAt > new Date()) {
                publishResult = await this.schedulePublish(mediaId, content.publishAt);
            }
            else {
                publishResult = await this.publishNow(mediaId);
            }
            return {
                publishId: publishResult.publishId || mediaId,
                platform: platform_adapter_interface_1.PlatformType.WECHAT,
                status: platform_adapter_interface_1.PublishStatusType.PUBLISHED,
                url: publishResult.url,
                rawResponse: publishResult.rawResponse,
                publishedAt: new Date(),
                metadata: {
                    mediaId,
                    imageMediaIds,
                    articleCount: articles.length,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to publish content to WeChat: ${error.message}`, error.stack);
            return {
                publishId: `error_${Date.now()}`,
                platform: platform_adapter_interface_1.PlatformType.WECHAT,
                status: platform_adapter_interface_1.PublishStatusType.FAILED,
                error: error.message,
                publishedAt: new Date(),
            };
        }
    }
    async getPublishStatus(publishId) {
        return {
            publishId,
            status: platform_adapter_interface_1.PublishStatusType.PUBLISHED,
            lastUpdated: new Date(),
        };
    }
    async updateContent(publishId, content) {
        this.logger.warn('WeChat does not support content update. Need to republish.');
        throw new Error('WeChat does not support content update. Use delete and republish instead.');
    }
    async deleteContent(publishId) {
        try {
            await this.http.post('/material/del_material', {
                media_id: publishId,
            });
            this.logger.log(`Deleted WeChat content: ${publishId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete WeChat content: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPlatformStats() {
        try {
            const response = await this.http.get('/user/get');
            const userStats = response.data;
            return {
                platform: platform_adapter_interface_1.PlatformType.WECHAT,
                totalPublished: 0,
                totalFailed: 0,
                totalScheduled: 0,
                averagePublishTime: 0,
                successRate: 100,
                lastPublishAt: new Date(),
                quotaInfo: {
                    dailyLimit: 1000,
                    usedToday: 0,
                    remainingToday: 1000,
                    resetAt: this.getNextMidnight(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get WeChat platform stats: ${error.message}`);
            return {
                platform: platform_adapter_interface_1.PlatformType.WECHAT,
                totalPublished: 0,
                totalFailed: 0,
                totalScheduled: 0,
                averagePublishTime: 0,
                successRate: 0,
                quotaInfo: {
                    dailyLimit: 1000,
                    usedToday: 0,
                    remainingToday: 1000,
                    resetAt: this.getNextMidnight(),
                },
            };
        }
    }
    async cleanup() {
        this.logger.log('Cleaning up WeChat adapter resources');
    }
    async getAccessToken() {
        if (this.accessToken && this.accessTokenExpiresAt > new Date()) {
            return this.accessToken;
        }
        this.logger.log('Refreshing WeChat access token');
        const response = await this.http.get('/token', {
            params: {
                grant_type: 'client_credential',
                appid: this.credentials.appId,
                secret: this.credentials.appSecret,
            },
        });
        this.accessToken = response.data.access_token;
        const expiresIn = response.data.expires_in || 7200;
        this.accessTokenExpiresAt = new Date(Date.now() + (expiresIn - 300) * 1000);
        this.credentials.accessToken = this.accessToken;
        this.credentials.accessTokenExpiresAt = this.accessTokenExpiresAt;
        this.logger.log(`WeChat access token refreshed, expires at: ${this.accessTokenExpiresAt}`);
        return this.accessToken;
    }
    async uploadImage(imageUrl) {
        try {
            const imageResponse = await axios_1.default.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000,
            });
            const formData = new form_data_1.default();
            formData.append('media', Buffer.from(imageResponse.data), {
                filename: `image_${Date.now()}.jpg`,
                contentType: imageResponse.headers['content-type'] || 'image/jpeg',
            });
            const response = await this.http.post('/material/add_material', formData, {
                headers: formData.getHeaders(),
                params: {
                    type: 'image',
                },
            });
            return response.data.media_id;
        }
        catch (error) {
            this.logger.error(`Failed to upload image to WeChat: ${error.message}`, error.stack);
            throw new Error(`Image upload failed: ${error.message}`);
        }
    }
    formatWechatContent(content) {
        let formatted = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<img([^>]+)>/g, '<img$1 />')
            .replace(/<br\s*\/?>/gi, '<br/>');
        if (formatted.length > 20000) {
            formatted = formatted.substring(0, 20000) + '...';
        }
        return formatted;
    }
    async publishNow(mediaId) {
        const response = await this.http.post('/message/mass/sendall', {
            filter: {
                is_to_all: true,
            },
            mpnews: {
                media_id: mediaId,
            },
            msgtype: 'mpnews',
        });
        return {
            publishId: mediaId,
            rawResponse: response.data,
        };
    }
    async schedulePublish(mediaId, publishAt) {
        const response = await this.http.post('/message/mass/send', {
            touser: [],
            mpnews: {
                media_id: mediaId,
            },
            msgtype: 'mpnews',
            send_ignore_reprint: 0,
            clientmsgid: `schedule_${Date.now()}`,
        });
        return {
            publishId: mediaId,
            rawResponse: response.data,
        };
    }
    getNextMidnight() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    }
    async getUsers(nextOpenId) {
        const response = await this.http.get('/user/get', {
            params: nextOpenId ? { next_openid: nextOpenId } : {},
        });
        return response.data;
    }
    async getMaterials(type, offset = 0, count = 20) {
        const response = await this.http.post('/material/batchget_material', {
            type,
            offset,
            count,
        });
        return response.data;
    }
};
exports.WechatAdapter = WechatAdapter;
exports.WechatAdapter = WechatAdapter = WechatAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], WechatAdapter);
//# sourceMappingURL=wechat.adapter.js.map
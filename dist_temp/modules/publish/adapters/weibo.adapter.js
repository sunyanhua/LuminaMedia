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
var WeiboAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeiboAdapter = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const platform_adapter_interface_1 = require("../interfaces/platform-adapter.interface");
let WeiboAdapter = WeiboAdapter_1 = class WeiboAdapter {
    logger = new common_1.Logger(WeiboAdapter_1.name);
    http;
    credentials;
    config;
    accessToken = '';
    refreshToken = '';
    constructor(config) {
        if (config.type !== platform_adapter_interface_1.PlatformType.WEIBO) {
            throw new Error(`Invalid platform type for WeiboAdapter: ${config.type}`);
        }
        this.config = config;
        this.credentials = config.credentials;
        this.http = axios_1.default.create({
            baseURL: 'https://api.weibo.com/2/',
            timeout: config.options?.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                ...config.options?.customHeaders,
            },
        });
        this.http.interceptors.request.use((config) => {
            if (this.accessToken && !config.url?.includes('oauth2')) {
                config.params = {
                    ...config.params,
                    access_token: this.accessToken,
                };
            }
            return config;
        });
        this.http.interceptors.response.use((response) => {
            const data = response.data;
            if (data.error_code && data.error_code !== 0) {
                throw new Error(`Weibo API error: ${data.error} (code: ${data.error_code})`);
            }
            return response;
        }, (error) => {
            this.logger.error(`Weibo API request failed: ${error.message}`, error.stack);
            if (error.response?.data?.error_code === 21332) {
                this.logger.warn('Weibo access token expired, attempting refresh...');
            }
            throw error;
        });
        if (this.credentials.accessToken) {
            this.accessToken = this.credentials.accessToken;
        }
        if (this.credentials.refreshToken) {
            this.refreshToken = this.credentials.refreshToken;
        }
    }
    getPlatformName() {
        return `微博 - ${this.credentials.screenName || this.credentials.uid || '未登录'}`;
    }
    getPlatformType() {
        return platform_adapter_interface_1.PlatformType.WEIBO;
    }
    async initialize() {
        this.logger.log(`Initializing Weibo adapter for: ${this.credentials.uid || 'unknown user'}`);
        if (this.accessToken) {
            try {
                await this.verifyCredentials();
                this.logger.log('Weibo adapter initialized with existing token');
            }
            catch (error) {
                this.logger.warn(`Existing token invalid: ${error.message}, attempting refresh...`);
                if (this.refreshToken) {
                    await this.refreshAccessToken();
                }
                else {
                    throw new Error('No valid access token and no refresh token available');
                }
            }
        }
        else if (this.refreshToken) {
            await this.refreshAccessToken();
        }
        else {
            this.logger.warn('No credentials provided for Weibo, adapter will operate in limited mode');
        }
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            await this.verifyCredentials();
            const latency = Date.now() - startTime;
            return {
                status: 'healthy',
                message: 'Weibo API is accessible and token is valid',
                lastChecked: new Date(),
                metrics: {
                    availability: 100,
                    latency,
                    successRate: 95,
                    quotaUsed: 0,
                    quotaRemaining: 1000,
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: `Weibo API health check failed: ${error.message}`,
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
        this.logger.log(`Publishing content to Weibo: ${content.title}`);
        if (!this.accessToken) {
            throw new Error('Weibo adapter is not authenticated. Please provide valid credentials.');
        }
        try {
            let result;
            if (content.videoUrl) {
                result = await this.publishVideo(content);
            }
            else if (content.coverImages && content.coverImages.length > 0) {
                result = await this.publishWithImages(content);
            }
            else {
                result = await this.publishText(content);
            }
            return {
                publishId: result.idstr || result.id.toString(),
                platform: platform_adapter_interface_1.PlatformType.WEIBO,
                status: platform_adapter_interface_1.PublishStatusType.PUBLISHED,
                url: result.url ||
                    `https://weibo.com/${result.user?.idstr}/status/${result.idstr}`,
                rawResponse: result,
                publishedAt: new Date(result.created_at || Date.now()),
                metadata: {
                    weiboId: result.id,
                    userId: result.user?.id,
                    repostsCount: result.reposts_count || 0,
                    commentsCount: result.comments_count || 0,
                    attitudesCount: result.attitudes_count || 0,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to publish content to Weibo: ${error.message}`, error.stack);
            const maxRetries = this.config.options?.maxRetries || 2;
            for (let retry = 1; retry <= maxRetries; retry++) {
                try {
                    this.logger.log(`Retrying Weibo publish (attempt ${retry}/${maxRetries})`);
                    await this.delay(5000);
                    let retryResult;
                    if (content.videoUrl) {
                        retryResult = await this.publishVideo(content);
                    }
                    else if (content.coverImages && content.coverImages.length > 0) {
                        retryResult = await this.publishWithImages(content);
                    }
                    else {
                        retryResult = await this.publishText(content);
                    }
                    return {
                        publishId: retryResult.idstr || retryResult.id.toString(),
                        platform: platform_adapter_interface_1.PlatformType.WEIBO,
                        status: platform_adapter_interface_1.PublishStatusType.PUBLISHED,
                        url: retryResult.url ||
                            `https://weibo.com/${retryResult.user?.idstr}/status/${retryResult.idstr}`,
                        rawResponse: retryResult,
                        publishedAt: new Date(retryResult.created_at || Date.now()),
                        metadata: {
                            weiboId: retryResult.id,
                            retryCount: retry,
                        },
                    };
                }
                catch (retryError) {
                    if (retry === maxRetries) {
                        return {
                            publishId: `error_${Date.now()}`,
                            platform: platform_adapter_interface_1.PlatformType.WEIBO,
                            status: platform_adapter_interface_1.PublishStatusType.FAILED,
                            error: `Failed after ${maxRetries} retries: ${retryError.message}`,
                            publishedAt: new Date(),
                            metadata: {
                                retryCount: retry,
                            },
                        };
                    }
                }
            }
            return {
                publishId: `error_${Date.now()}`,
                platform: platform_adapter_interface_1.PlatformType.WEIBO,
                status: platform_adapter_interface_1.PublishStatusType.FAILED,
                error: error.message,
                publishedAt: new Date(),
            };
        }
    }
    async getPublishStatus(publishId) {
        try {
            const response = await this.http.get('/statuses/show.json', {
                params: {
                    id: publishId,
                },
            });
            const weibo = response.data;
            return {
                publishId,
                status: weibo.deleted
                    ? platform_adapter_interface_1.PublishStatusType.DELETED
                    : platform_adapter_interface_1.PublishStatusType.PUBLISHED,
                progress: 100,
                message: weibo.deleted
                    ? 'Weibo has been deleted'
                    : 'Weibo is published',
                lastUpdated: new Date(weibo.created_at || Date.now()),
            };
        }
        catch (error) {
            if (error.response?.data?.error_code === 20101) {
                return {
                    publishId,
                    status: platform_adapter_interface_1.PublishStatusType.DELETED,
                    message: 'Weibo does not exist or has been deleted',
                    lastUpdated: new Date(),
                };
            }
            return {
                publishId,
                status: platform_adapter_interface_1.PublishStatusType.FAILED,
                message: `Failed to get publish status: ${error.message}`,
                lastUpdated: new Date(),
            };
        }
    }
    async updateContent(publishId, content) {
        this.logger.warn('Weibo does not support content update. Need to delete and republish.');
        throw new Error('Weibo does not support content update. Use delete and republish instead.');
    }
    async deleteContent(publishId) {
        try {
            await this.http.post('/statuses/destroy.json', {
                id: publishId,
            });
            this.logger.log(`Deleted Weibo: ${publishId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete Weibo: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPlatformStats() {
        try {
            const userResponse = await this.http.get('/users/show.json', {
                params: {
                    uid: this.credentials.uid,
                },
            });
            const user = userResponse.data;
            return {
                platform: platform_adapter_interface_1.PlatformType.WEIBO,
                totalPublished: user.statuses_count || 0,
                totalFailed: 0,
                totalScheduled: 0,
                averagePublishTime: 5000,
                successRate: 95,
                lastPublishAt: new Date(user.created_at || Date.now()),
                quotaInfo: {
                    dailyLimit: 1000,
                    usedToday: 0,
                    remainingToday: 1000,
                    resetAt: this.getNextMidnight(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get Weibo platform stats: ${error.message}`);
            return {
                platform: platform_adapter_interface_1.PlatformType.WEIBO,
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
        this.logger.log('Cleaning up Weibo adapter resources');
    }
    async verifyCredentials() {
        const response = await this.http.get('/account/get_uid.json');
        if (!response.data.uid) {
            throw new Error('Invalid access token');
        }
        if (!this.credentials.uid) {
            this.credentials.uid = response.data.uid;
        }
    }
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        this.logger.log('Refreshing Weibo access token');
        const response = await axios_1.default.post('https://api.weibo.com/oauth2/access_token', null, {
            params: {
                client_id: this.credentials.appKey,
                client_secret: this.credentials.appSecret,
                grant_type: 'refresh_token',
                refresh_token: this.refreshToken,
            },
        });
        this.accessToken = response.data.access_token;
        this.refreshToken = response.data.refresh_token;
        const expiresIn = response.data.expires_in || 86400;
        this.credentials.accessToken = this.accessToken;
        this.credentials.refreshToken = this.refreshToken;
        this.logger.log('Weibo access token refreshed successfully');
    }
    async publishText(content) {
        const status = this.formatWeiboContent(content.content, content.title, content.tags);
        const response = await this.http.post('/statuses/share.json', {
            status,
            visible: content.metadata?.visible || 0,
            list_id: content.metadata?.list_id,
            lat: content.location?.latitude,
            long: content.location?.longitude,
            annotations: content.metadata?.annotations,
            rip: content.metadata?.rip,
        });
        return response.data;
    }
    async publishWithImages(content) {
        const status = this.formatWeiboContent(content.content, content.title, content.tags);
        const images = content.coverImages?.slice(0, 9) || [];
        if (images.length === 1) {
            const imageData = await this.downloadImage(images[0]);
            const formData = new form_data_1.default();
            formData.append('pic', imageData, {
                filename: `weibo_${Date.now()}.jpg`,
                contentType: 'image/jpeg',
            });
            formData.append('status', status);
            const response = await this.http.post('/statuses/upload.json', formData, {
                headers: formData.getHeaders(),
            });
            return response.data;
        }
        else if (images.length > 1) {
            const picIds = [];
            for (const imageUrl of images) {
                const picId = await this.uploadImage(imageUrl);
                picIds.push(picId);
            }
            const response = await this.http.post('/statuses/upload.json', {
                status,
                pic_id: picIds.join(','),
            });
            return response.data;
        }
        else {
            return this.publishText(content);
        }
    }
    async publishVideo(content) {
        if (!content.videoUrl) {
            throw new Error('Video URL is required for video weibo');
        }
        const status = this.formatWeiboContent(content.content, content.title, content.tags);
        const response = await this.http.post('/statuses/upload_url_text.json', {
            status,
            url: content.videoUrl,
        });
        return response.data;
    }
    formatWeiboContent(content, title, tags) {
        let formatted = '';
        if (title && title.length > 0) {
            formatted += `${title}\n\n`;
        }
        formatted += content;
        if (tags && tags.length > 0) {
            const weiboTags = tags
                .map((tag) => `#${tag.replace(/#/g, '')}#`)
                .join(' ');
            formatted += `\n\n${weiboTags}`;
        }
        if (formatted.length > 280) {
            formatted = formatted.substring(0, 280) + '...';
        }
        return formatted;
    }
    async downloadImage(imageUrl) {
        const response = await axios_1.default.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
        });
        return Buffer.from(response.data);
    }
    async uploadImage(imageUrl) {
        const imageData = await this.downloadImage(imageUrl);
        const formData = new form_data_1.default();
        formData.append('pic', imageData, {
            filename: `weibo_${Date.now()}.jpg`,
            contentType: 'image/jpeg',
        });
        const response = await this.http.post('/statuses/upload_pic.json', formData, {
            headers: formData.getHeaders(),
        });
        return response.data.pic_id;
    }
    getNextMidnight() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async getUserTimeline(page = 1, count = 20) {
        const response = await this.http.get('/statuses/user_timeline.json', {
            params: {
                page,
                count,
            },
        });
        return response.data;
    }
    async getMentions(page = 1, count = 20) {
        const response = await this.http.get('/statuses/mentions.json', {
            params: {
                page,
                count,
            },
        });
        return response.data;
    }
};
exports.WeiboAdapter = WeiboAdapter;
exports.WeiboAdapter = WeiboAdapter = WeiboAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], WeiboAdapter);
//# sourceMappingURL=weibo.adapter.js.map
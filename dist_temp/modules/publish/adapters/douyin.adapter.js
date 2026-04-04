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
var DouyinAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DouyinAdapter = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const platform_adapter_interface_1 = require("../interfaces/platform-adapter.interface");
let DouyinAdapter = DouyinAdapter_1 = class DouyinAdapter {
    logger = new common_1.Logger(DouyinAdapter_1.name);
    http;
    credentials;
    config;
    accessToken = '';
    refreshToken = '';
    openId = '';
    constructor(config) {
        if (config.type !== platform_adapter_interface_1.PlatformType.DOUYIN) {
            throw new Error(`Invalid platform type for DouyinAdapter: ${config.type}`);
        }
        this.config = config;
        this.credentials = config.credentials;
        this.http = axios_1.default.create({
            baseURL: 'https://open.douyin.com/',
            timeout: config.options?.timeout || 60000,
            headers: {
                'Content-Type': 'application/json',
                'access-token': this.credentials.accessToken || '',
                ...config.options?.customHeaders,
            },
        });
        this.http.interceptors.request.use((config) => {
            if (this.accessToken && !config.url?.includes('oauth')) {
                config.headers['access-token'] = this.accessToken;
            }
            return config;
        });
        this.http.interceptors.response.use((response) => {
            const data = response.data;
            if (data.data?.error_code && data.data.error_code !== 0) {
                throw new Error(`Douyin API error: ${data.data.description} (code: ${data.data.error_code})`);
            }
            return response;
        }, (error) => {
            this.logger.error(`Douyin API request failed: ${error.message}`, error.stack);
            if (error.response?.data?.data?.error_code === 2190008) {
                this.logger.warn('Douyin access token expired, attempting refresh...');
            }
            throw error;
        });
        if (this.credentials.accessToken) {
            this.accessToken = this.credentials.accessToken;
        }
        if (this.credentials.refreshToken) {
            this.refreshToken = this.credentials.refreshToken;
        }
        if (this.credentials.openId) {
            this.openId = this.credentials.openId;
        }
    }
    getPlatformName() {
        return `抖音 - ${this.openId || '未登录'}`;
    }
    getPlatformType() {
        return platform_adapter_interface_1.PlatformType.DOUYIN;
    }
    async initialize() {
        this.logger.log(`Initializing Douyin adapter for: ${this.openId || 'unknown user'}`);
        if (this.accessToken && this.openId) {
            try {
                await this.verifyCredentials();
                this.logger.log('Douyin adapter initialized with existing token');
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
            this.logger.warn('No credentials provided for Douyin, adapter will operate in limited mode');
        }
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            await this.verifyCredentials();
            const latency = Date.now() - startTime;
            return {
                status: 'healthy',
                message: 'Douyin API is accessible and token is valid',
                lastChecked: new Date(),
                metrics: {
                    availability: 100,
                    latency,
                    successRate: 90,
                    quotaUsed: 0,
                    quotaRemaining: 100,
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: `Douyin API health check failed: ${error.message}`,
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
        this.logger.log(`Publishing content to Douyin: ${content.title}`);
        if (!this.accessToken || !this.openId) {
            throw new Error('Douyin adapter is not authenticated. Please provide valid credentials.');
        }
        try {
            let result;
            if (content.videoUrl) {
                result = await this.publishVideo(content);
            }
            else if (content.coverImages && content.coverImages.length > 0) {
                result = await this.publishImages(content);
            }
            else {
                result = await this.publishImages(content);
            }
            return {
                publishId: result.item_id || result.video_id || `douyin_${Date.now()}`,
                platform: platform_adapter_interface_1.PlatformType.DOUYIN,
                status: result.share_id
                    ? platform_adapter_interface_1.PublishStatusType.PUBLISHED
                    : platform_adapter_interface_1.PublishStatusType.PENDING,
                url: result.share_url || `https://www.douyin.com/video/${result.item_id}`,
                rawResponse: result,
                publishedAt: new Date(),
                metadata: {
                    itemId: result.item_id,
                    videoId: result.video_id,
                    shareId: result.share_id,
                    openId: this.openId,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to publish content to Douyin: ${error.message}`, error.stack);
            const maxRetries = Math.min(this.config.options?.maxRetries || 1, 2);
            for (let retry = 1; retry <= maxRetries; retry++) {
                try {
                    this.logger.log(`Retrying Douyin publish (attempt ${retry}/${maxRetries})`);
                    await this.delay(10000);
                    let retryResult;
                    if (content.videoUrl) {
                        retryResult = await this.publishVideo(content);
                    }
                    else {
                        retryResult = await this.publishImages(content);
                    }
                    return {
                        publishId: retryResult.item_id ||
                            retryResult.video_id ||
                            `douyin_${Date.now()}`,
                        platform: platform_adapter_interface_1.PlatformType.DOUYIN,
                        status: retryResult.share_id
                            ? platform_adapter_interface_1.PublishStatusType.PUBLISHED
                            : platform_adapter_interface_1.PublishStatusType.PENDING,
                        url: retryResult.share_url ||
                            `https://www.douyin.com/video/${retryResult.item_id}`,
                        rawResponse: retryResult,
                        publishedAt: new Date(),
                        metadata: {
                            retryCount: retry,
                        },
                    };
                }
                catch (retryError) {
                    if (retry === maxRetries) {
                        return {
                            publishId: `error_${Date.now()}`,
                            platform: platform_adapter_interface_1.PlatformType.DOUYIN,
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
                platform: platform_adapter_interface_1.PlatformType.DOUYIN,
                status: platform_adapter_interface_1.PublishStatusType.FAILED,
                error: error.message,
                publishedAt: new Date(),
            };
        }
    }
    async getPublishStatus(publishId) {
        try {
            const response = await this.http.post('/api/douyin/v1/video/video_data/', {
                item_ids: [publishId],
            });
            const videoData = response.data.data?.list?.[0];
            if (!videoData) {
                return {
                    publishId,
                    status: platform_adapter_interface_1.PublishStatusType.FAILED,
                    message: 'Video not found',
                    lastUpdated: new Date(),
                };
            }
            const status = videoData.video_status === 1
                ? platform_adapter_interface_1.PublishStatusType.PUBLISHED
                : videoData.video_status === 2
                    ? platform_adapter_interface_1.PublishStatusType.PENDING
                    : videoData.video_status === 3
                        ? platform_adapter_interface_1.PublishStatusType.FAILED
                        : platform_adapter_interface_1.PublishStatusType.PENDING;
            return {
                publishId,
                status,
                progress: videoData.video_progress ||
                    (status === platform_adapter_interface_1.PublishStatusType.PUBLISHED ? 100 : 0),
                message: this.getDouyinStatusMessage(videoData.video_status),
                lastUpdated: new Date(),
            };
        }
        catch (error) {
            return {
                publishId,
                status: platform_adapter_interface_1.PublishStatusType.FAILED,
                message: `Failed to get publish status: ${error.message}`,
                lastUpdated: new Date(),
            };
        }
    }
    async updateContent(publishId, content) {
        this.logger.warn('Douyin does not support content update. Need to delete and republish.');
        throw new Error('Douyin does not support content update. Use delete and republish instead.');
    }
    async deleteContent(publishId) {
        try {
            await this.http.post('/api/douyin/v1/video/delete/', {
                item_id: publishId,
            });
            this.logger.log(`Deleted Douyin video: ${publishId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete Douyin video: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPlatformStats() {
        try {
            const response = await this.http.post('/api/douyin/v1/user/user_info/', {
                open_id: this.openId,
            });
            const userInfo = response.data.data;
            return {
                platform: platform_adapter_interface_1.PlatformType.DOUYIN,
                totalPublished: userInfo.video_count || 0,
                totalFailed: 0,
                totalScheduled: 0,
                averagePublishTime: 60000,
                successRate: 85,
                lastPublishAt: new Date(),
                quotaInfo: {
                    dailyLimit: 50,
                    usedToday: 0,
                    remainingToday: 50,
                    resetAt: this.getNextMidnight(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get Douyin platform stats: ${error.message}`);
            return {
                platform: platform_adapter_interface_1.PlatformType.DOUYIN,
                totalPublished: 0,
                totalFailed: 0,
                totalScheduled: 0,
                averagePublishTime: 0,
                successRate: 0,
                quotaInfo: {
                    dailyLimit: 50,
                    usedToday: 0,
                    remainingToday: 50,
                    resetAt: this.getNextMidnight(),
                },
            };
        }
    }
    async cleanup() {
        this.logger.log('Cleaning up Douyin adapter resources');
    }
    async verifyCredentials() {
        const response = await this.http.post('/oauth/userinfo/', {
            open_id: this.openId,
        });
        if (!response.data.data?.open_id) {
            throw new Error('Invalid access token or open_id');
        }
        if (!this.openId) {
            this.openId = response.data.data.open_id;
            this.credentials.openId = this.openId;
        }
    }
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        this.logger.log('Refreshing Douyin access token');
        const response = await axios_1.default.post('https://open.douyin.com/oauth/refresh_token/', null, {
            params: {
                client_key: this.credentials.clientKey,
                client_secret: this.credentials.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: this.refreshToken,
            },
        });
        const data = response.data.data;
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.openId = data.open_id;
        const expiresIn = data.expires_in || 86400;
        this.credentials.accessToken = this.accessToken;
        this.credentials.refreshToken = this.refreshToken;
        this.credentials.openId = this.openId;
        this.http.defaults.headers['access-token'] = this.accessToken;
        this.logger.log(`Douyin access token refreshed for open_id: ${this.openId}`);
    }
    async publishVideo(content) {
        if (!content.videoUrl) {
            throw new Error('Video URL is required for Douyin video publish');
        }
        const createResponse = await this.http.post('/api/douyin/v1/video/create/', {
            open_id: this.openId,
            text: this.formatDouyinText(content.content, content.title, content.tags),
        });
        const videoId = createResponse.data.data?.video_id;
        if (!videoId) {
            throw new Error('Failed to create video: ' + JSON.stringify(createResponse.data));
        }
        const videoData = await this.downloadVideo(content.videoUrl);
        const uploadResult = await this.uploadVideo(videoId, videoData);
        const publishResponse = await this.http.post('/api/douyin/v1/video/publish/', {
            open_id: this.openId,
            video_id: videoId,
        });
        return {
            ...publishResponse.data.data,
            video_id: videoId,
            upload_info: uploadResult,
        };
    }
    async publishImages(content) {
        const images = content.coverImages?.slice(0, 9) || [];
        if (images.length === 0) {
            images.push('https://via.placeholder.com/1080x1920?text=Douyin+Content');
        }
        const imageIds = [];
        for (const imageUrl of images) {
            const imageId = await this.uploadImage(imageUrl);
            imageIds.push(imageId);
        }
        const response = await this.http.post('/api/douyin/v1/image/publish/', {
            open_id: this.openId,
            text: this.formatDouyinText(content.content, content.title, content.tags),
            image_ids: imageIds,
            at_users: content.mentions || [],
            poi_id: content.metadata?.poi_id,
            micro_app_id: content.metadata?.micro_app_id,
            micro_app_title: content.metadata?.micro_app_title,
            micro_app_url: content.metadata?.micro_app_url,
        });
        return response.data.data;
    }
    formatDouyinText(content, title, tags) {
        let formatted = '';
        if (title && title.length > 0) {
            formatted += `${title}\n\n`;
        }
        formatted += content;
        if (tags && tags.length > 0) {
            const douyinTags = tags
                .map((tag) => `#${tag.replace(/#/g, '')}`)
                .join(' ');
            formatted += `\n\n${douyinTags}`;
        }
        if (formatted.length > 1000) {
            formatted = formatted.substring(0, 1000) + '...';
        }
        return formatted;
    }
    async downloadVideo(videoUrl) {
        const response = await axios_1.default.get(videoUrl, {
            responseType: 'arraybuffer',
            timeout: 120000,
            maxContentLength: 100 * 1024 * 1024,
        });
        return Buffer.from(response.data);
    }
    async uploadVideo(videoId, videoData) {
        const formData = new form_data_1.default();
        formData.append('video', videoData, {
            filename: `douyin_${Date.now()}.mp4`,
            contentType: 'video/mp4',
        });
        const response = await this.http.post(`/api/douyin/v1/video/upload/${videoId}`, formData, {
            headers: {
                ...formData.getHeaders(),
                'access-token': this.accessToken,
            },
        });
        return response.data;
    }
    async uploadImage(imageUrl) {
        const imageData = await this.downloadImage(imageUrl);
        const formData = new form_data_1.default();
        formData.append('image', imageData, {
            filename: `douyin_${Date.now()}.jpg`,
            contentType: 'image/jpeg',
        });
        const response = await this.http.post('/api/douyin/v1/image/upload/', formData, {
            headers: {
                ...formData.getHeaders(),
                'access-token': this.accessToken,
            },
        });
        return response.data.data?.image_id;
    }
    async downloadImage(imageUrl) {
        const response = await axios_1.default.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
        });
        return Buffer.from(response.data);
    }
    getDouyinStatusMessage(status) {
        const statusMap = {
            1: '视频已发布',
            2: '视频处理中',
            3: '视频发布失败',
            4: '视频审核中',
            5: '视频审核不通过',
        };
        return statusMap[status] || '未知状态';
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
    async getUserVideos(cursor = 0, count = 20) {
        const response = await this.http.post('/api/douyin/v1/video/list/', {
            open_id: this.openId,
            cursor,
            count,
        });
        return response.data;
    }
    async getUserFollowers(cursor = 0, count = 20) {
        const response = await this.http.post('/api/douyin/v1/user/following/list/', {
            open_id: this.openId,
            cursor,
            count,
        });
        return response.data;
    }
};
exports.DouyinAdapter = DouyinAdapter;
exports.DouyinAdapter = DouyinAdapter = DouyinAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], DouyinAdapter);
//# sourceMappingURL=douyin.adapter.js.map
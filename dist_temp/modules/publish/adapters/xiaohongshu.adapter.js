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
var XHSAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XHSAdapter = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const platform_adapter_interface_1 = require("../interfaces/platform-adapter.interface");
let XHSAdapter = XHSAdapter_1 = class XHSAdapter {
    logger = new common_1.Logger(XHSAdapter_1.name);
    http;
    credentials;
    config;
    browserAgent;
    isLoggedIn = false;
    constructor(config) {
        if (config.type !== platform_adapter_interface_1.PlatformType.XIAOHONGSHU) {
            throw new Error(`Invalid platform type for XHSAdapter: ${config.type}`);
        }
        this.config = config;
        this.credentials = config.credentials;
        this.http = axios_1.default.create({
            baseURL: 'https://www.xiaohongshu.com/',
            timeout: config.options?.timeout || 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Content-Type': 'application/json',
                ...config.options?.customHeaders,
            },
        });
        this.initializeBrowserAgent();
    }
    getPlatformName() {
        return `小红书 - ${this.credentials.username || '未登录'}`;
    }
    getPlatformType() {
        return platform_adapter_interface_1.PlatformType.XIAOHONGSHU;
    }
    async initialize() {
        this.logger.log(`Initializing Xiaohongshu adapter for: ${this.credentials.username}`);
        try {
            if (this.credentials.sessionToken || this.credentials.cookies) {
                await this.loginWithSession();
            }
            else if (this.credentials.username && this.credentials.password) {
                await this.loginWithCredentials();
            }
            else {
                this.logger.warn('No credentials provided for Xiaohongshu, adapter will operate in limited mode');
            }
            this.logger.log('Xiaohongshu adapter initialized successfully');
        }
        catch (error) {
            this.logger.error(`Failed to initialize Xiaohongshu adapter: ${error.message}`, error.stack);
            throw error;
        }
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            await this.http.get('/');
            const networkLatency = Date.now() - startTime;
            const loginStatus = this.isLoggedIn ? 'logged_in' : 'not_logged_in';
            return {
                status: this.isLoggedIn ? 'healthy' : 'degraded',
                message: `Xiaohongshu adapter ${this.isLoggedIn ? 'is logged in' : 'is not logged in'}`,
                lastChecked: new Date(),
                metrics: {
                    availability: 100,
                    latency: networkLatency,
                    successRate: this.isLoggedIn ? 90 : 50,
                    quotaUsed: 0,
                    quotaRemaining: 100,
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: `Xiaohongshu health check failed: ${error.message}`,
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
        this.logger.log(`Publishing content to Xiaohongshu: ${content.title}`);
        if (!this.isLoggedIn) {
            throw new Error('Xiaohongshu adapter is not logged in. Please login first.');
        }
        try {
            const result = await this.publishWithBrowserAgent(content);
            return {
                publishId: result.publishId,
                platform: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                status: platform_adapter_interface_1.PublishStatusType.PUBLISHED,
                url: result.url,
                rawResponse: result.rawResponse,
                publishedAt: new Date(),
                metadata: {
                    noteId: result.noteId,
                    imageCount: content.coverImages?.length || 0,
                    videoPosted: !!content.videoUrl,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to publish content to Xiaohongshu: ${error.message}`, error.stack);
            const maxRetries = this.config.options?.maxRetries || 3;
            for (let retry = 1; retry <= maxRetries; retry++) {
                try {
                    this.logger.log(`Retrying Xiaohongshu publish (attempt ${retry}/${maxRetries})`);
                    const result = await this.publishWithBrowserAgent(content);
                    return {
                        publishId: result.publishId,
                        platform: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                        status: platform_adapter_interface_1.PublishStatusType.PUBLISHED,
                        url: result.url,
                        rawResponse: result.rawResponse,
                        publishedAt: new Date(),
                        metadata: {
                            noteId: result.noteId,
                            retryCount: retry,
                        },
                    };
                }
                catch (retryError) {
                    if (retry === maxRetries) {
                        return {
                            publishId: `error_${Date.now()}`,
                            platform: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                            status: platform_adapter_interface_1.PublishStatusType.FAILED,
                            error: `Failed after ${maxRetries} retries: ${retryError.message}`,
                            publishedAt: new Date(),
                            metadata: {
                                retryCount: retry,
                            },
                        };
                    }
                    await this.delay(this.config.options?.retryDelay || 5000);
                }
            }
            return {
                publishId: `error_${Date.now()}`,
                platform: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
                status: platform_adapter_interface_1.PublishStatusType.FAILED,
                error: error.message,
                publishedAt: new Date(),
            };
        }
    }
    async getPublishStatus(publishId) {
        try {
            const noteUrl = `https://www.xiaohongshu.com/explore/${publishId}`;
            const response = await this.http.get(noteUrl);
            const isPublished = response.status === 200;
            return {
                publishId,
                status: isPublished
                    ? platform_adapter_interface_1.PublishStatusType.PUBLISHED
                    : platform_adapter_interface_1.PublishStatusType.FAILED,
                message: isPublished
                    ? 'Note is published and accessible'
                    : 'Note not found or not accessible',
                lastUpdated: new Date(),
            };
        }
        catch (error) {
            return {
                publishId,
                status: platform_adapter_interface_1.PublishStatusType.FAILED,
                message: `Failed to check publish status: ${error.message}`,
                lastUpdated: new Date(),
            };
        }
    }
    async updateContent(publishId, content) {
        this.logger.warn('Xiaohongshu does not support content update. Need to delete and republish.');
        throw new Error('Xiaohongshu does not support content update. Use delete and republish instead.');
    }
    async deleteContent(publishId) {
        try {
            await this.deleteNoteWithBrowserAgent(publishId);
            this.logger.log(`Deleted Xiaohongshu note: ${publishId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete Xiaohongshu note: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPlatformStats() {
        return {
            platform: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
            totalPublished: 0,
            totalFailed: 0,
            totalScheduled: 0,
            averagePublishTime: 120000,
            successRate: 85,
            lastPublishAt: new Date(),
            quotaInfo: {
                dailyLimit: 10,
                usedToday: 0,
                remainingToday: 10,
                resetAt: this.getNextMidnight(),
            },
        };
    }
    async cleanup() {
        this.logger.log('Cleaning up Xiaohongshu adapter resources');
        if (this.browserAgent) {
            try {
                await this.browserAgent.close();
                this.logger.log('Browser agent closed successfully');
            }
            catch (error) {
                this.logger.error(`Failed to close browser agent: ${error.message}`);
            }
        }
        this.isLoggedIn = false;
    }
    async initializeBrowserAgent() {
        this.browserAgent = {
            isReady: true,
            close: async () => {
                this.logger.log('Mock browser agent closed');
            },
            login: async (credentials) => {
                this.logger.log(`Mock login for: ${credentials.username}`);
                return { success: true, cookies: 'mock_cookie_string' };
            },
            publishNote: async (noteData) => {
                this.logger.log(`Mock publishing note: ${noteData.title}`);
                return {
                    success: true,
                    noteId: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    url: `https://www.xiaohongshu.com/explore/note_${Date.now()}`,
                };
            },
            deleteNote: async (noteId) => {
                this.logger.log(`Mock deleting note: ${noteId}`);
                return { success: true };
            },
        };
    }
    async loginWithSession() {
        try {
            if (this.credentials.cookies) {
                this.http.defaults.headers.Cookie = this.credentials.cookies;
                const response = await this.http.get('/user/profile');
                if (response.status === 200) {
                    this.isLoggedIn = true;
                    this.logger.log('Logged in to Xiaohongshu using cookies');
                    return;
                }
            }
            if (this.credentials.sessionToken) {
                this.isLoggedIn = true;
                this.logger.log('Logged in to Xiaohongshu using session token');
                return;
            }
            throw new Error('No valid session credentials provided');
        }
        catch (error) {
            this.logger.error(`Session login failed: ${error.message}`);
            this.isLoggedIn = false;
            throw error;
        }
    }
    async loginWithCredentials() {
        try {
            if (!this.credentials.username || !this.credentials.password) {
                throw new Error('Username and password are required for credential login');
            }
            const loginResult = await this.browserAgent.login({
                username: this.credentials.username,
                password: this.credentials.password,
            });
            if (loginResult.success) {
                this.isLoggedIn = true;
                this.credentials.cookies = loginResult.cookies;
                this.logger.log('Logged in to Xiaohongshu using credentials');
            }
            else {
                throw new Error('Browser agent login failed');
            }
        }
        catch (error) {
            this.logger.error(`Credential login failed: ${error.message}`);
            this.isLoggedIn = false;
            throw error;
        }
    }
    async publishWithBrowserAgent(content) {
        const noteData = {
            title: content.title,
            content: this.formatXHSContent(content.content),
            images: content.coverImages || [],
            video: content.videoUrl,
            tags: content.tags || [],
            location: content.location?.name,
            publishAt: content.publishAt,
            metadata: content.metadata || {},
        };
        const result = await this.browserAgent.publishNote(noteData);
        if (!result.success) {
            throw new Error('Browser agent failed to publish note');
        }
        return {
            publishId: result.noteId,
            noteId: result.noteId,
            url: result.url,
            rawResponse: result,
        };
    }
    async deleteNoteWithBrowserAgent(noteId) {
        const result = await this.browserAgent.deleteNote(noteId);
        if (!result.success) {
            throw new Error('Browser agent failed to delete note');
        }
    }
    formatXHSContent(content) {
        let formatted = content;
        formatted = formatted.replace(/<[^>]*>/g, '');
        if (formatted.length < 1000) {
            formatted = `📝 ${formatted}\n\n#小红书笔记 #生活分享`;
        }
        if (formatted.length > 1000) {
            formatted = formatted.substring(0, 1000) + '...';
        }
        return formatted;
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
    async getUserProfile() {
        if (!this.isLoggedIn) {
            throw new Error('Not logged in');
        }
        try {
            const response = await this.http.get('/api/sns/web/v1/user/selfinfo');
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get user profile: ${error.message}`);
            throw error;
        }
    }
    async getUserNotes(page = 1, pageSize = 20) {
        if (!this.isLoggedIn) {
            throw new Error('Not logged in');
        }
        try {
            const response = await this.http.get('/api/sns/web/v1/user_posted', {
                params: {
                    page,
                    page_size: pageSize,
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get user notes: ${error.message}`);
            throw error;
        }
    }
};
exports.XHSAdapter = XHSAdapter;
exports.XHSAdapter = XHSAdapter = XHSAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], XHSAdapter);
//# sourceMappingURL=xiaohongshu.adapter.js.map
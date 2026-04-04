"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AccountCredentialService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountCredentialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const social_account_entity_1 = require("../../../entities/social-account.entity");
const platform_adapter_interface_1 = require("../interfaces/platform-adapter.interface");
const account_status_enum_1 = require("../../../shared/enums/account-status.enum");
let AccountCredentialService = AccountCredentialService_1 = class AccountCredentialService {
    accountRepository;
    configService;
    logger = new common_1.Logger(AccountCredentialService_1.name);
    encryptionKey;
    algorithm = 'aes-256-gcm';
    constructor(accountRepository, configService) {
        this.accountRepository = accountRepository;
        this.configService = configService;
        const keyHex = this.configService.get('ENCRYPTION_KEY');
        if (keyHex) {
            this.encryptionKey = Buffer.from(keyHex, 'hex');
            this.logger.log('Encryption key loaded from configuration');
        }
        else {
            this.encryptionKey = crypto.scryptSync('development-key', 'salt', 32);
            this.logger.warn('Using development encryption key - NOT SECURE FOR PRODUCTION');
        }
    }
    async encryptAndStoreCredentials(accountId, platform, credentials, tenantId = 'demo-tenant') {
        try {
            const credentialsJson = JSON.stringify(credentials);
            const encrypted = await this.encrypt(credentialsJson);
            const credentialHash = this.calculateHash(credentialsJson);
            let account = await this.accountRepository.findOne({
                where: { id: accountId, tenantId },
            });
            if (!account) {
                account = this.accountRepository.create({
                    id: accountId,
                    tenantId,
                    platform,
                    accountName: this.getAccountNameFromCredentials(platform, credentials),
                    encryptedCredentials: encrypted,
                    credentialHash,
                    platformUserId: this.getPlatformUserId(platform, credentials),
                    platformUserName: this.getPlatformUserName(platform, credentials),
                    isEnabled: true,
                    status: account_status_enum_1.AccountStatus.ACTIVE,
                });
            }
            else {
                account.encryptedCredentials = encrypted;
                account.credentialHash = credentialHash;
                account.platformUserId = this.getPlatformUserId(platform, credentials);
                account.platformUserName = this.getPlatformUserName(platform, credentials);
                account.updatedAt = new Date();
            }
            const savedAccount = await this.accountRepository.save(account);
            this.logger.log(`Credentials encrypted and stored for account: ${accountId}`);
            return savedAccount;
        }
        catch (error) {
            this.logger.error(`Failed to encrypt and store credentials: ${error.message}`, error.stack);
            throw new Error(`Failed to encrypt and store credentials: ${error.message}`);
        }
    }
    async getDecryptedCredentials(accountId, tenantId = 'demo-tenant') {
        try {
            const account = await this.accountRepository.findOne({
                where: { id: accountId, tenantId },
            });
            if (!account) {
                throw new Error(`Account not found: ${accountId}`);
            }
            const decryptedJson = await this.decrypt(account.encryptedCredentials);
            const currentHash = this.calculateHash(decryptedJson);
            if (account.credentialHash && currentHash !== account.credentialHash) {
                this.logger.warn(`Credential hash mismatch for account: ${accountId}`);
            }
            return JSON.parse(decryptedJson);
        }
        catch (error) {
            this.logger.error(`Failed to get decrypted credentials: ${error.message}`, error.stack);
            throw new Error(`Failed to get decrypted credentials: ${error.message}`);
        }
    }
    async updateCredentials(accountId, credentials, tenantId = 'demo-tenant') {
        try {
            const existingCredentials = await this.getDecryptedCredentials(accountId, tenantId);
            const updatedCredentials = { ...existingCredentials, ...credentials };
            const account = await this.accountRepository.findOne({
                where: { id: accountId, tenantId },
            });
            if (!account) {
                throw new Error(`Account not found: ${accountId}`);
            }
            const credentialsJson = JSON.stringify(updatedCredentials);
            account.encryptedCredentials = await this.encrypt(credentialsJson);
            account.credentialHash = this.calculateHash(credentialsJson);
            account.updatedAt = new Date();
            const savedAccount = await this.accountRepository.save(account);
            this.logger.log(`Credentials updated for account: ${accountId}`);
            return savedAccount;
        }
        catch (error) {
            this.logger.error(`Failed to update credentials: ${error.message}`, error.stack);
            throw new Error(`Failed to update credentials: ${error.message}`);
        }
    }
    async deleteCredentials(accountId, tenantId = 'demo-tenant') {
        try {
            const account = await this.accountRepository.findOne({
                where: { id: accountId, tenantId },
            });
            if (!account) {
                throw new Error(`Account not found: ${accountId}`);
            }
            account.encryptedCredentials = '';
            account.credentialHash = null;
            account.status = account_status_enum_1.AccountStatus.EXPIRED;
            account.updatedAt = new Date();
            await this.accountRepository.save(account);
            this.logger.log(`Credentials deleted for account: ${accountId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete credentials: ${error.message}`, error.stack);
            throw new Error(`Failed to delete credentials: ${error.message}`);
        }
    }
    async validateCredentials(accountId, tenantId = 'demo-tenant') {
        try {
            const account = await this.accountRepository.findOne({
                where: { id: accountId, tenantId },
            });
            if (!account || !account.encryptedCredentials) {
                return false;
            }
            await this.getDecryptedCredentials(accountId, tenantId);
            return true;
        }
        catch (error) {
            this.logger.warn(`Credentials validation failed: ${error.message}`);
            return false;
        }
    }
    async getAllAccounts(tenantId = 'demo-tenant') {
        return this.accountRepository.find({
            where: { tenantId },
            select: [
                'id',
                'platform',
                'accountName',
                'platformUserId',
                'platformUserName',
                'avatarUrl',
                'status',
                'isEnabled',
                'lastTestedAt',
                'createdAt',
                'updatedAt',
            ],
        });
    }
    async encrypt(text) {
        try {
            const iv = crypto.randomBytes(12);
            const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag();
            return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
        }
        catch (error) {
            this.logger.error(`Encryption failed: ${error.message}`, error.stack);
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }
    async decrypt(encryptedText) {
        try {
            const parts = encryptedText.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted text format');
            }
            const iv = Buffer.from(parts[0], 'hex');
            const encrypted = parts[1];
            const authTag = Buffer.from(parts[2], 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            this.logger.error(`Decryption failed: ${error.message}`, error.stack);
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
    calculateHash(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }
    getAccountNameFromCredentials(platform, credentials) {
        switch (platform) {
            case platform_adapter_interface_1.PlatformType.WECHAT:
                return credentials.wechatName || '微信公众号';
            case platform_adapter_interface_1.PlatformType.XIAOHONGSHU:
                return credentials.username || '小红书账号';
            case platform_adapter_interface_1.PlatformType.WEIBO:
                return credentials.screenName || '微博账号';
            case platform_adapter_interface_1.PlatformType.DOUYIN:
                return credentials.openId || '抖音账号';
            default:
                return '未知账号';
        }
    }
    getPlatformUserId(platform, credentials) {
        switch (platform) {
            case platform_adapter_interface_1.PlatformType.WECHAT:
                return credentials.wechatId || '';
            case platform_adapter_interface_1.PlatformType.XIAOHONGSHU:
                return credentials.userId || '';
            case platform_adapter_interface_1.PlatformType.WEIBO:
                return credentials.uid || '';
            case platform_adapter_interface_1.PlatformType.DOUYIN:
                return credentials.openId || '';
            default:
                return '';
        }
    }
    getPlatformUserName(platform, credentials) {
        switch (platform) {
            case platform_adapter_interface_1.PlatformType.WECHAT:
                return credentials.wechatName || '';
            case platform_adapter_interface_1.PlatformType.XIAOHONGSHU:
                return credentials.username || '';
            case platform_adapter_interface_1.PlatformType.WEIBO:
                return credentials.screenName || '';
            case platform_adapter_interface_1.PlatformType.DOUYIN:
                return credentials.openId || '';
            default:
                return '';
        }
    }
};
exports.AccountCredentialService = AccountCredentialService;
exports.AccountCredentialService = AccountCredentialService = AccountCredentialService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(social_account_entity_1.SocialAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], AccountCredentialService);
//# sourceMappingURL=account-credential.service.js.map
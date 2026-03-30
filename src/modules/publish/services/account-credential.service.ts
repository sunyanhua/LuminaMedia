import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { SocialAccount } from '../../../entities/social-account.entity';
import { PlatformCredentials, PlatformType } from '../interfaces/platform-adapter.interface';
import { AccountStatus } from '../../../shared/enums/account-status.enum';

/**
 * 账号凭证加密存储服务
 * 负责安全地存储和检索社交媒体账号凭证
 */
@Injectable()
export class AccountCredentialService {
  private readonly logger = new Logger(AccountCredentialService.name);
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';

  constructor(
    @InjectRepository(SocialAccount)
    private readonly accountRepository: Repository<SocialAccount>,
    private readonly configService: ConfigService,
  ) {
    // 从配置获取加密密钥，如果没有则生成一个（仅用于开发）
    const keyHex = this.configService.get<string>('ENCRYPTION_KEY');
    if (keyHex) {
      this.encryptionKey = Buffer.from(keyHex, 'hex');
      this.logger.log('Encryption key loaded from configuration');
    } else {
      // 开发环境：使用固定密钥（生产环境必须配置ENCRYPTION_KEY）
      this.encryptionKey = crypto.scryptSync('development-key', 'salt', 32);
      this.logger.warn('Using development encryption key - NOT SECURE FOR PRODUCTION');
    }
  }

  /**
   * 加密并存储账号凭证
   */
  async encryptAndStoreCredentials(
    accountId: string,
    platform: PlatformType,
    credentials: PlatformCredentials,
    tenantId: string = 'demo-tenant',
  ): Promise<SocialAccount> {
    try {
      // 序列化凭证
      const credentialsJson = JSON.stringify(credentials);

      // 加密凭证
      const encrypted = await this.encrypt(credentialsJson);

      // 计算凭证哈希（用于验证）
      const credentialHash = this.calculateHash(credentialsJson);

      // 查找或创建账号记录
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
          status: AccountStatus.ACTIVE,
        });
      } else {
        account.encryptedCredentials = encrypted;
        account.credentialHash = credentialHash;
        account.platformUserId = this.getPlatformUserId(platform, credentials);
        account.platformUserName = this.getPlatformUserName(platform, credentials);
        account.updatedAt = new Date();
      }

      // 保存账号
      const savedAccount = await this.accountRepository.save(account);
      this.logger.log(`Credentials encrypted and stored for account: ${accountId}`);

      return savedAccount;
    } catch (error) {
      this.logger.error(`Failed to encrypt and store credentials: ${error.message}`, error.stack);
      throw new Error(`Failed to encrypt and store credentials: ${error.message}`);
    }
  }

  /**
   * 获取解密后的账号凭证
   */
  async getDecryptedCredentials(accountId: string, tenantId: string = 'demo-tenant'): Promise<PlatformCredentials> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: accountId, tenantId },
      });

      if (!account) {
        throw new Error(`Account not found: ${accountId}`);
      }

      // 解密凭证
      const decryptedJson = await this.decrypt(account.encryptedCredentials);

      // 验证哈希（确保数据完整性）
      const currentHash = this.calculateHash(decryptedJson);
      if (account.credentialHash && currentHash !== account.credentialHash) {
        this.logger.warn(`Credential hash mismatch for account: ${accountId}`);
        // 仍然返回解密后的数据，但记录警告
      }

      return JSON.parse(decryptedJson) as PlatformCredentials;
    } catch (error) {
      this.logger.error(`Failed to get decrypted credentials: ${error.message}`, error.stack);
      throw new Error(`Failed to get decrypted credentials: ${error.message}`);
    }
  }

  /**
   * 更新账号凭证
   */
  async updateCredentials(
    accountId: string,
    credentials: Partial<PlatformCredentials>,
    tenantId: string = 'demo-tenant',
  ): Promise<SocialAccount> {
    try {
      // 获取现有凭证
      const existingCredentials = await this.getDecryptedCredentials(accountId, tenantId);

      // 合并更新
      const updatedCredentials = { ...existingCredentials, ...credentials };

      // 重新加密并存储
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
    } catch (error) {
      this.logger.error(`Failed to update credentials: ${error.message}`, error.stack);
      throw new Error(`Failed to update credentials: ${error.message}`);
    }
  }

  /**
   * 删除账号凭证
   */
  async deleteCredentials(accountId: string, tenantId: string = 'demo-tenant'): Promise<void> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: accountId, tenantId },
      });

      if (!account) {
        throw new Error(`Account not found: ${accountId}`);
      }

      // 清空加密凭证
      account.encryptedCredentials = '';
      account.credentialHash = null;
      account.status = AccountStatus.EXPIRED;
      account.updatedAt = new Date();

      await this.accountRepository.save(account);
      this.logger.log(`Credentials deleted for account: ${accountId}`);
    } catch (error) {
      this.logger.error(`Failed to delete credentials: ${error.message}`, error.stack);
      throw new Error(`Failed to delete credentials: ${error.message}`);
    }
  }

  /**
   * 验证账号凭证
   */
  async validateCredentials(accountId: string, tenantId: string = 'demo-tenant'): Promise<boolean> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: accountId, tenantId },
      });

      if (!account || !account.encryptedCredentials) {
        return false;
      }

      // 尝试解密凭证
      await this.getDecryptedCredentials(accountId, tenantId);
      return true;
    } catch (error) {
      this.logger.warn(`Credentials validation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取所有账号ID（不包含凭证）
   */
  async getAllAccounts(tenantId: string = 'demo-tenant'): Promise<SocialAccount[]> {
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

  /**
   * 加密文本
   */
  private async encrypt(text: string): Promise<string> {
    try {
      const iv = crypto.randomBytes(12); // GCM推荐12字节IV
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();

      // 格式: iv:encrypted:authTag
      return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`, error.stack);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * 解密文本
   */
  private async decrypt(encryptedText: string): Promise<string> {
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
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`, error.stack);
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * 计算文本哈希
   */
  private calculateHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * 从凭证中提取账号名称
   */
  private getAccountNameFromCredentials(platform: PlatformType, credentials: PlatformCredentials): string {
    switch (platform) {
      case PlatformType.WECHAT:
        return (credentials as any).wechatName || '微信公众号';
      case PlatformType.XIAOHONGSHU:
        return (credentials as any).username || '小红书账号';
      case PlatformType.WEIBO:
        return (credentials as any).screenName || '微博账号';
      case PlatformType.DOUYIN:
        return (credentials as any).openId || '抖音账号';
      default:
        return '未知账号';
    }
  }

  /**
   * 从凭证中提取平台用户ID
   */
  private getPlatformUserId(platform: PlatformType, credentials: PlatformCredentials): string {
    switch (platform) {
      case PlatformType.WECHAT:
        return (credentials as any).wechatId || '';
      case PlatformType.XIAOHONGSHU:
        return (credentials as any).userId || '';
      case PlatformType.WEIBO:
        return (credentials as any).uid || '';
      case PlatformType.DOUYIN:
        return (credentials as any).openId || '';
      default:
        return '';
    }
  }

  /**
   * 从凭证中提取平台用户名
   */
  private getPlatformUserName(platform: PlatformType, credentials: PlatformCredentials): string {
    switch (platform) {
      case PlatformType.WECHAT:
        return (credentials as any).wechatName || '';
      case PlatformType.XIAOHONGSHU:
        return (credentials as any).username || '';
      case PlatformType.WEIBO:
        return (credentials as any).screenName || '';
      case PlatformType.DOUYIN:
        return (credentials as any).openId || ''; // 抖音可能没有用户名
      default:
        return '';
    }
  }
}
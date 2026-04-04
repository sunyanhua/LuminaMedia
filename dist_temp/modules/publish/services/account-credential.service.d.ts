import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SocialAccount } from '../../../entities/social-account.entity';
import { PlatformCredentials, PlatformType } from '../interfaces/platform-adapter.interface';
export declare class AccountCredentialService {
    private readonly accountRepository;
    private readonly configService;
    private readonly logger;
    private readonly encryptionKey;
    private readonly algorithm;
    constructor(accountRepository: Repository<SocialAccount>, configService: ConfigService);
    encryptAndStoreCredentials(accountId: string, platform: PlatformType, credentials: PlatformCredentials, tenantId?: string): Promise<SocialAccount>;
    getDecryptedCredentials(accountId: string, tenantId?: string): Promise<PlatformCredentials>;
    updateCredentials(accountId: string, credentials: Partial<PlatformCredentials>, tenantId?: string): Promise<SocialAccount>;
    deleteCredentials(accountId: string, tenantId?: string): Promise<void>;
    validateCredentials(accountId: string, tenantId?: string): Promise<boolean>;
    getAllAccounts(tenantId?: string): Promise<SocialAccount[]>;
    private encrypt;
    private decrypt;
    private calculateHash;
    private getAccountNameFromCredentials;
    private getPlatformUserId;
    private getPlatformUserName;
}

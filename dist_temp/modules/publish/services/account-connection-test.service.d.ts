import { Repository } from 'typeorm';
import { PlatformAdapterFactory } from '../adapters/platform-adapter.factory';
import { AccountCredentialService } from './account-credential.service';
import { PlatformType } from '../interfaces/platform-adapter.interface';
import { SocialAccount } from '../../../entities/social-account.entity';
export declare class AccountConnectionTestService {
    private readonly accountRepository;
    private readonly platformAdapterFactory;
    private readonly accountCredentialService;
    private readonly logger;
    constructor(accountRepository: Repository<SocialAccount>, platformAdapterFactory: PlatformAdapterFactory, accountCredentialService: AccountCredentialService);
    testAccountConnection(accountId: string, tenantId?: string): Promise<TestResult>;
    testAllAccounts(tenantId?: string): Promise<BatchTestResult>;
    private testWechatConnection;
    private testXiaohongshuConnection;
    private testWeiboConnection;
    private testDouyinConnection;
    private updateAccountTestResult;
}
export interface TestResult {
    success: boolean;
    platform: PlatformType;
    accountId?: string;
    message: string;
    error?: string;
    details?: Record<string, any>;
    timestamp: Date;
}
export interface BatchTestResult {
    total: number;
    tested: number;
    successful: number;
    failed: number;
    results: TestResult[];
    timestamp: Date;
}

import { AccountCredentialService } from '../services/account-credential.service';
import { AccountConnectionTestService, TestResult, BatchTestResult } from '../services/account-connection-test.service';
import { PlatformType, PlatformCredentials } from '../interfaces/platform-adapter.interface';
export declare class AccountController {
    private readonly accountCredentialService;
    private readonly accountConnectionTestService;
    constructor(accountCredentialService: AccountCredentialService, accountConnectionTestService: AccountConnectionTestService);
    getAllAccounts(tenantId?: string): Promise<import("../../../entities/social-account.entity").SocialAccount[]>;
    createOrUpdateAccount(accountId: string, body: {
        platform: PlatformType;
        credentials: PlatformCredentials;
        tenantId?: string;
        accountName?: string;
        config?: Record<string, any>;
    }): Promise<{
        success: boolean;
        message: string;
        accountId: string;
        platform: PlatformType;
    }>;
    getAccount(accountId: string, tenantId?: string): Promise<{
        success: boolean;
        message: string;
        account?: undefined;
    } | {
        success: boolean;
        account: import("../../../entities/social-account.entity").SocialAccount;
        message?: undefined;
    }>;
    deleteAccount(accountId: string, tenantId?: string): Promise<{
        success: boolean;
        message: string;
        accountId: string;
    }>;
    testAccountConnection(accountId: string, tenantId?: string): Promise<TestResult>;
    testAllAccounts(tenantId?: string): Promise<BatchTestResult>;
    validateCredentials(accountId: string, tenantId?: string): Promise<{
        success: boolean;
        valid: boolean;
        accountId: string;
        message: string;
    }>;
    updateConfig(accountId: string, body: {
        config?: Record<string, any>;
        quotaInfo?: Record<string, any>;
        webhookUrl?: string;
        isEnabled?: boolean;
        tenantId?: string;
    }, tenantId?: string): Promise<{
        success: boolean;
        message: string;
        accountId: string;
    }>;
}

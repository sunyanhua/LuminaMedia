import { AsyncLocalStorage } from 'async_hooks';
export interface TenantContext {
    tenantId: string;
}
export declare class TenantContextService {
    private static readonly asyncLocalStorage;
    static runWithContext(context: TenantContext, fn: () => void): void;
    getCurrentTenantId(): string;
    static getCurrentTenantIdStatic(): string;
    static get asyncStorage(): AsyncLocalStorage<TenantContext>;
}
export default TenantContextService;

export declare class ProxyPoolService {
    private proxies;
    addProxy(proxy: string): void;
    getProxy(): string | null;
    rotateProxy(): void;
    getProxyStats(): {
        total: number;
        available: number;
    };
}

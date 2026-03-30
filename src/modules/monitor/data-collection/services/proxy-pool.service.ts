import { Injectable } from '@nestjs/common';

@Injectable()
export class ProxyPoolService {
  private proxies: string[] = [];

  addProxy(proxy: string): void {
    this.proxies.push(proxy);
  }

  getProxy(): string | null {
    return this.proxies.length > 0 ? this.proxies[0] : null;
  }

  rotateProxy(): void {
    // 简化实现
    if (this.proxies.length > 1) {
      const first = this.proxies.shift();
      if (first) this.proxies.push(first);
    }
  }

  getProxyStats(): { total: number; available: number } {
    return {
      total: this.proxies.length,
      available: this.proxies.length,
    };
  }
}

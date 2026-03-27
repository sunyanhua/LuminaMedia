import { CloudProvider } from './cloud-provider.interface';

/**
 * CloudProvider 工厂
 * 根据环境变量 CLOUD_PROVIDER 创建对应的适配器实例
 */
export class CloudProviderFactory {
  private static instance: CloudProvider | null = null;

  /**
   * 获取 CloudProvider 实例（单例模式）
   */
  static async getInstance(): Promise<CloudProvider> {
    if (!this.instance) {
      this.instance = await this.createProvider();
      await this.instance.initialize();
    }
    return this.instance;
  }

  /**
   * 创建 CloudProvider 适配器
   */
  private static async createProvider(): Promise<CloudProvider> {
    const providerType = process.env.CLOUD_PROVIDER || 'mock';

    switch (providerType.toLowerCase()) {
      case 'alicloud':
        const { AliCloudAdapter } = require('./adapters/alicloud.adapter');
        return new AliCloudAdapter();

      case 'private':
        const {
          PrivateDeployAdapter,
        } = require('./adapters/private-deploy.adapter');
        return new PrivateDeployAdapter();

      case 'mock':
      default:
        const { MockAdapter } = require('./adapters/mock.adapter');
        return new MockAdapter();
    }
  }

  /**
   * 销毁当前实例（用于测试或重新初始化）
   */
  static destroyInstance(): void {
    if (this.instance) {
      this.instance.cleanup().catch(console.error);
      this.instance = null;
    }
  }
}

/**
 * 便捷函数：获取 CloudProvider 实例
 */
export async function getCloudProvider(): Promise<CloudProvider> {
  return CloudProviderFactory.getInstance();
}

/**
 * 便捷函数：直接获取某个服务
 */
export async function getStorageService() {
  const provider = await getCloudProvider();
  return provider.storage;
}

export async function getAIService() {
  const provider = await getCloudProvider();
  return provider.ai;
}

export async function getDatabaseService() {
  const provider = await getCloudProvider();
  return provider.database;
}

export async function getMessagingService() {
  const provider = await getCloudProvider();
  return provider.messaging;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudProviderFactory = void 0;
exports.getCloudProvider = getCloudProvider;
exports.getStorageService = getStorageService;
exports.getAIService = getAIService;
exports.getDatabaseService = getDatabaseService;
exports.getMessagingService = getMessagingService;
class CloudProviderFactory {
    static instance = null;
    static async getInstance() {
        if (!this.instance) {
            this.instance = await this.createProvider();
            await this.instance.initialize();
        }
        return this.instance;
    }
    static async createProvider() {
        const providerType = process.env.CLOUD_PROVIDER || 'mock';
        switch (providerType.toLowerCase()) {
            case 'alicloud':
                const { AliCloudAdapter } = require('./adapters/alicloud.adapter');
                return new AliCloudAdapter();
            case 'private':
                const { PrivateDeployAdapter, } = require('./adapters/private-deploy.adapter');
                return new PrivateDeployAdapter();
            case 'mock':
            default:
                const { MockAdapter } = require('./adapters/mock.adapter');
                return new MockAdapter();
        }
    }
    static destroyInstance() {
        if (this.instance) {
            this.instance.cleanup().catch(console.error);
            this.instance = null;
        }
    }
}
exports.CloudProviderFactory = CloudProviderFactory;
async function getCloudProvider() {
    return CloudProviderFactory.getInstance();
}
async function getStorageService() {
    const provider = await getCloudProvider();
    return provider.storage;
}
async function getAIService() {
    const provider = await getCloudProvider();
    return provider.ai;
}
async function getDatabaseService() {
    const provider = await getCloudProvider();
    return provider.database;
}
async function getMessagingService() {
    const provider = await getCloudProvider();
    return provider.messaging;
}
//# sourceMappingURL=cloud-provider.factory.js.map
/**
 * CloudProvider 抽象层
 *
 * 支持环境一键切换：
 * 1. 阿里云SaaS部署 (CLOUD_PROVIDER=alicloud)
 * 2. 私有化部署 (CLOUD_PROVIDER=private)
 * 3. Mock演示模式 (CLOUD_PROVIDER=mock 或未设置)
 *
 * 使用方式：
 *
 * ```typescript
 * import { getCloudProvider } from './shared/cloud';
 *
 * const provider = await getCloudProvider();
 * const storage = provider.storage;
 *
 * // 上传文件
 * await storage.uploadFile('my-bucket', 'test.txt', Buffer.from('hello'));
 *
 * // 调用AI
 * const ai = provider.ai;
 * const response = await ai.callModel('qwen-max', '你好');
 * ```
 */

export * from './cloud-provider.interface';
export * from './cloud-provider.factory';
export { AliCloudAdapter } from './adapters/alicloud.adapter';
export { PrivateDeployAdapter } from './adapters/private-deploy.adapter';
export { MockAdapter } from './adapters/mock.adapter';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app.module';
import {
  GovernmentContentType,
  GovernmentContentStyle,
  ComplianceLevel,
} from '../../../../src/modules/publish/interfaces/government-content.interface';

/**
 * 政府内容性能测试
 * 验证系统在高负载下的性能表现
 */
describe('政府内容性能测试', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('单请求性能基准', () => {
    it('单个内容生成应在2秒内完成', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/government/generate')
        .send({
          contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
          theme: '性能基准测试文档',
          style: GovernmentContentStyle.FORMAL,
          complianceLevel: ComplianceLevel.HIGH,
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(2000); // 2秒内完成

      console.log(`单个内容生成响应时间: ${responseTime}ms`);
    });

    it('单个合规性检查应在1秒内完成', async () => {
      // 先生成测试内容
      const generateResponse = await request(app.getHttpServer())
        .post('/government/generate')
        .send({
          contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
          theme: '合规性性能测试',
          style: GovernmentContentStyle.FORMAL,
          complianceLevel: ComplianceLevel.HIGH,
        });

      const content = generateResponse.body.content;

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .post('/government/check-compliance')
        .send(content);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(response.body.passed).toBe(true);
      expect(responseTime).toBeLessThan(1000); // 1秒内完成

      console.log(`单个合规性检查响应时间: ${responseTime}ms`);
    });
  });

  describe('并发请求性能', () => {
    it('应能处理10个并发内容生成请求', async () => {
      const concurrency = 10;
      const requests = [];

      const startTime = Date.now();

      // 创建并发请求
      for (let i = 0; i < concurrency; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/government/generate')
            .send({
              contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
              theme: `并发测试文档 ${i}`,
              style: GovernmentContentStyle.FORMAL,
              complianceLevel: ComplianceLevel.HIGH,
            })
            .expect(200),
        );
      }

      // 等待所有请求完成
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 验证所有请求都成功
      const allSuccessful = responses.every(
        (response) => response.body.success === true,
      );
      expect(allSuccessful).toBe(true);

      // 计算平均响应时间
      const avgResponseTime = totalTime / concurrency;

      console.log(`\n=== 并发性能测试结果 ===`);
      console.log(`并发数: ${concurrency}`);
      console.log(`总耗时: ${totalTime}ms`);
      console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
      console.log(
        `吞吐量: ${(concurrency / (totalTime / 1000)).toFixed(2)} 请求/秒`,
      );
      console.log(`所有请求成功: ${allSuccessful ? '✅' : '❌'}`);

      // 性能要求：平均响应时间 < 2秒
      expect(avgResponseTime).toBeLessThan(2000);
    }, 30000);

    it('应能处理批量合规性检查', async () => {
      // 生成测试内容
      const testContents = [];
      for (let i = 0; i < 5; i++) {
        const generateResponse = await request(app.getHttpServer())
          .post('/government/generate')
          .send({
            contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
            theme: `批量合规测试 ${i}`,
            style: GovernmentContentStyle.FORMAL,
            complianceLevel: ComplianceLevel.HIGH,
          });

        testContents.push(generateResponse.body.content);
      }

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .post('/government/batch-check-compliance')
        .send(testContents);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(testContents.length);

      // 批量检查应在合理时间内完成
      expect(responseTime).toBeLessThan(5000); // 5秒内完成5个内容的批量检查

      console.log(`\n批量合规性检查性能:`);
      console.log(`内容数量: ${testContents.length}`);
      console.log(`响应时间: ${responseTime}ms`);
      console.log(
        `平均每个内容: ${(responseTime / testContents.length).toFixed(2)}ms`,
      );
    });
  });

  describe('负载测试模拟', () => {
    it('应能在持续负载下保持稳定', async () => {
      const requestCount = 20;
      const results = {
        success: 0,
        failed: 0,
        responseTimes: [] as number[],
      };

      const testStartTime = Date.now();

      // 顺序发送请求，模拟持续负载
      for (let i = 0; i < requestCount; i++) {
        const startTime = Date.now();

        try {
          const response = await request(app.getHttpServer())
            .post('/government/generate')
            .send({
              contentType:
                i % 2 === 0
                  ? GovernmentContentType.OFFICIAL_DOCUMENT
                  : GovernmentContentType.ANTI_FRAUD,
              theme: `负载测试 ${i}`,
              style: GovernmentContentStyle.FORMAL,
              complianceLevel: ComplianceLevel.HIGH,
            });

          const responseTime = Date.now() - startTime;
          results.responseTimes.push(responseTime);

          if (response.status === 200 && response.body.success) {
            results.success++;
          } else {
            results.failed++;
          }
        } catch (error) {
          results.failed++;
          console.error(`请求 ${i} 失败:`, error.message);
        }

        // 添加小延迟，模拟真实用户行为
        if (i < requestCount - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      const testEndTime = Date.now();
      const totalTestTime = testEndTime - testStartTime;

      // 计算性能指标
      const successRate = (results.success / requestCount) * 100;
      const avgResponseTime =
        results.responseTimes.reduce((a, b) => a + b, 0) /
        results.responseTimes.length;
      const p95ResponseTime = calculatePercentile(results.responseTimes, 95);
      const throughput = requestCount / (totalTestTime / 1000);

      console.log(`\n=== 负载测试结果 ===`);
      console.log(`总请求数: ${requestCount}`);
      console.log(`成功: ${results.success}`);
      console.log(`失败: ${results.failed}`);
      console.log(`成功率: ${successRate.toFixed(2)}%`);
      console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`P95响应时间: ${p95ResponseTime.toFixed(2)}ms`);
      console.log(`吞吐量: ${throughput.toFixed(2)} 请求/秒`);
      console.log(`总测试时间: ${totalTestTime}ms`);

      // 性能要求
      expect(successRate).toBeGreaterThanOrEqual(99); // 99%成功率
      expect(p95ResponseTime).toBeLessThan(2000); // P95 < 2秒
      expect(throughput).toBeGreaterThan(10); // 至少10请求/秒
    }, 60000);
  });

  describe('内存和资源使用', () => {
    it('应在多次请求后保持稳定的内存使用', async () => {
      const initialMemory = process.memoryUsage();
      console.log(`\n初始内存使用:`);
      console.log(`  RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`);
      console.log(
        `  Heap Total: ${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      );
      console.log(
        `  Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      );

      // 执行一系列请求
      const requestCount = 10;
      for (let i = 0; i < requestCount; i++) {
        await request(app.getHttpServer())
          .post('/government/generate')
          .send({
            contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
            theme: `内存测试 ${i}`,
            style: GovernmentContentStyle.FORMAL,
            complianceLevel: ComplianceLevel.HIGH,
          })
          .expect(200);
      }

      const finalMemory = process.memoryUsage();
      console.log(`\n最终内存使用:`);
      console.log(`  RSS: ${(finalMemory.rss / 1024 / 1024).toFixed(2)} MB`);
      console.log(
        `  Heap Total: ${(finalMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      );
      console.log(
        `  Heap Used: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      );

      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      console.log(
        `\n内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`,
      );

      // 内存增长应在合理范围内
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 增长小于50MB
    });
  });

  describe('API端点性能', () => {
    const endpoints = [
      { method: 'GET', path: '/government/templates' },
      { method: 'GET', path: '/government/scripts' },
      { method: 'GET', path: '/government/content-types' },
      { method: 'GET', path: '/government/stats' },
    ];

    endpoints.forEach((endpoint) => {
      it(`API端点 ${endpoint.method} ${endpoint.path} 应在500ms内响应`, async () => {
        const startTime = Date.now();

        const response = await request(app.getHttpServer())[
          endpoint.method.toLowerCase() as 'get' | 'post'
        ](endpoint.path);

        const responseTime = Date.now() - startTime;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(500); // 500ms内响应

        console.log(
          `API端点 ${endpoint.method} ${endpoint.path}: ${responseTime}ms`,
        );
      });
    });
  });
});

/**
 * 计算百分位数
 */
function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);

  if (Math.floor(index) === index) {
    return sorted[index];
  }

  const lower = sorted[Math.floor(index)];
  const upper = sorted[Math.ceil(index)];
  const weight = index - Math.floor(index);

  return lower * (1 - weight) + upper * weight;
}

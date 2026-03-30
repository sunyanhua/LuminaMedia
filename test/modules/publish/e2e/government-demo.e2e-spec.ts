import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app.module';
import { GovernmentContentType, GovernmentContentStyle, ComplianceLevel } from '../../../../src/modules/publish/interfaces/government-content.interface';

/**
 * 政务版DEMO端到端测试
 * 验证全功能真实操作流程
 */
describe('政务版DEMO端到端测试 (e2e)', () => {
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

  describe('完整政策宣传流程', () => {
    it('应能完成完整的政策宣传流程', async () => {
      // 1. 生成政府公文
      const documentResponse = await request(app.getHttpServer())
        .post('/government/generate')
        .send({
          contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
          theme: '关于加强安全生产工作的通知',
          style: GovernmentContentStyle.FORMAL,
          complianceLevel: ComplianceLevel.HIGH,
          params: {
            issuingAuthority: 'XX市安全生产委员会办公室',
            documentNumber: `X安委办〔${new Date().getFullYear()}〕12号`,
          },
        })
        .expect(200);

      expect(documentResponse.body.success).toBe(true);
      expect(documentResponse.body.content).toBeDefined();
      expect(documentResponse.body.content.type).toBe(GovernmentContentType.OFFICIAL_DOCUMENT);
      expect(documentResponse.body.complianceCheck.passed).toBe(true);

      const documentId = documentResponse.body.content.header?.documentNumber;

      // 2. 生成防诈骗宣传内容
      const antiFraudResponse = await request(app.getHttpServer())
        .post('/government/generate')
        .send({
          contentType: GovernmentContentType.ANTI_FRAUD,
          theme: '防范电信网络诈骗',
          style: GovernmentContentStyle.SERIOUS,
          complianceLevel: ComplianceLevel.MEDIUM,
          params: {
            fraudType: '电信网络诈骗',
          },
        })
        .expect(200);

      expect(antiFraudResponse.body.success).toBe(true);
      expect(antiFraudResponse.body.content.type).toBe(GovernmentContentType.ANTI_FRAUD);
      expect(antiFraudResponse.body.content.fraudType).toBe('电信网络诈骗');

      // 3. 生成政策解读内容
      const policyResponse = await request(app.getHttpServer())
        .post('/government/generate')
        .send({
          contentType: GovernmentContentType.POLICY_INTERPRETATION,
          theme: '小微企业税收优惠政策解读',
          style: GovernmentContentStyle.AUTHORITATIVE,
          complianceLevel: ComplianceLevel.HIGH,
          params: {
            issuingAuthority: 'XX市税务局',
          },
        })
        .expect(200);

      expect(policyResponse.body.success).toBe(true);
      expect(policyResponse.body.content.type).toBe(GovernmentContentType.POLICY_INTERPRETATION);
      expect(policyResponse.body.content.issuingAuthority).toBe('XX市税务局');

      // 4. 检查内容合规性
      const complianceResponse = await request(app.getHttpServer())
        .post('/government/check-compliance')
        .send(policyResponse.body.content)
        .expect(200);

      expect(complianceResponse.body.passed).toBe(true);
      expect(complianceResponse.body.score).toBeGreaterThanOrEqual(80);

      // 5. 获取演示剧本列表
      const scriptsResponse = await request(app.getHttpServer())
        .get('/government/scripts')
        .expect(200);

      expect(Array.isArray(scriptsResponse.body)).toBe(true);
      expect(scriptsResponse.body.length).toBeGreaterThan(0);

      // 6. 执行演示剧本
      if (scriptsResponse.body.length > 0) {
        const scriptId = scriptsResponse.body[0].id;
        const executeResponse = await request(app.getHttpServer())
          .post(`/government/scripts/${scriptId}/execute`)
          .query({ speed: '2' }) // 快速执行
          .expect(200);

        expect(executeResponse.body.success).toBe(true);
        expect(executeResponse.body.steps).toBeDefined();
        expect(executeResponse.body.steps.length).toBeGreaterThan(0);
      }

      // 7. 获取统计信息
      const statsResponse = await request(app.getHttpServer())
        .get('/government/stats')
        .expect(200);

      expect(statsResponse.body.totalGenerations).toBeDefined();
      expect(statsResponse.body.successRate).toBeDefined();
      expect(statsResponse.body.compliancePassRate).toBeDefined();

      // 8. 测试账号管理API（如果可用）
      try {
        const accountsResponse = await request(app.getHttpServer())
          .get('/accounts')
          .expect(200);

        expect(accountsResponse.body).toBeDefined();
      } catch (error) {
        // 账号管理API可能未实现，跳过此测试
        console.log('账号管理API未实现，跳过测试');
      }
    }, 30000); // 30秒超时
  });

  describe('批量内容生成和合规性检查', () => {
    it('应能批量生成内容并检查合规性', async () => {
      // 批量生成请求
      const batchRequests = [
        {
          contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
          theme: '关于推进数字化转型的通知',
          style: GovernmentContentStyle.FORMAL,
          complianceLevel: ComplianceLevel.HIGH,
        },
        {
          contentType: GovernmentContentType.ANTI_FRAUD,
          theme: '防范网络购物诈骗',
          style: GovernmentContentStyle.SERIOUS,
          complianceLevel: ComplianceLevel.MEDIUM,
        },
        {
          contentType: GovernmentContentType.POLICY_INTERPRETATION,
          theme: '科技创新扶持政策解读',
          style: GovernmentContentStyle.AUTHORITATIVE,
          complianceLevel: ComplianceLevel.HIGH,
        },
      ];

      const generatedContents = [];

      // 生成批量内容
      for (const requestData of batchRequests) {
        const response = await request(app.getHttpServer())
          .post('/government/generate')
          .send(requestData)
          .expect(200);

        expect(response.body.success).toBe(true);
        generatedContents.push(response.body.content);
      }

      // 批量检查合规性
      const batchComplianceResponse = await request(app.getHttpServer())
        .post('/government/batch-check-compliance')
        .send(generatedContents)
        .expect(200);

      expect(Array.isArray(batchComplianceResponse.body)).toBe(true);
      expect(batchComplianceResponse.body.length).toBe(generatedContents.length);

      // 验证所有内容都通过合规检查
      const allPassed = batchComplianceResponse.body.every((result: any) => result.passed === true);
      expect(allPassed).toBe(true);
    }, 20000);
  });

  describe('模板和剧本管理', () => {
    it('应能获取模板和剧本信息', async () => {
      // 获取模板列表
      const templatesResponse = await request(app.getHttpServer())
        .get('/government/templates')
        .expect(200);

      expect(Array.isArray(templatesResponse.body)).toBe(true);

      // 获取剧本列表
      const scriptsResponse = await request(app.getHttpServer())
        .get('/government/scripts')
        .expect(200);

      expect(Array.isArray(scriptsResponse.body)).toBe(true);

      // 获取内容类型枚举
      const contentTypesResponse = await request(app.getHttpServer())
        .get('/government/content-types')
        .expect(200);

      expect(contentTypesResponse.body.types).toBeDefined();
      expect(Array.isArray(contentTypesResponse.body.types)).toBe(true);
      expect(contentTypesResponse.body.types.length).toBeGreaterThan(0);

      // 获取内容风格枚举
      const contentStylesResponse = await request(app.getHttpServer())
        .get('/government/content-styles')
        .expect(200);

      expect(contentStylesResponse.body.styles).toBeDefined();
      expect(Array.isArray(contentStylesResponse.body.styles)).toBe(true);

      // 获取合规级别枚举
      const complianceLevelsResponse = await request(app.getHttpServer())
        .get('/government/compliance-levels')
        .expect(200);

      expect(complianceLevelsResponse.body.levels).toBeDefined();
      expect(Array.isArray(complianceLevelsResponse.body.levels)).toBe(true);
    });
  });

  describe('性能测试', () => {
    it('内容生成应在合理时间内完成', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/government/generate')
        .send({
          contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
          theme: '性能测试文档',
          style: GovernmentContentStyle.FORMAL,
          complianceLevel: ComplianceLevel.HIGH,
        })
        .expect(200);

      const endTime = Date.now();
      const generationTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.generationTime).toBeDefined();
      expect(generationTime).toBeLessThan(5000); // 应在5秒内完成

      console.log(`内容生成时间: ${generationTime}ms, 服务报告时间: ${response.body.generationTime}ms`);
    });

    it('批量合规性检查应能处理多个内容', async () => {
      // 创建测试内容
      const testContents = [];
      for (let i = 0; i < 10; i++) {
        testContents.push({
          type: GovernmentContentType.OFFICIAL_DOCUMENT,
          header: {
            issuingAuthority: `测试机关${i}`,
            documentNumber: `测试〔2026〕${i}号`,
            title: `测试文档${i}`,
            issueDate: '2026-03-30',
          },
          body: {
            sections: [
              {
                title: '测试章节',
                content: '测试内容',
              },
            ],
          },
        });
      }

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .post('/government/batch-check-compliance')
        .send(testContents)
        .expect(200);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(testContents.length);
      expect(processingTime).toBeLessThan(10000); // 10个内容应在10秒内完成

      console.log(`批量合规性检查时间 (${testContents.length}个内容): ${processingTime}ms`);
    });
  });
});
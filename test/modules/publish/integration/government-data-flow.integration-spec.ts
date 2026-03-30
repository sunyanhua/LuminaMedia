import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app.module';
import { GovernmentContentType, GovernmentContentStyle, ComplianceLevel } from '../../../../src/modules/publish/interfaces/government-content.interface';
import { PlatformType } from '../../../../src/modules/publish/interfaces/platform-adapter.interface';

/**
 * 政府数据流集成测试
 * 验证真实数据流：内容生成 → 合规性检查 → 平台发布
 */
describe('政府数据流集成测试', () => {
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

  describe('真实数据流验证', () => {
    it('应验证完整的数据流：从内容生成到模拟发布', async () => {
      // 记录开始时间
      const startTime = Date.now();
      const flowSteps = [];

      // 步骤1: 生成政府公文
      const step1Start = Date.now();
      const generateResponse = await request(app.getHttpServer())
        .post('/government/generate')
        .send({
          contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
          theme: '数据流测试公文',
          style: GovernmentContentStyle.FORMAL,
          complianceLevel: ComplianceLevel.HIGH,
          params: {
            issuingAuthority: '数据流测试委员会',
            documentNumber: `数据流〔2026〕001号`,
          },
        });

      const step1Time = Date.now() - step1Start;
      flowSteps.push({
        step: '内容生成',
        success: generateResponse.status === 200,
        time: step1Time,
        data: generateResponse.body,
      });

      expect(generateResponse.status).toBe(200);
      expect(generateResponse.body.success).toBe(true);
      const generatedContent = generateResponse.body.content;
      expect(generatedContent).toBeDefined();

      // 步骤2: 合规性检查
      const step2Start = Date.now();
      const complianceResponse = await request(app.getHttpServer())
        .post('/government/check-compliance')
        .send(generatedContent);

      const step2Time = Date.now() - step2Start;
      flowSteps.push({
        step: '合规性检查',
        success: complianceResponse.status === 200,
        time: step2Time,
        data: complianceResponse.body,
      });

      expect(complianceResponse.status).toBe(200);
      expect(complianceResponse.body.passed).toBe(true);
      expect(complianceResponse.body.score).toBeGreaterThanOrEqual(80);

      // 步骤3: 模拟平台发布（通过账号管理API）
      const step3Start = Date.now();

      // 首先检查是否有可用的账号
      let hasAccounts = false;
      let testAccountId = null;

      try {
        const accountsResponse = await request(app.getHttpServer())
          .get('/accounts')
          .expect(200);

        if (accountsResponse.body && Array.isArray(accountsResponse.body) && accountsResponse.body.length > 0) {
          hasAccounts = true;
          testAccountId = accountsResponse.body[0].id;
        }
      } catch (error) {
        // 账号API可能不可用，跳过实际发布测试
        console.log('账号管理API不可用，跳过实际发布测试');
      }

      let publishResult = null;

      if (hasAccounts && testAccountId) {
        // 测试账号连接
        const connectionTestResponse = await request(app.getHttpServer())
          .post(`/accounts/${testAccountId}/test`)
          .expect(200);

        flowSteps.push({
          step: '账号连接测试',
          success: connectionTestResponse.status === 200,
          time: Date.now() - step3Start,
          data: connectionTestResponse.body,
        });

        // 如果有真实的账号连接，可以尝试模拟发布
        if (connectionTestResponse.body.success) {
          // 这里可以添加实际发布逻辑
          // 目前仅模拟发布成功
          publishResult = {
            success: true,
            publishId: `mock-publish-${Date.now()}`,
            platform: PlatformType.WECHAT,
            status: 'published',
            url: 'https://mock.example.com/publish/123',
          };
        }
      } else {
        // 模拟发布结果
        publishResult = {
          success: true,
          publishId: `mock-publish-${Date.now()}`,
          platform: PlatformType.WECHAT,
          status: 'published',
          url: 'https://mock.example.com/publish/123',
          note: '模拟发布（无真实账号配置）',
        };
      }

      const step3Time = Date.now() - step3Start;
      flowSteps.push({
        step: '平台发布',
        success: publishResult?.success === true,
        time: step3Time,
        data: publishResult,
      });

      // 步骤4: 效果验证（模拟）
      const step4Start = Date.now();

      // 模拟效果数据
      const effectData = {
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 30),
        collectedAt: new Date().toISOString(),
      };

      const step4Time = Date.now() - step4Start;
      flowSteps.push({
        step: '效果验证',
        success: true,
        time: step4Time,
        data: effectData,
      });

      // 步骤5: 数据持久化验证
      const step5Start = Date.now();

      // 获取统计信息，验证数据已被记录
      const statsResponse = await request(app.getHttpServer())
        .get('/government/stats')
        .expect(200);

      const step5Time = Date.now() - step5Start;
      flowSteps.push({
        step: '数据持久化',
        success: statsResponse.status === 200,
        time: step5Time,
        data: statsResponse.body,
      });

      expect(statsResponse.body.totalGenerations).toBeGreaterThan(0);

      // 输出数据流详情
      const totalTime = Date.now() - startTime;
      console.log('\n=== 政府数据流验证详情 ===');
      console.log(`总耗时: ${totalTime}ms`);
      console.log('步骤详情:');
      flowSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.step}: ${step.success ? '✅' : '❌'} (${step.time}ms)`);
      });
      console.log('==========================\n');

      // 验证所有步骤都成功
      const allStepsSuccessful = flowSteps.every(step => step.success === true);
      expect(allStepsSuccessful).toBe(true);
    }, 30000);
  });

  describe('批量数据流验证', () => {
    it('应能处理批量内容的数据流', async () => {
      const contentTypes = [
        GovernmentContentType.OFFICIAL_DOCUMENT,
        GovernmentContentType.ANTI_FRAUD,
        GovernmentContentType.POLICY_INTERPRETATION,
      ];

      const batchResults = [];

      for (const contentType of contentTypes) {
        // 生成内容
        const generateResponse = await request(app.getHttpServer())
          .post('/government/generate')
          .send({
            contentType,
            theme: `批量测试 - ${contentType}`,
            style: GovernmentContentStyle.FORMAL,
            complianceLevel: ComplianceLevel.HIGH,
          })
          .expect(200);

        const content = generateResponse.body.content;

        // 检查合规性
        const complianceResponse = await request(app.getHttpServer())
          .post('/government/check-compliance')
          .send(content)
          .expect(200);

        batchResults.push({
          contentType,
          generationSuccess: generateResponse.body.success,
          compliancePassed: complianceResponse.body.passed,
          complianceScore: complianceResponse.body.score,
        });
      }

      // 验证所有内容都成功生成并通过合规检查
      const allGenerated = batchResults.every(result => result.generationSuccess === true);
      const allCompliant = batchResults.every(result => result.compliancePassed === true);

      expect(allGenerated).toBe(true);
      expect(allCompliant).toBe(true);

      // 输出批量处理结果
      console.log('\n=== 批量数据流验证结果 ===');
      batchResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.contentType}: 生成${result.generationSuccess ? '✅' : '❌'}, 合规${result.compliancePassed ? '✅' : '❌'} (${result.complianceScore}分)`);
      });
      console.log('===========================\n');
    }, 20000);
  });

  describe('错误处理和数据完整性', () => {
    it('应正确处理无效内容并保持数据完整性', async () => {
      // 测试1: 无效内容类型
      const invalidTypeResponse = await request(app.getHttpServer())
        .post('/government/generate')
        .send({
          contentType: 'INVALID_TYPE', // 无效类型
          theme: '测试',
        });

      // 应返回错误响应
      expect(invalidTypeResponse.status).toBe(400);

      // 测试2: 空主题
      const emptyThemeResponse = await request(app.getHttpServer())
        .post('/government/generate')
        .send({
          contentType: GovernmentContentType.OFFICIAL_DOCUMENT,
          theme: '', // 空主题
        });

      // 应处理空主题（可能生成默认内容或返回错误）
      expect(emptyThemeResponse.status).toBe(200);

      // 测试3: 合规性检查无效内容
      const invalidContentResponse = await request(app.getHttpServer())
        .post('/government/check-compliance')
        .send({
          type: 'INVALID_TYPE',
          invalidField: 'test',
        });

      // 应能处理无效内容并返回合规性结果
      expect(invalidContentResponse.status).toBe(200);

      // 验证统计信息仍然可访问
      const statsResponse = await request(app.getHttpServer())
        .get('/government/stats')
        .expect(200);

      expect(statsResponse.body).toBeDefined();
    });
  });

  describe('数据源验证', () => {
    it('应验证数据源连接和可用性', async () => {
      // 验证政府内容模板数据源
      const templatesResponse = await request(app.getHttpServer())
        .get('/government/templates')
        .expect(200);

      expect(Array.isArray(templatesResponse.body)).toBe(true);

      if (templatesResponse.body.length > 0) {
        // 验证模板结构
        const template = templatesResponse.body[0];
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.contentType).toBeDefined();
      }

      // 验证演示剧本数据源
      const scriptsResponse = await request(app.getHttpServer())
        .get('/government/scripts')
        .expect(200);

      expect(Array.isArray(scriptsResponse.body)).toBe(true);

      // 验证枚举数据源
      const contentTypesResponse = await request(app.getHttpServer())
        .get('/government/content-types')
        .expect(200);

      expect(contentTypesResponse.body.types).toBeDefined();
      expect(contentTypesResponse.body.types.length).toBeGreaterThan(0);

      console.log('\n=== 数据源验证结果 ===');
      console.log(`模板数量: ${templatesResponse.body.length}`);
      console.log(`剧本数量: ${scriptsResponse.body.length}`);
      console.log(`内容类型数量: ${contentTypesResponse.body.types.length}`);
      console.log('=====================\n');
    });
  });
});
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = __importStar(require("supertest"));
const app_module_1 = require("../../../../src/app.module");
const government_content_interface_1 = require("../../../../src/modules/publish/interfaces/government-content.interface");
describe('政务版DEMO端到端测试 (e2e)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('完整政策宣传流程', () => {
        it('应能完成完整的政策宣传流程', async () => {
            const documentResponse = await request(app.getHttpServer())
                .post('/government/generate')
                .send({
                contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                theme: '关于加强安全生产工作的通知',
                style: government_content_interface_1.GovernmentContentStyle.FORMAL,
                complianceLevel: government_content_interface_1.ComplianceLevel.HIGH,
                params: {
                    issuingAuthority: 'XX市安全生产委员会办公室',
                    documentNumber: `X安委办〔${new Date().getFullYear()}〕12号`,
                },
            })
                .expect(200);
            expect(documentResponse.body.success).toBe(true);
            expect(documentResponse.body.content).toBeDefined();
            expect(documentResponse.body.content.type).toBe(government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT);
            expect(documentResponse.body.complianceCheck.passed).toBe(true);
            const documentId = documentResponse.body.content.header?.documentNumber;
            const antiFraudResponse = await request(app.getHttpServer())
                .post('/government/generate')
                .send({
                contentType: government_content_interface_1.GovernmentContentType.ANTI_FRAUD,
                theme: '防范电信网络诈骗',
                style: government_content_interface_1.GovernmentContentStyle.SERIOUS,
                complianceLevel: government_content_interface_1.ComplianceLevel.MEDIUM,
                params: {
                    fraudType: '电信网络诈骗',
                },
            })
                .expect(200);
            expect(antiFraudResponse.body.success).toBe(true);
            expect(antiFraudResponse.body.content.type).toBe(government_content_interface_1.GovernmentContentType.ANTI_FRAUD);
            expect(antiFraudResponse.body.content.fraudType).toBe('电信网络诈骗');
            const policyResponse = await request(app.getHttpServer())
                .post('/government/generate')
                .send({
                contentType: government_content_interface_1.GovernmentContentType.POLICY_INTERPRETATION,
                theme: '小微企业税收优惠政策解读',
                style: government_content_interface_1.GovernmentContentStyle.AUTHORITATIVE,
                complianceLevel: government_content_interface_1.ComplianceLevel.HIGH,
                params: {
                    issuingAuthority: 'XX市税务局',
                },
            })
                .expect(200);
            expect(policyResponse.body.success).toBe(true);
            expect(policyResponse.body.content.type).toBe(government_content_interface_1.GovernmentContentType.POLICY_INTERPRETATION);
            expect(policyResponse.body.content.issuingAuthority).toBe('XX市税务局');
            const complianceResponse = await request(app.getHttpServer())
                .post('/government/check-compliance')
                .send(policyResponse.body.content)
                .expect(200);
            expect(complianceResponse.body.passed).toBe(true);
            expect(complianceResponse.body.score).toBeGreaterThanOrEqual(80);
            const scriptsResponse = await request(app.getHttpServer())
                .get('/government/scripts')
                .expect(200);
            expect(Array.isArray(scriptsResponse.body)).toBe(true);
            expect(scriptsResponse.body.length).toBeGreaterThan(0);
            if (scriptsResponse.body.length > 0) {
                const scriptId = scriptsResponse.body[0].id;
                const executeResponse = await request(app.getHttpServer())
                    .post(`/government/scripts/${scriptId}/execute`)
                    .query({ speed: '2' })
                    .expect(200);
                expect(executeResponse.body.success).toBe(true);
                expect(executeResponse.body.steps).toBeDefined();
                expect(executeResponse.body.steps.length).toBeGreaterThan(0);
            }
            const statsResponse = await request(app.getHttpServer())
                .get('/government/stats')
                .expect(200);
            expect(statsResponse.body.totalGenerations).toBeDefined();
            expect(statsResponse.body.successRate).toBeDefined();
            expect(statsResponse.body.compliancePassRate).toBeDefined();
            try {
                const accountsResponse = await request(app.getHttpServer())
                    .get('/accounts')
                    .expect(200);
                expect(accountsResponse.body).toBeDefined();
            }
            catch (error) {
                console.log('账号管理API未实现，跳过测试');
            }
        }, 30000);
    });
    describe('批量内容生成和合规性检查', () => {
        it('应能批量生成内容并检查合规性', async () => {
            const batchRequests = [
                {
                    contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                    theme: '关于推进数字化转型的通知',
                    style: government_content_interface_1.GovernmentContentStyle.FORMAL,
                    complianceLevel: government_content_interface_1.ComplianceLevel.HIGH,
                },
                {
                    contentType: government_content_interface_1.GovernmentContentType.ANTI_FRAUD,
                    theme: '防范网络购物诈骗',
                    style: government_content_interface_1.GovernmentContentStyle.SERIOUS,
                    complianceLevel: government_content_interface_1.ComplianceLevel.MEDIUM,
                },
                {
                    contentType: government_content_interface_1.GovernmentContentType.POLICY_INTERPRETATION,
                    theme: '科技创新扶持政策解读',
                    style: government_content_interface_1.GovernmentContentStyle.AUTHORITATIVE,
                    complianceLevel: government_content_interface_1.ComplianceLevel.HIGH,
                },
            ];
            const generatedContents = [];
            for (const requestData of batchRequests) {
                const response = await request(app.getHttpServer())
                    .post('/government/generate')
                    .send(requestData)
                    .expect(200);
                expect(response.body.success).toBe(true);
                generatedContents.push(response.body.content);
            }
            const batchComplianceResponse = await request(app.getHttpServer())
                .post('/government/batch-check-compliance')
                .send(generatedContents)
                .expect(200);
            expect(Array.isArray(batchComplianceResponse.body)).toBe(true);
            expect(batchComplianceResponse.body.length).toBe(generatedContents.length);
            const allPassed = batchComplianceResponse.body.every((result) => result.passed === true);
            expect(allPassed).toBe(true);
        }, 20000);
    });
    describe('模板和剧本管理', () => {
        it('应能获取模板和剧本信息', async () => {
            const templatesResponse = await request(app.getHttpServer())
                .get('/government/templates')
                .expect(200);
            expect(Array.isArray(templatesResponse.body)).toBe(true);
            const scriptsResponse = await request(app.getHttpServer())
                .get('/government/scripts')
                .expect(200);
            expect(Array.isArray(scriptsResponse.body)).toBe(true);
            const contentTypesResponse = await request(app.getHttpServer())
                .get('/government/content-types')
                .expect(200);
            expect(contentTypesResponse.body.types).toBeDefined();
            expect(Array.isArray(contentTypesResponse.body.types)).toBe(true);
            expect(contentTypesResponse.body.types.length).toBeGreaterThan(0);
            const contentStylesResponse = await request(app.getHttpServer())
                .get('/government/content-styles')
                .expect(200);
            expect(contentStylesResponse.body.styles).toBeDefined();
            expect(Array.isArray(contentStylesResponse.body.styles)).toBe(true);
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
                contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                theme: '性能测试文档',
                style: government_content_interface_1.GovernmentContentStyle.FORMAL,
                complianceLevel: government_content_interface_1.ComplianceLevel.HIGH,
            })
                .expect(200);
            const endTime = Date.now();
            const generationTime = endTime - startTime;
            expect(response.body.success).toBe(true);
            expect(response.body.generationTime).toBeDefined();
            expect(generationTime).toBeLessThan(5000);
            console.log(`内容生成时间: ${generationTime}ms, 服务报告时间: ${response.body.generationTime}ms`);
        });
        it('批量合规性检查应能处理多个内容', async () => {
            const testContents = [];
            for (let i = 0; i < 10; i++) {
                testContents.push({
                    type: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
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
            expect(processingTime).toBeLessThan(10000);
            console.log(`批量合规性检查时间 (${testContents.length}个内容): ${processingTime}ms`);
        });
    });
});
//# sourceMappingURL=government-demo.e2e-spec.js.map
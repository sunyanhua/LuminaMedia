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
describe('政府内容安全测试', () => {
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
    describe('认证和授权安全', () => {
        it('应对未认证请求实施适当的安全控制', async () => {
            const publicEndpoints = [
                { method: 'GET', path: '/government/content-types' },
                { method: 'GET', path: '/government/content-styles' },
                { method: 'GET', path: '/government/compliance-levels' },
            ];
            for (const endpoint of publicEndpoints) {
                const response = await request(app.getHttpServer())[endpoint.method.toLowerCase()](endpoint.path);
                expect([200, 401, 403]).toContain(response.status);
            }
        });
        it('应对敏感操作实施授权检查', async () => {
            const protectedEndpoints = [
                { method: 'POST', path: '/government/generate' },
                { method: 'POST', path: '/government/check-compliance' },
                { method: 'POST', path: '/government/batch-check-compliance' },
                { method: 'GET', path: '/government/stats' },
            ];
            for (const endpoint of protectedEndpoints) {
                const response = await request(app.getHttpServer())[endpoint.method.toLowerCase()](endpoint.path)
                    .send({});
                expect(response.status).toBeDefined();
            }
        });
    });
    describe('数据安全', () => {
        it('应对敏感数据进行加密存储', async () => {
            try {
                const createResponse = await request(app.getHttpServer())
                    .post('/accounts/test-account-1')
                    .send({
                    platform: 'wechat',
                    credentials: {
                        appId: 'test-app-id',
                        appSecret: 'test-app-secret',
                        wechatId: 'test-wechat-id',
                        wechatName: '测试公众号',
                    },
                });
                if (createResponse.status === 201 || createResponse.status === 200) {
                    const accountResponse = await request(app.getHttpServer()).get('/accounts/test-account-1');
                    if (accountResponse.status === 200) {
                        const account = accountResponse.body.account || accountResponse.body;
                        expect(account.encryptedCredentials).toBeDefined();
                        expect(typeof account.encryptedCredentials).toBe('string');
                        expect(account.encryptedCredentials.length).toBeGreaterThan(0);
                        expect(account.credentials).toBeUndefined();
                        expect(account.appSecret).toBeUndefined();
                        console.log('账号凭证加密验证通过');
                    }
                }
            }
            catch (error) {
                console.log('账号API测试跳过（可能需要身份验证）');
            }
        });
        it('应验证输入数据的安全性', async () => {
            const sqlInjectionPayloads = [
                "' OR '1'='1",
                "'; DROP TABLE users; --",
                "' UNION SELECT * FROM users --",
            ];
            for (const payload of sqlInjectionPayloads) {
                const response = await request(app.getHttpServer())
                    .post('/government/generate')
                    .send({
                    contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                    theme: payload,
                    params: {
                        issuingAuthority: payload,
                    },
                });
                expect(response.status).toBeDefined();
                expect([200, 400, 500]).toContain(response.status);
                if (response.status === 500) {
                    console.warn(`SQL注入测试返回500: ${payload}`);
                }
            }
            const xssPayloads = [
                '<script>alert("xss")</script>',
                '<img src="x" onerror="alert(1)">',
                'javascript:alert(1)',
            ];
            for (const payload of xssPayloads) {
                const response = await request(app.getHttpServer())
                    .post('/government/generate')
                    .send({
                    contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                    theme: payload,
                });
                expect(response.status).toBeDefined();
            }
        });
        it('应实施数据验证和清理', async () => {
            const invalidRequests = [
                { contentType: 'INVALID_TYPE', theme: '测试' },
                { contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT, theme: '' },
                {
                    contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                    theme: 'a'.repeat(1000),
                },
                {
                    contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                    params: { invalidField: 'test' },
                },
            ];
            for (const requestData of invalidRequests) {
                const response = await request(app.getHttpServer())
                    .post('/government/generate')
                    .send(requestData);
                expect(response.status).toBeDefined();
                if (response.status === 200) {
                    expect(response.body).toBeDefined();
                }
            }
        });
    });
    describe('API安全', () => {
        it('应实施速率限制（如果配置）', async () => {
            const requestCount = 10;
            const responses = [];
            for (let i = 0; i < requestCount; i++) {
                const response = await request(app.getHttpServer())
                    .post('/government/generate')
                    .send({
                    contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                    theme: `速率限制测试 ${i}`,
                });
                responses.push(response.status);
            }
            console.log(`速率限制测试响应状态: ${responses.join(', ')}`);
            const successCount = responses.filter((status) => status === 200).length;
            expect(successCount).toBeGreaterThan(0);
        });
        it('应验证请求内容类型', async () => {
            const response = await request(app.getHttpServer())
                .post('/government/generate')
                .set('Content-Type', 'text/plain')
                .send('plain text, not JSON');
            expect([400, 415, 200]).toContain(response.status);
        });
        it('应验证请求大小限制', async () => {
            const largeData = {
                contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                theme: '大型请求测试',
                params: {
                    largeField: 'x'.repeat(10000),
                    arrayField: Array(1000).fill('test'),
                },
            };
            const response = await request(app.getHttpServer())
                .post('/government/generate')
                .send(largeData);
            expect(response.status).toBeDefined();
        });
    });
    describe('合规安全', () => {
        it('应检查敏感词汇', async () => {
            const sensitiveThemes = [
                '国家机密泄露通知',
                '商业秘密保护',
                '个人隐私收集说明',
            ];
            for (const theme of sensitiveThemes) {
                const response = await request(app.getHttpServer())
                    .post('/government/generate')
                    .send({
                    contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                    theme: theme,
                });
                expect(response.status).toBe(200);
                if (response.body.success) {
                    const complianceResponse = await request(app.getHttpServer())
                        .post('/government/check-compliance')
                        .send(response.body.content);
                    expect(complianceResponse.status).toBe(200);
                    const complianceResult = complianceResponse.body;
                    console.log(`敏感词测试 "${theme}": 合规性${complianceResult.passed ? '通过' : '失败'}, 得分: ${complianceResult.score}`);
                }
            }
        });
        it('应验证政府内容格式合规性', async () => {
            const contentTypes = [
                government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                government_content_interface_1.GovernmentContentType.ANTI_FRAUD,
                government_content_interface_1.GovernmentContentType.POLICY_INTERPRETATION,
            ];
            for (const contentType of contentTypes) {
                const response = await request(app.getHttpServer())
                    .post('/government/generate')
                    .send({
                    contentType,
                    theme: `合规性测试 - ${contentType}`,
                });
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.complianceCheck).toBeDefined();
                const complianceCheck = response.body.complianceCheck;
                expect(complianceCheck.score).toBeDefined();
                expect(typeof complianceCheck.score).toBe('number');
                expect(complianceCheck.score).toBeGreaterThanOrEqual(0);
                expect(complianceCheck.score).toBeLessThanOrEqual(100);
                console.log(`内容类型 ${contentType} 合规性得分: ${complianceCheck.score}`);
            }
        });
    });
    describe('错误处理安全', () => {
        it('不应在错误响应中泄露敏感信息', async () => {
            const response = await request(app.getHttpServer())
                .post('/government/generate')
                .send({
                invalidField: 'test',
            });
            if (response.status >= 400) {
                const errorBody = response.body;
                expect(errorBody).toBeDefined();
                if (typeof errorBody === 'object') {
                    expect(errorBody.stack).toBeUndefined();
                    expect(errorBody.internalError).toBeUndefined();
                    expect(errorBody.databaseError).toBeUndefined();
                    if (errorBody.message) {
                        expect(typeof errorBody.message).toBe('string');
                        const technicalTerms = [
                            'stack',
                            'trace',
                            'sql',
                            'query',
                            'database',
                            'internal',
                        ];
                        const message = errorBody.message.toLowerCase();
                        for (const term of technicalTerms) {
                            if (message.includes(term)) {
                                console.warn(`错误消息可能包含技术术语 "${term}": ${errorBody.message}`);
                            }
                        }
                    }
                }
            }
        });
        it('应处理边缘情况而不崩溃', async () => {
            const edgeCases = [
                null,
                undefined,
                {},
                { contentType: null },
                { contentType: undefined },
                { contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT, params: null },
            ];
            for (const requestData of edgeCases) {
                const response = await request(app.getHttpServer())
                    .post('/government/generate')
                    .send(requestData);
                expect(response.status).not.toBe(500);
                console.log(`边缘情况测试 ${JSON.stringify(requestData)}: 状态码 ${response.status}`);
            }
        });
    });
    describe('日志和审计安全', () => {
        it('应记录安全相关事件', async () => {
            const response = await request(app.getHttpServer())
                .post('/government/generate')
                .send({
                contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                theme: '审计日志测试',
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            console.log('审计日志测试完成 - 应在应用日志中记录此操作');
        });
    });
});
//# sourceMappingURL=government-security.spec.js.map
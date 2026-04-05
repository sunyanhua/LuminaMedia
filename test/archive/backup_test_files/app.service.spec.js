"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_service_1 = require("./app.service");
describe('AppService', () => {
    let appService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [app_service_1.AppService],
        }).compile();
        appService = module.get(app_service_1.AppService);
    });
    it('should be defined', () => {
        expect(appService).toBeDefined();
    });
    describe('getHello', () => {
        it('should return "Hello World!"', () => {
            expect(appService.getHello()).toBe('Hello World!');
        });
    });
});
//# sourceMappingURL=app.service.spec.js.map
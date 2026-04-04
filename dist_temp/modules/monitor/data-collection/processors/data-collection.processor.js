"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DataCollectionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCollectionProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let DataCollectionProcessor = DataCollectionProcessor_1 = class DataCollectionProcessor {
    logger = new common_1.Logger(DataCollectionProcessor_1.name);
    async handleCollectionJob(job) {
        this.logger.log(`Processing collection job: ${job.id}`);
        await job.progress(50);
        this.logger.log(`Job ${job.id} completed`);
        return { success: true, message: 'Data collection completed' };
    }
};
exports.DataCollectionProcessor = DataCollectionProcessor;
__decorate([
    (0, bull_1.Process)('collect-data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataCollectionProcessor.prototype, "handleCollectionJob", null);
exports.DataCollectionProcessor = DataCollectionProcessor = DataCollectionProcessor_1 = __decorate([
    (0, bull_1.Processor)('data-collection')
], DataCollectionProcessor);
//# sourceMappingURL=data-collection.processor.js.map
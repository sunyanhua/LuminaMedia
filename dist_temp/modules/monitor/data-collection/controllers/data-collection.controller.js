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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCollectionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let DataCollectionController = class DataCollectionController {
    healthCheck() {
        return { status: 'ok' };
    }
    getTasks() {
        return [];
    }
    createTask(task) {
        return { id: 'mock-id', ...task };
    }
    getTask(taskId) {
        return { id: taskId };
    }
};
exports.DataCollectionController = DataCollectionController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: '数据采集服务健康检查' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DataCollectionController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('tasks'),
    (0, swagger_1.ApiOperation)({ summary: '获取数据采集任务列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DataCollectionController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Post)('tasks'),
    (0, swagger_1.ApiOperation)({ summary: '创建数据采集任务' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DataCollectionController.prototype, "createTask", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId'),
    (0, swagger_1.ApiOperation)({ summary: '获取数据采集任务详情' }),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DataCollectionController.prototype, "getTask", null);
exports.DataCollectionController = DataCollectionController = __decorate([
    (0, swagger_1.ApiTags)('data-collection'),
    (0, common_1.Controller)('data-collection')
], DataCollectionController);
//# sourceMappingURL=data-collection.controller.js.map
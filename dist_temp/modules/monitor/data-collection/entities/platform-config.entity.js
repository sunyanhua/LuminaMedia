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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformConfig = void 0;
const typeorm_1 = require("typeorm");
const data_collection_interface_1 = require("../interfaces/data-collection.interface");
let PlatformConfig = class PlatformConfig {
    id;
    tenantId;
    platform;
    primaryMethod;
    credentials;
    config;
    isActive;
    successCount;
    failureCount;
    lastSuccessAt;
    lastFailureAt;
    lastErrorMessage;
    successRate;
    totalCollected;
    lastCollectionAt;
    apiLimits;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
};
exports.PlatformConfig = PlatformConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PlatformConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], PlatformConfig.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: data_collection_interface_1.PlatformType,
    }),
    __metadata("design:type", String)
], PlatformConfig.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: data_collection_interface_1.CollectionMethod,
        default: data_collection_interface_1.CollectionMethod.API,
    }),
    __metadata("design:type", String)
], PlatformConfig.prototype, "primaryMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], PlatformConfig.prototype, "credentials", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: {} }),
    __metadata("design:type", Object)
], PlatformConfig.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PlatformConfig.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PlatformConfig.prototype, "successCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PlatformConfig.prototype, "failureCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PlatformConfig.prototype, "lastSuccessAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PlatformConfig.prototype, "lastFailureAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PlatformConfig.prototype, "lastErrorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], PlatformConfig.prototype, "successRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PlatformConfig.prototype, "totalCollected", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PlatformConfig.prototype, "lastCollectionAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], PlatformConfig.prototype, "apiLimits", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PlatformConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PlatformConfig.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PlatformConfig.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PlatformConfig.prototype, "updatedBy", void 0);
exports.PlatformConfig = PlatformConfig = __decorate([
    (0, typeorm_1.Entity)('platform_configs'),
    (0, typeorm_1.Index)(['platform', 'tenantId'], { unique: true })
], PlatformConfig);
//# sourceMappingURL=platform-config.entity.js.map
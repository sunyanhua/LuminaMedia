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
exports.DataQualityRule = void 0;
const typeorm_1 = require("typeorm");
let DataQualityRule = class DataQualityRule {
    id;
    name;
    tableName;
    fieldName;
    condition;
    threshold;
    severity;
    description;
    isActive;
    schedule;
    createdAt;
    updatedAt;
};
exports.DataQualityRule = DataQualityRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DataQualityRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], DataQualityRule.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'table_name', length: 100 }),
    __metadata("design:type", String)
], DataQualityRule.prototype, "tableName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'field_name', length: 100, nullable: true }),
    __metadata("design:type", Object)
], DataQualityRule.prototype, "fieldName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DataQualityRule.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 3 }),
    __metadata("design:type", Number)
], DataQualityRule.prototype, "threshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], DataQualityRule.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DataQualityRule.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], DataQualityRule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], DataQualityRule.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DataQualityRule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DataQualityRule.prototype, "updatedAt", void 0);
exports.DataQualityRule = DataQualityRule = __decorate([
    (0, typeorm_1.Entity)('data_quality_rules')
], DataQualityRule);
//# sourceMappingURL=data-quality-rule.entity.js.map
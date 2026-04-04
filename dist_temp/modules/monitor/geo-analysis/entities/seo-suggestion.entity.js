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
exports.SeoSuggestion = exports.ImplementationStatus = exports.PriorityLevel = exports.SuggestionType = void 0;
const typeorm_1 = require("typeorm");
var SuggestionType;
(function (SuggestionType) {
    SuggestionType["KEYWORD"] = "keyword";
    SuggestionType["CONTENT"] = "content";
    SuggestionType["TECHNICAL"] = "technical";
    SuggestionType["LOCAL"] = "local";
    SuggestionType["LINK"] = "link";
})(SuggestionType || (exports.SuggestionType = SuggestionType = {}));
var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel["LOW"] = "low";
    PriorityLevel["MEDIUM"] = "medium";
    PriorityLevel["HIGH"] = "high";
    PriorityLevel["CRITICAL"] = "critical";
})(PriorityLevel || (exports.PriorityLevel = PriorityLevel = {}));
var ImplementationStatus;
(function (ImplementationStatus) {
    ImplementationStatus["PENDING"] = "pending";
    ImplementationStatus["IN_PROGRESS"] = "in_progress";
    ImplementationStatus["COMPLETED"] = "completed";
    ImplementationStatus["DEFERRED"] = "deferred";
    ImplementationStatus["CANCELLED"] = "cancelled";
})(ImplementationStatus || (exports.ImplementationStatus = ImplementationStatus = {}));
let SeoSuggestion = class SeoSuggestion {
    id;
    tenantId;
    customerProfileId;
    targetRegionId;
    targetRegionName;
    suggestionType;
    title;
    description;
    details;
    rationale;
    expectedBenefits;
    implementationPlan;
    priority;
    expectedImpact;
    implementationDifficulty;
    roiScore;
    implementationStatus;
    implementationStartDate;
    implementationEndDate;
    implementedBy;
    implementationNotes;
    actualResults;
    actualRoi;
    isRecurring;
    recurrencePattern;
    nextRecurrenceDate;
    tags;
    isActive;
    relatedSuggestions;
    attachments;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
};
exports.SeoSuggestion = SeoSuggestion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "customerProfileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "targetRegionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "targetRegionName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SuggestionType,
    }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "suggestionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SeoSuggestion.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SeoSuggestion.prototype, "rationale", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SeoSuggestion.prototype, "expectedBenefits", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SeoSuggestion.prototype, "implementationPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PriorityLevel,
        default: PriorityLevel.MEDIUM,
    }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], SeoSuggestion.prototype, "expectedImpact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], SeoSuggestion.prototype, "implementationDifficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], SeoSuggestion.prototype, "roiScore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ImplementationStatus,
        default: ImplementationStatus.PENDING,
    }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "implementationStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SeoSuggestion.prototype, "implementationStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SeoSuggestion.prototype, "implementationEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "implementedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "implementationNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SeoSuggestion.prototype, "actualResults", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], SeoSuggestion.prototype, "actualRoi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SeoSuggestion.prototype, "isRecurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "recurrencePattern", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SeoSuggestion.prototype, "nextRecurrenceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], SeoSuggestion.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SeoSuggestion.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], SeoSuggestion.prototype, "relatedSuggestions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], SeoSuggestion.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SeoSuggestion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SeoSuggestion.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SeoSuggestion.prototype, "updatedBy", void 0);
exports.SeoSuggestion = SeoSuggestion = __decorate([
    (0, typeorm_1.Entity)('seo_suggestions'),
    (0, typeorm_1.Index)(['tenantId', 'customerProfileId', 'suggestionType']),
    (0, typeorm_1.Index)(['tenantId', 'targetRegionId']),
    (0, typeorm_1.Index)(['tenantId', 'priority']),
    (0, typeorm_1.Index)(['tenantId', 'implementationStatus']),
    (0, typeorm_1.Index)(['tenantId', 'expectedImpact']),
    (0, typeorm_1.Index)(['tenantId', 'createdAt'])
], SeoSuggestion);
//# sourceMappingURL=seo-suggestion.entity.js.map
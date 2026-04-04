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
exports.CustomerSegment = void 0;
const typeorm_1 = require("typeorm");
const customer_profile_entity_1 = require("./customer-profile.entity");
let CustomerSegment = class CustomerSegment {
    id;
    tenantId;
    customerProfileId;
    customerProfile;
    segmentName;
    description;
    criteria;
    memberCount;
    memberIds;
    segmentInsights;
    createdAt;
    updatedAt;
};
exports.CustomerSegment = CustomerSegment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerSegment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], CustomerSegment.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_profile_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], CustomerSegment.prototype, "customerProfileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_profile_entity_1.CustomerProfile, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_profile_id' }),
    __metadata("design:type", customer_profile_entity_1.CustomerProfile)
], CustomerSegment.prototype, "customerProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'segment_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], CustomerSegment.prototype, "segmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CustomerSegment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'criteria', type: 'json' }),
    __metadata("design:type", Object)
], CustomerSegment.prototype, "criteria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'member_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CustomerSegment.prototype, "memberCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'member_ids', type: 'json', nullable: true }),
    __metadata("design:type", Array)
], CustomerSegment.prototype, "memberIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'segment_insights', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], CustomerSegment.prototype, "segmentInsights", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CustomerSegment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'updated_at', nullable: true }),
    __metadata("design:type", Date)
], CustomerSegment.prototype, "updatedAt", void 0);
exports.CustomerSegment = CustomerSegment = __decorate([
    (0, typeorm_1.Entity)('customer_segments'),
    (0, typeorm_1.Index)(['customerProfileId', 'segmentName']),
    (0, typeorm_1.Index)(['tenantId'])
], CustomerSegment);
//# sourceMappingURL=customer-segment.entity.js.map
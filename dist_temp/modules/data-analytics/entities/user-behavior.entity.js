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
exports.UserBehavior = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../../entities/user.entity");
const user_behavior_event_enum_1 = require("../../../shared/enums/user-behavior-event.enum");
let UserBehavior = class UserBehavior {
    id;
    userId;
    user;
    sessionId;
    eventType;
    eventData;
    tenantId;
    timestamp;
};
exports.UserBehavior = UserBehavior;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserBehavior.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], UserBehavior.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserBehavior.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id', type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], UserBehavior.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'event_type',
        type: 'enum',
        enum: user_behavior_event_enum_1.UserBehaviorEvent,
    }),
    __metadata("design:type", String)
], UserBehavior.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UserBehavior.prototype, "eventData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], UserBehavior.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserBehavior.prototype, "timestamp", void 0);
exports.UserBehavior = UserBehavior = __decorate([
    (0, typeorm_1.Entity)('user_behaviors'),
    (0, typeorm_1.Index)(['userId', 'timestamp']),
    (0, typeorm_1.Index)(['sessionId']),
    (0, typeorm_1.Index)(['eventType']),
    (0, typeorm_1.Index)(['tenantId'])
], UserBehavior);
//# sourceMappingURL=user-behavior.entity.js.map
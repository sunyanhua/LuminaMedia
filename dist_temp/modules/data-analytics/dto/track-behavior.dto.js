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
exports.TrackBehaviorDto = void 0;
const class_validator_1 = require("class-validator");
const user_behavior_event_enum_1 = require("../../../shared/enums/user-behavior-event.enum");
class TrackBehaviorDto {
    userId;
    sessionId;
    eventType;
    eventData;
}
exports.TrackBehaviorDto = TrackBehaviorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackBehaviorDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackBehaviorDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(user_behavior_event_enum_1.UserBehaviorEvent),
    __metadata("design:type", String)
], TrackBehaviorDto.prototype, "eventType", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], TrackBehaviorDto.prototype, "eventData", void 0);
//# sourceMappingURL=track-behavior.dto.js.map
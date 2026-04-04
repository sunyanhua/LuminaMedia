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
exports.UpdateCustomerProfileDto = void 0;
const class_validator_1 = require("class-validator");
const customer_type_enum_1 = require("../../../shared/enums/customer-type.enum");
const industry_enum_1 = require("../../../shared/enums/industry.enum");
class UpdateCustomerProfileDto {
    customerName;
    customerType;
    industry;
    dataSources;
    profileData;
    behaviorInsights;
}
exports.UpdateCustomerProfileDto = UpdateCustomerProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(customer_type_enum_1.CustomerType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "customerType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(industry_enum_1.Industry),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateCustomerProfileDto.prototype, "dataSources", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateCustomerProfileDto.prototype, "profileData", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateCustomerProfileDto.prototype, "behaviorInsights", void 0);
//# sourceMappingURL=update-customer-profile.dto.js.map
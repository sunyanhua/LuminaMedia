"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldMappingModule = void 0;
const common_1 = require("@nestjs/common");
const field_mapping_service_1 = require("./field-mapping.service");
const field_mapping_controller_1 = require("./field-mapping.controller");
const data_analytics_module_1 = require("../../data-analytics/data-analytics.module");
let FieldMappingModule = class FieldMappingModule {
};
exports.FieldMappingModule = FieldMappingModule;
exports.FieldMappingModule = FieldMappingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            data_analytics_module_1.DataAnalyticsModule,
        ],
        controllers: [field_mapping_controller_1.FieldMappingController],
        providers: [field_mapping_service_1.FieldMappingService],
        exports: [field_mapping_service_1.FieldMappingService],
    })
], FieldMappingModule);
//# sourceMappingURL=field-mapping.module.js.map
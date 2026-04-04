"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataEngineModule = void 0;
const common_1 = require("@nestjs/common");
const data_import_module_1 = require("./import/data-import.module");
const field_mapping_module_1 = require("./field-mapping/field-mapping.module");
const tag_calculation_module_1 = require("./tag-calculation/tag-calculation.module");
const user_profile_module_1 = require("./user-profile/user-profile.module");
const data_quality_monitor_module_1 = require("./data-quality-monitor/data-quality-monitor.module");
let DataEngineModule = class DataEngineModule {
};
exports.DataEngineModule = DataEngineModule;
exports.DataEngineModule = DataEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            data_import_module_1.DataImportModule,
            field_mapping_module_1.FieldMappingModule,
            tag_calculation_module_1.TagCalculationModule,
            user_profile_module_1.UserProfileModule,
            data_quality_monitor_module_1.DataQualityMonitorModule,
        ],
        controllers: [],
        providers: [],
        exports: [
            data_import_module_1.DataImportModule,
            field_mapping_module_1.FieldMappingModule,
            tag_calculation_module_1.TagCalculationModule,
            user_profile_module_1.UserProfileModule,
            data_quality_monitor_module_1.DataQualityMonitorModule,
        ],
    })
], DataEngineModule);
//# sourceMappingURL=data-engine.module.js.map
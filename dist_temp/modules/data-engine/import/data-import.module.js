"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataImportModule = void 0;
const common_1 = require("@nestjs/common");
const excel_parser_service_1 = require("./excel-parser.service");
const api_data_receiver_service_1 = require("./api-data-receiver.service");
let DataImportModule = class DataImportModule {
};
exports.DataImportModule = DataImportModule;
exports.DataImportModule = DataImportModule = __decorate([
    (0, common_1.Module)({
        providers: [excel_parser_service_1.ExcelParserService, api_data_receiver_service_1.ApiDataReceiverService],
        exports: [excel_parser_service_1.ExcelParserService, api_data_receiver_service_1.ApiDataReceiverService],
    })
], DataImportModule);
//# sourceMappingURL=data-import.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeiboCollectorService = void 0;
const common_1 = require("@nestjs/common");
const data_collection_interface_1 = require("../../interfaces/data-collection.interface");
let WeiboCollectorService = class WeiboCollectorService {
    getPlatform() {
        return data_collection_interface_1.PlatformType.WEIBO;
    }
    getSupportedMethods() {
        return [data_collection_interface_1.CollectionMethod.API, data_collection_interface_1.CollectionMethod.CRAWLER];
    }
    async validateCredentials(credentials) {
        return !!credentials.accessToken;
    }
    async collect(data) {
        return [];
    }
    async testConnection(credentials) {
        return {
            success: true,
            message: 'Connection test not implemented yet',
        };
    }
};
exports.WeiboCollectorService = WeiboCollectorService;
exports.WeiboCollectorService = WeiboCollectorService = __decorate([
    (0, common_1.Injectable)()
], WeiboCollectorService);
//# sourceMappingURL=weibo-collector.service.js.map
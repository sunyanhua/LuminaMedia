"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformCollectorFactory = void 0;
const common_1 = require("@nestjs/common");
let PlatformCollectorFactory = class PlatformCollectorFactory {
    collectors = new Map();
    registerCollector(platform, collector) {
        this.collectors.set(platform, collector);
    }
    getCollector(platform) {
        const collector = this.collectors.get(platform);
        if (!collector) {
            throw new Error(`No collector registered for platform: ${platform}`);
        }
        return collector;
    }
    getAvailablePlatforms() {
        return Array.from(this.collectors.keys());
    }
};
exports.PlatformCollectorFactory = PlatformCollectorFactory;
exports.PlatformCollectorFactory = PlatformCollectorFactory = __decorate([
    (0, common_1.Injectable)()
], PlatformCollectorFactory);
//# sourceMappingURL=platform-collector.factory.js.map
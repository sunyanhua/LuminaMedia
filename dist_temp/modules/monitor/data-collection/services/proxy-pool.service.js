"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyPoolService = void 0;
const common_1 = require("@nestjs/common");
let ProxyPoolService = class ProxyPoolService {
    proxies = [];
    addProxy(proxy) {
        this.proxies.push(proxy);
    }
    getProxy() {
        return this.proxies.length > 0 ? this.proxies[0] : null;
    }
    rotateProxy() {
        if (this.proxies.length > 1) {
            const first = this.proxies.shift();
            if (first)
                this.proxies.push(first);
        }
    }
    getProxyStats() {
        return {
            total: this.proxies.length,
            available: this.proxies.length,
        };
    }
};
exports.ProxyPoolService = ProxyPoolService;
exports.ProxyPoolService = ProxyPoolService = __decorate([
    (0, common_1.Injectable)()
], ProxyPoolService);
//# sourceMappingURL=proxy-pool.service.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAdapter = exports.PrivateDeployAdapter = exports.AliCloudAdapter = void 0;
__exportStar(require("./cloud-provider.interface"), exports);
__exportStar(require("./cloud-provider.factory"), exports);
var alicloud_adapter_1 = require("./adapters/alicloud.adapter");
Object.defineProperty(exports, "AliCloudAdapter", { enumerable: true, get: function () { return alicloud_adapter_1.AliCloudAdapter; } });
var private_deploy_adapter_1 = require("./adapters/private-deploy.adapter");
Object.defineProperty(exports, "PrivateDeployAdapter", { enumerable: true, get: function () { return private_deploy_adapter_1.PrivateDeployAdapter; } });
var mock_adapter_1 = require("./adapters/mock.adapter");
Object.defineProperty(exports, "MockAdapter", { enumerable: true, get: function () { return mock_adapter_1.MockAdapter; } });
//# sourceMappingURL=index.js.map
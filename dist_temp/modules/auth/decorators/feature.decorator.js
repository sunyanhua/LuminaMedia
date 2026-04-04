"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feature = void 0;
const common_1 = require("@nestjs/common");
const Feature = (...features) => (0, common_1.SetMetadata)('features', features);
exports.Feature = Feature;
//# sourceMappingURL=feature.decorator.js.map
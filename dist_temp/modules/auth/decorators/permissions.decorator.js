"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permissions = void 0;
const common_1 = require("@nestjs/common");
const permissions_guard_1 = require("../guards/permissions.guard");
const Permissions = (...permissions) => (0, common_1.SetMetadata)(permissions_guard_1.PERMISSIONS_KEY, permissions);
exports.Permissions = Permissions;
//# sourceMappingURL=permissions.decorator.js.map
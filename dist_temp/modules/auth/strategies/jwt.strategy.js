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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_role_entity_1 = require("../../../entities/user-role.entity");
const role_entity_1 = require("../../../entities/role.entity");
const user_entity_1 = require("../../../entities/user.entity");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    configService;
    userRepository;
    userRoleRepository;
    roleRepository;
    constructor(configService, userRepository, userRoleRepository, roleRepository) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET', 'your-secret-key'),
        });
        this.configService = configService;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
    }
    async validate(payload) {
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
            select: ['id', 'username', 'email', 'tenantId'],
        });
        if (!user) {
            return null;
        }
        const userRoles = await this.userRoleRepository.find({
            where: { userId: user.id },
            relations: ['role'],
        });
        const roleIds = userRoles.map((ur) => ur.roleId);
        const roles = await this.roleRepository.find({
            where: { id: (0, typeorm_2.In)(roleIds) },
            relations: ['permissions'],
        });
        const permissions = [];
        roles.forEach((role) => {
            if (role.permissions) {
                role.permissions.forEach((permission) => {
                    permissions.push({
                        id: permission.id,
                        module: permission.module,
                        action: permission.action,
                    });
                });
            }
        });
        const uniquePermissions = Array.from(new Map(permissions.map((p) => [`${p.module}:${p.action}`, p])).values());
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            tenantId: user.tenantId,
            roles: roles.map((role) => ({
                id: role.id,
                name: role.name,
                description: role.description,
            })),
            permissions: uniquePermissions,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(3, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map
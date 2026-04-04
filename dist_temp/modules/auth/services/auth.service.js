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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../../../entities/user.entity");
const tenant_context_service_1 = require("../../../shared/services/tenant-context.service");
let AuthService = class AuthService {
    userRepository;
    jwtService;
    tenantContextService;
    constructor(userRepository, jwtService, tenantContextService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.tenantContextService = tenantContextService;
    }
    async validateUser(username, password) {
        const tenantId = this.tenantContextService.getCurrentTenantId();
        const user = await this.userRepository.findOne({
            where: { username, tenantId },
            select: ['id', 'username', 'passwordHash', 'email', 'tenantId'],
        });
        if (user &&
            (await bcrypt.compare(password, user.passwordHash))) {
            const { passwordHash: __, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            tenantId: user.tenantId,
        };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                tenantId: user.tenantId,
            },
        };
    }
    async register(registerDto) {
        const tenantId = registerDto.tenantId || this.tenantContextService.getCurrentTenantId();
        const existingUser = await this.userRepository.findOne({
            where: { username: registerDto.username, tenantId },
        });
        if (existingUser) {
            throw new common_1.ConflictException('用户名已存在');
        }
        const existingEmail = await this.userRepository.findOne({
            where: { email: registerDto.email, tenantId },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('邮箱已被注册');
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(registerDto.password, salt);
        const user = this.userRepository.create({
            username: registerDto.username,
            passwordHash,
            email: registerDto.email,
            tenantId,
        });
        const savedUser = await this.userRepository.save(user);
        const payload = {
            sub: savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
            tenantId: savedUser.tenantId,
        };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
            user: {
                id: savedUser.id,
                username: savedUser.username,
                email: savedUser.email,
                tenantId: savedUser.tenantId,
            },
        };
    }
    async refreshToken(refreshTokenDto) {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refresh_token);
            const user = await this.userRepository.findOne({
                where: { id: payload.sub, tenantId: payload.tenantId },
                select: ['id', 'username', 'email', 'tenantId'],
            });
            if (!user) {
                throw new common_1.UnauthorizedException('用户不存在');
            }
            const newPayload = {
                sub: user.id,
                username: user.username,
                email: user.email,
                tenantId: user.tenantId,
            };
            return {
                access_token: this.jwtService.sign(newPayload),
                refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
            };
        }
        catch (_error) {
            throw new common_1.UnauthorizedException('无效的刷新令牌');
        }
    }
    async getProfile(userId) {
        const tenantId = this.tenantContextService.getCurrentTenantId();
        const user = await this.userRepository.findOne({
            where: { id: userId, tenantId },
            select: ['id', 'username', 'email', 'tenantId', 'createdAt'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        tenant_context_service_1.TenantContextService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../../../entities/user.entity");
const tenant_context_service_1 = require("../../../shared/services/tenant-context.service");
let UserService = class UserService {
    userRepository;
    tenantContextService;
    constructor(userRepository, tenantContextService) {
        this.userRepository = userRepository;
        this.tenantContextService = tenantContextService;
    }
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }
    async findAll(page = 1, limit = 10) {
        const tenantId = this.tenantContextService.getCurrentTenantId();
        const [data, total] = await this.userRepository.findAndCount({
            where: { tenantId },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total };
    }
    async findOne(id) {
        const tenantId = this.tenantContextService.getCurrentTenantId();
        const user = await this.userRepository.findOne({
            where: { id, tenantId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`用户 ${id} 不存在或不属于当前租户`);
        }
        return user;
    }
    async create(createUserDto) {
        const tenantId = this.tenantContextService.getCurrentTenantId();
        const existingUser = await this.userRepository.findOne({
            where: { username: createUserDto.username, tenantId },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('用户名已存在');
        }
        const existingEmail = await this.userRepository.findOne({
            where: { email: createUserDto.email, tenantId },
        });
        if (existingEmail) {
            throw new common_1.BadRequestException('邮箱已存在');
        }
        const hashedPassword = await this.hashPassword(createUserDto.password);
        const user = this.userRepository.create({
            ...createUserDto,
            tenantId,
            passwordHash: hashedPassword,
        });
        return await this.userRepository.save(user);
    }
    async update(id, updateUserDto) {
        const tenantId = this.tenantContextService.getCurrentTenantId();
        const user = await this.userRepository.findOne({
            where: { id, tenantId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`用户 ${id} 不存在或不属于当前租户`);
        }
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const existingUser = await this.userRepository.findOne({
                where: { username: updateUserDto.username, tenantId },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('用户名已存在');
            }
        }
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingEmail = await this.userRepository.findOne({
                where: { email: updateUserDto.email, tenantId },
            });
            if (existingEmail) {
                throw new common_1.BadRequestException('邮箱已存在');
            }
        }
        Object.assign(user, updateUserDto);
        if (updateUserDto.password) {
            user.passwordHash = await this.hashPassword(updateUserDto.password);
        }
        return await this.userRepository.save(user);
    }
    async delete(id) {
        const tenantId = this.tenantContextService.getCurrentTenantId();
        const result = await this.userRepository.delete({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`用户 ${id} 不存在或不属于当前租户`);
        }
    }
    async findByUsername(username) {
        const tenantId = this.tenantContextService.getCurrentTenantId();
        return await this.userRepository.findOne({
            where: { username, tenantId },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_context_service_1.TenantContextService])
], UserService);
//# sourceMappingURL=user.service.js.map
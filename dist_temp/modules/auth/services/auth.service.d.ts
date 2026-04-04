import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { User } from '../../../entities/user.entity';
import { TenantContextService } from '../../../shared/services/tenant-context.service';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private tenantContextService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, tenantContextService: TenantContextService);
    validateUser(username: string, password: string): Promise<Omit<User, 'passwordHash'> | null>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            username: string;
            email: string;
            tenantId: string;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            username: string;
            email: string;
            tenantId: string;
        };
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    getProfile(userId: string): Promise<User>;
}

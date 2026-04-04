import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserRole } from '../../../entities/user-role.entity';
import { Role } from '../../../entities/role.entity';
import { User } from '../../../entities/user.entity';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userRepository;
    private userRoleRepository;
    private roleRepository;
    constructor(configService: ConfigService, userRepository: Repository<User>, userRoleRepository: Repository<UserRole>, roleRepository: Repository<Role>);
    validate(payload: {
        sub: string;
    }): Promise<{
        id: string;
        username: string;
        email: string;
        tenantId: string;
        roles: {
            id: string;
            name: string;
            description: string;
        }[];
        permissions: {
            id: string;
            module: string;
            action: string;
        }[];
    } | null>;
}
export {};

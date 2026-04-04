import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { TenantContextService } from '../../../shared/services/tenant-context.service';
export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
}
export interface UpdateUserDto {
    username?: string;
    email?: string;
    password?: string;
}
export declare class UserService {
    private userRepository;
    private tenantContextService;
    constructor(userRepository: Repository<User>, tenantContextService: TenantContextService);
    private hashPassword;
    findAll(page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
    }>;
    findOne(id: string): Promise<User>;
    create(createUserDto: CreateUserDto): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    delete(id: string): Promise<void>;
    findByUsername(username: string): Promise<User | null>;
}

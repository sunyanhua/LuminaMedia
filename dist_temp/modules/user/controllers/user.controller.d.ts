import { UserService } from '../services/user.service';
import type { CreateUserDto, UpdateUserDto } from '../services/user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(page: number, limit: number): Promise<{
        data: import("../../../entities/user.entity").User[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../../../entities/user.entity").User>;
    create(createUserDto: CreateUserDto): Promise<import("../../../entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("../../../entities/user.entity").User>;
    delete(id: string): Promise<{
        message: string;
    }>;
}

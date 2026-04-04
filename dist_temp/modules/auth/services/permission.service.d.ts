import { Repository } from 'typeorm';
import { Permission } from '../../../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
export declare class PermissionService {
    private permissionRepository;
    constructor(permissionRepository: Repository<Permission>);
    findAll(tenantId: string): Promise<Permission[]>;
    findOne(id: string, tenantId: string): Promise<Permission>;
    create(createPermissionDto: CreatePermissionDto, tenantId: string): Promise<Permission>;
    update(id: string, updatePermissionDto: UpdatePermissionDto, tenantId: string): Promise<Permission>;
    remove(id: string, tenantId: string): Promise<void>;
    findByModule(module: string, tenantId: string): Promise<Permission[]>;
}

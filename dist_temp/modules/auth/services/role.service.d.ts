import { Repository } from 'typeorm';
import { Role } from '../../../entities/role.entity';
import { Permission } from '../../../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';
export declare class RoleService {
    private roleRepository;
    private permissionRepository;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>);
    findAll(tenantId: string): Promise<Role[]>;
    findOne(id: string, tenantId: string): Promise<Role>;
    create(createRoleDto: CreateRoleDto, tenantId: string): Promise<Role>;
    update(id: string, updateRoleDto: UpdateRoleDto, tenantId: string): Promise<Role>;
    remove(id: string, tenantId: string): Promise<void>;
    assignPermissions(id: string, assignPermissionsDto: AssignPermissionsDto, tenantId: string): Promise<Role>;
    getPermissions(id: string, tenantId: string): Promise<Permission[]>;
}

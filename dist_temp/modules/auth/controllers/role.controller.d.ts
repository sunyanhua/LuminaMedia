import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';
import { Role } from '../../../entities/role.entity';
import { Permission } from '../../../entities/permission.entity';
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
    findAll(req: {
        user: {
            tenantId: string;
        };
    }): Promise<Role[]>;
    findOne(id: string, req: {
        user: {
            tenantId: string;
        };
    }): Promise<Role>;
    create(createRoleDto: CreateRoleDto, req: {
        user: {
            tenantId: string;
        };
    }): Promise<Role>;
    update(id: string, updateRoleDto: UpdateRoleDto, req: {
        user: {
            tenantId: string;
        };
    }): Promise<Role>;
    remove(id: string, req: {
        user: {
            tenantId: string;
        };
    }): Promise<void>;
    assignPermissions(id: string, assignPermissionsDto: AssignPermissionsDto, req: {
        user: {
            tenantId: string;
        };
    }): Promise<Role>;
    getPermissions(id: string, req: {
        user: {
            tenantId: string;
        };
    }): Promise<Permission[]>;
}

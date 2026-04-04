import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { Permission } from '../../../entities/permission.entity';
export declare class PermissionController {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
    findAll(req: {
        user: {
            tenantId: string;
        };
    }): Promise<Permission[]>;
    findByModule(module: string, req: {
        user: {
            tenantId: string;
        };
    }): Promise<Permission[]>;
    findOne(id: string, req: {
        user: {
            tenantId: string;
        };
    }): Promise<Permission>;
    create(createPermissionDto: CreatePermissionDto, req: {
        user: {
            tenantId: string;
        };
    }): Promise<Permission>;
    update(id: string, updatePermissionDto: UpdatePermissionDto, req: {
        user: {
            tenantId: string;
        };
    }): Promise<Permission>;
    remove(id: string, req: {
        user: {
            tenantId: string;
        };
    }): Promise<void>;
}

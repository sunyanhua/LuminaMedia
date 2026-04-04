import { Repository } from 'typeorm';
import { Tenant, TenantStatus, TenantType } from '../../../entities/tenant.entity';
export interface CreateTenantDto {
    name: string;
    status?: TenantStatus;
    tenantType?: TenantType;
}
export interface UpdateTenantDto {
    name?: string;
    status?: TenantStatus;
    tenantType?: TenantType;
}
export declare class TenantService {
    private tenantRepository;
    constructor(tenantRepository: Repository<Tenant>);
    create(createTenantDto: CreateTenantDto): Promise<Tenant>;
    findAll(): Promise<Tenant[]>;
    findOne(id: string): Promise<Tenant>;
    update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant>;
    remove(id: string): Promise<void>;
    activate(id: string): Promise<Tenant>;
    suspend(id: string): Promise<Tenant>;
}

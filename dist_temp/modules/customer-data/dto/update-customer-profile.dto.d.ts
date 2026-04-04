import { CustomerType } from '../../../shared/enums/customer-type.enum';
import { Industry } from '../../../shared/enums/industry.enum';
export declare class UpdateCustomerProfileDto {
    customerName?: string;
    customerType?: CustomerType;
    industry?: Industry;
    dataSources?: Record<string, any>;
    profileData?: Record<string, any>;
    behaviorInsights?: Record<string, any>;
}

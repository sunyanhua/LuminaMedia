import { PartialType } from '@nestjs/swagger';
import { CreateDataQualityRuleDto } from './create-data-quality-rule.dto';

export class UpdateDataQualityRuleDto extends PartialType(
  CreateDataQualityRuleDto,
) {}

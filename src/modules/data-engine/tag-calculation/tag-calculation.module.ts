import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagCalculatorService } from './tag-calculation.service';
import { TagCalculationController } from './tag-calculation.controller';
import { CustomerProfile } from '../../../entities/customer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerProfile])],
  controllers: [TagCalculationController],
  providers: [TagCalculatorService],
  exports: [TagCalculatorService],
})
export class TagCalculationModule {}

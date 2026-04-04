import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovernmentContent } from '../../entities/government-content.entity';
import { SocialInteraction } from '../../entities/social-interaction.entity';
import { CustomerProfile } from '../../entities/customer-profile.entity';
import { GovernmentDemoService } from './services/government-demo.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GovernmentContent, SocialInteraction, CustomerProfile]),
    AuthModule,
  ],
  providers: [
    GovernmentDemoService,
  ],
  exports: [
    GovernmentDemoService,
  ],
})
export class GovernmentModule {}
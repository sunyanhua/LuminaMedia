import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PublishModule } from '../publish/publish.module';
import { ReviewRecord } from '../../entities/review-record.entity';
import { ContentDraft } from '../../entities/content-draft.entity';
import { User } from '../../entities/user.entity';
import { ReviewService } from './services/review.service';
import { ReviewController } from './controllers/review.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewRecord, ContentDraft, User]),
    AuthModule,
    forwardRef(() => PublishModule),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
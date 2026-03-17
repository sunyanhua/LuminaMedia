import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { UserBehaviorEvent } from '../../../shared/enums/user-behavior-event.enum';

export class TrackBehaviorDto {
  @IsString()
  userId: string;

  @IsString()
  sessionId: string;

  @IsEnum(UserBehaviorEvent)
  eventType: UserBehaviorEvent;

  @IsObject()
  @IsOptional()
  eventData?: Record<string, any>;
}

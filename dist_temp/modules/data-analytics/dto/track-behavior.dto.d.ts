import { UserBehaviorEvent } from '../../../shared/enums/user-behavior-event.enum';
export declare class TrackBehaviorDto {
    userId: string;
    sessionId: string;
    eventType: UserBehaviorEvent;
    eventData?: Record<string, any>;
}

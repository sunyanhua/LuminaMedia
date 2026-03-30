import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ScalingMetricsService } from './services/scaling-metrics.service';
import { KubernetesScalingProvider } from './integrations/kubernetes-scaling-provider.service';
import { ScalingDecisionEngine } from './services/scaling-decision-engine.service';
import { ScalingEventMonitor } from './services/scaling-event-monitor.service';
import { AutoscalingController } from './controllers/autoscaling.controller';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  controllers: [AutoscalingController],
  providers: [
    ScalingMetricsService,
    KubernetesScalingProvider,
    ScalingDecisionEngine,
    ScalingEventMonitor,
  ],
  exports: [
    ScalingMetricsService,
    KubernetesScalingProvider,
    ScalingDecisionEngine,
    ScalingEventMonitor,
  ],
})
export class AutoscalingModule {}

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApmService, ApmConfig } from '../../interfaces/apm.interface';

@Injectable()
export class SkywalkingApmService implements ApmService, OnModuleInit {
  private readonly logger = new Logger(SkywalkingApmService.name);
  private config: ApmConfig;
  private isInitialized = false;
  private skywalkingAgent: any = null;

  constructor(private configService: ConfigService) {
    this.config = this.loadConfig();
  }

  async onModuleInit() {
    if (this.config.enabled) {
      await this.start();
    } else {
      this.logger.warn('SkyWalking APM is disabled by configuration');
    }
  }

  /**
   * 启动SkyWalking APM代理
   */
  async start(): Promise<void> {
    try {
      this.logger.log('Initializing SkyWalking APM agent...');

      // 加载SkyWalking Node.js代理
      // 注意：需要安装 skywalking-backend-js 包
      // const { start } = require('skywalking-backend-js');

      // 暂时使用模拟实现，待实际安装包后替换
      this.skywalkingAgent = this.createMockAgent();

      this.logger.log(
        `SkyWalking APM agent initialized for service: ${this.config.serviceName}`,
      );
      this.isInitialized = true;

      // 记录启动事件
      this.recordMetric('apm_agent_started', 1, {
        service: this.config.serviceName,
      });
    } catch (error) {
      this.logger.error('Failed to initialize SkyWalking APM agent', error);
      throw error;
    }
  }

  /**
   * 停止SkyWalking APM代理
   */
  async stop(): Promise<void> {
    if (this.skywalkingAgent && this.skywalkingAgent.stop) {
      await this.skywalkingAgent.stop();
    }
    this.isInitialized = false;
    this.logger.log('SkyWalking APM agent stopped');
  }

  /**
   * 创建自定义追踪
   */
  createCustomTrace(
    operation: string,
    tags?: Record<string, any>,
    logs?: Record<string, any>,
  ): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // 实际实现应调用SkyWalking API
      this.logger.debug(`Custom trace: ${operation}`, { tags, logs });

      // 记录追踪指标
      this.recordMetric('custom_trace_count', 1, { operation });
    } catch (error) {
      this.logger.warn(`Failed to create custom trace: ${operation}`, error);
    }
  }

  /**
   * 记录错误
   */
  recordError(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // 实际实现应调用SkyWalking错误记录API
      this.logger.error(`APM recorded error: ${error.message}`, {
        error: error.stack,
        context,
      });

      // 记录错误指标
      this.recordMetric('error_count', 1, {
        error_type: error.constructor.name,
        message: error.message.substring(0, 100),
      });
    } catch (err) {
      this.logger.warn('Failed to record error to APM', err);
    }
  }

  /**
   * 记录业务指标
   */
  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>,
  ): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // 实际实现应调用SkyWalking指标API
      // 只在开发环境下记录debug日志，避免生产环境过多日志
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.debug(`Metric recorded: ${name}=${value}`, { tags });
      }

      // 这里可以添加指标聚合和上报逻辑
    } catch (error) {
      this.logger.warn(`Failed to record metric: ${name}`, error);
    }
  }

  /**
   * 加载APM配置
   */
  private loadConfig(): ApmConfig {
    return {
      serviceName: this.configService.get<string>(
        'APM_SERVICE_NAME',
        'lumina-media',
      ),
      serviceInstance: this.configService.get<string>(
        'APM_SERVICE_INSTANCE',
        'lumina-media-instance-1',
      ),
      oapServer: this.configService.get<string>(
        'APM_OAP_SERVER',
        'http://skywalking-oap:12800',
      ),
      sampleRate: parseFloat(
        this.configService.get<string>('APM_SAMPLE_RATE', '1.0'),
      ),
      enabled: this.configService.get<string>('APM_ENABLED', 'true') === 'true',
    };
  }

  /**
   * 创建模拟代理（待实际集成时替换）
   */
  private createMockAgent() {
    return {
      start: () => Promise.resolve(),
      stop: () => Promise.resolve(),
      recordTrace: (trace: any) => {
        this.logger.debug('Mock trace recorded', trace);
      },
      recordError: (error: any) => {
        this.logger.debug('Mock error recorded', error);
      },
      recordMetric: (metric: any) => {
        this.logger.debug('Mock metric recorded', metric);
      },
    };
  }

  /**
   * 获取当前配置
   */
  getConfig(): ApmConfig {
    return { ...this.config };
  }

  /**
   * 检查APM代理状态
   */
  getStatus(): { initialized: boolean; serviceName: string; enabled: boolean } {
    return {
      initialized: this.isInitialized,
      serviceName: this.config.serviceName,
      enabled: this.config.enabled,
    };
  }
}

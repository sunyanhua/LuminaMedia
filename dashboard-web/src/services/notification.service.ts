import { toast } from '@/hooks/use-toast';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
}

export class NotificationService {
  static success(options: Omit<NotificationOptions, 'variant'>) {
    toast({
      title: options.title || '操作成功',
      description: options.description,
      duration: options.duration || 3000,
      variant: 'default',
    });
  }

  static error(options: Omit<NotificationOptions, 'variant'>) {
    toast({
      title: options.title || '操作失败',
      description: options.description,
      duration: options.duration || 5000,
      variant: 'destructive',
    });
  }

  static info(options: Omit<NotificationOptions, 'variant'>) {
    toast({
      title: options.title,
      description: options.description,
      duration: options.duration || 3000,
      variant: 'default',
    });
  }

  static warning(options: Omit<NotificationOptions, 'variant'>) {
    toast({
      title: options.title || '提醒',
      description: options.description,
      duration: options.duration || 4000,
      variant: 'default',
    });
  }

  // 专门的通知方法
  static showDemoResetSuccess() {
    toast({
      title: '演示数据重置成功',
      description: '系统已恢复到初始状态，您可以开始新的演示体验。',
      duration: 3000,
      variant: 'default',
    });
  }

  static showQuotaLow(quotaName: string, used: number, max: number) {
    toast({
      title: '配额即将用完',
      description: `${quotaName}已使用${used}/${max}，请及时调整使用计划。`,
      duration: 5000,
      variant: 'default',
    });
  }

  static showQuotaExceeded(quotaName: string) {
    toast({
      title: '配额已用完',
      description: `${quotaName}配额已达上限，功能暂时受限。`,
      duration: 6000,
      variant: 'destructive',
    });
  }
}

export default NotificationService;
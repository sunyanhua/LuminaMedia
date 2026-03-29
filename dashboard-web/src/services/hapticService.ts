/**
 * 触觉反馈服务
 * 为移动端提供振动反馈，增强交互体验
 */

export interface HapticFeedbackOptions {
  /**
   * 振动持续时间（毫秒）
   */
  duration?: number;

  /**
   * 振动强度（0-1）
   */
  intensity?: number;

  /**
   * 振动模式
   */
  pattern?: number[];

  /**
   * 是否启用（默认检查设备支持）
   */
  enabled?: boolean;
}

export type HapticFeedbackType =
  | 'light'      // 轻反馈
  | 'medium'     // 中等反馈
  | 'heavy'      // 重反馈
  | 'success'    // 成功反馈
  | 'warning'    // 警告反馈
  | 'error'      // 错误反馈
  | 'selection'  // 选择反馈
  | 'impact'     // 碰撞反馈
  | 'notification'; // 通知反馈

/**
 * 触觉反馈服务
 */
class HapticService {
  private isSupported: boolean = false;
  private isEnabled: boolean = true;
  private defaultIntensity: number = 0.7;

  constructor() {
    this.checkSupport();
  }

  /**
   * 检查设备是否支持触觉反馈
   */
  private checkSupport(): void {
    // 检查 navigator.vibrate 支持
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      this.isSupported = true;
    } else {
      this.isSupported = false;
      console.warn('当前设备不支持触觉反馈（navigator.vibrate）');
    }

    // 检查是否在移动设备上
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // 即使支持vibrate，也可能不是触觉反馈（某些桌面浏览器也支持vibrate）
    this.isSupported = this.isSupported && isMobile;
  }

  /**
   * 启用或禁用触觉反馈
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      console.log('触觉反馈已禁用');
    }
  }

  /**
   * 检查是否支持触觉反馈
   */
  isHapticSupported(): boolean {
    return this.isSupported;
  }

  /**
   * 检查是否启用触觉反馈
   */
  isHapticEnabled(): boolean {
    return this.isEnabled && this.isSupported;
  }

  /**
   * 设置默认强度
   */
  setDefaultIntensity(intensity: number): void {
    if (intensity >= 0 && intensity <= 1) {
      this.defaultIntensity = intensity;
    } else {
      console.warn('强度值必须在0-1之间');
    }
  }

  /**
   * 执行触觉反馈
   */
  feedback(
    type: HapticFeedbackType | 'custom',
    options: HapticFeedbackOptions = {}
  ): boolean {
    if (!this.isHapticEnabled()) {
      return false;
    }

    const { duration, intensity = this.defaultIntensity, pattern, enabled = true } = options;

    if (!enabled) {
      return false;
    }

    let vibrationPattern: number | number[];

    switch (type) {
      case 'light':
        vibrationPattern = [0, 15 * intensity];
        break;

      case 'medium':
        vibrationPattern = [0, 30 * intensity];
        break;

      case 'heavy':
        vibrationPattern = [0, 50 * intensity];
        break;

      case 'success':
        vibrationPattern = [0, 30 * intensity, 100, 30 * intensity];
        break;

      case 'warning':
        vibrationPattern = [0, 60 * intensity, 100, 30 * intensity];
        break;

      case 'error':
        vibrationPattern = [0, 100 * intensity, 100, 50 * intensity, 100, 30 * intensity];
        break;

      case 'selection':
        vibrationPattern = [0, 10 * intensity];
        break;

      case 'impact':
        vibrationPattern = [0, 40 * intensity];
        break;

      case 'notification':
        vibrationPattern = [0, 100 * intensity, 100, 50 * intensity];
        break;

      case 'custom':
        if (pattern) {
          vibrationPattern = pattern;
        } else if (duration !== undefined) {
          vibrationPattern = duration;
        } else {
          vibrationPattern = 50;
        }
        break;

      default:
        vibrationPattern = 50;
    }

    try {
      return navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.error('触觉反馈执行失败:', error);
      return false;
    }
  }

  /**
   * 轻反馈
   */
  light(options?: HapticFeedbackOptions): boolean {
    return this.feedback('light', options);
  }

  /**
   * 中等反馈
   */
  medium(options?: HapticFeedbackOptions): boolean {
    return this.feedback('medium', options);
  }

  /**
   * 重反馈
   */
  heavy(options?: HapticFeedbackOptions): boolean {
    return this.feedback('heavy', options);
  }

  /**
   * 成功反馈
   */
  success(options?: HapticFeedbackOptions): boolean {
    return this.feedback('success', options);
  }

  /**
   * 警告反馈
   */
  warning(options?: HapticFeedbackOptions): boolean {
    return this.feedback('warning', options);
  }

  /**
   * 错误反馈
   */
  error(options?: HapticFeedbackOptions): boolean {
    return this.feedback('error', options);
  }

  /**
   * 选择反馈
   */
  selection(options?: HapticFeedbackOptions): boolean {
    return this.feedback('selection', options);
  }

  /**
   * 碰撞反馈
   */
  impact(options?: HapticFeedbackOptions): boolean {
    return this.feedback('impact', options);
  }

  /**
   * 通知反馈
   */
  notification(options?: HapticFeedbackOptions): boolean {
    return this.feedback('notification', options);
  }

  /**
   * 自定义反馈
   */
  custom(pattern: number[], options?: Omit<HapticFeedbackOptions, 'pattern'>): boolean {
    return this.feedback('custom', { ...options, pattern });
  }

  /**
   * 停止所有触觉反馈
   */
  stop(): void {
    try {
      navigator.vibrate(0);
    } catch (error) {
      console.error('停止触觉反馈失败:', error);
    }
  }

  /**
   * 测试触觉反馈
   */
  test(type: HapticFeedbackType = 'medium'): void {
    if (!this.isHapticSupported()) {
      console.log('设备不支持触觉反馈');
      return;
    }

    if (!this.isHapticEnabled()) {
      console.log('触觉反馈已禁用');
      return;
    }

    console.log(`测试触觉反馈: ${type}`);
    this.feedback(type);
  }
}

// 创建单例实例
export const hapticService = new HapticService();

export default hapticService;
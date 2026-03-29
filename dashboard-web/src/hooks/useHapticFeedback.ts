/**
 * 触觉反馈Hook
 * 在React组件中方便地使用触觉反馈
 */

import { useCallback } from 'react';
import { hapticService, HapticFeedbackType, HapticFeedbackOptions } from '@/services/hapticService';

export interface UseHapticFeedbackOptions {
  /**
   * 是否自动检查设备支持
   * @default true
   */
  autoCheck?: boolean;

  /**
   * 默认反馈类型
   * @default 'medium'
   */
  defaultType?: HapticFeedbackType;

  /**
   * 默认反馈选项
   */
  defaultOptions?: HapticFeedbackOptions;

  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean;
}

export interface UseHapticFeedbackResult {
  /**
   * 执行触觉反馈
   */
  feedback: (
    type?: HapticFeedbackType,
    options?: HapticFeedbackOptions
  ) => boolean;

  /**
   * 轻反馈
   */
  light: (options?: HapticFeedbackOptions) => boolean;

  /**
   * 中等反馈
   */
  medium: (options?: HapticFeedbackOptions) => boolean;

  /**
   * 重反馈
   */
  heavy: (options?: HapticFeedbackOptions) => boolean;

  /**
   * 成功反馈
   */
  success: (options?: HapticFeedbackOptions) => boolean;

  /**
   * 警告反馈
   */
  warning: (options?: HapticFeedbackOptions) => boolean;

  /**
   * 错误反馈
   */
  error: (options?: HapticFeedbackOptions) => boolean;

  /**
   * 选择反馈
   */
  selection: (options?: HapticFeedbackOptions) => boolean;

  /**
   * 碰撞反馈
   */
  impact: (options?: HapticFeedbackOptions) => boolean;

  /**
   * 通知反馈
   */
  notification: (options?: HapticFeedbackOptions) => boolean;

  /**
   * 停止所有反馈
   */
  stop: () => void;

  /**
   * 测试反馈
   */
  test: (type?: HapticFeedbackType) => void;

  /**
   * 是否支持触觉反馈
   */
  isSupported: boolean;

  /**
   * 是否启用触觉反馈
   */
  isEnabled: boolean;

  /**
   * 启用或禁用触觉反馈
   */
  setEnabled: (enabled: boolean) => void;
}

/**
 * 触觉反馈Hook
 */
export function useHapticFeedback(
  options: UseHapticFeedbackOptions = {}
): UseHapticFeedbackResult {
  const {
    autoCheck = true,
    defaultType = 'medium',
    defaultOptions = {},
    enabled = true,
  } = options;

  // 检查支持状态
  const isSupported = autoCheck ? hapticService.isHapticSupported() : true;
  const isEnabled = enabled && hapticService.isHapticEnabled();

  // 执行反馈
  const feedback = useCallback((
    type: HapticFeedbackType = defaultType,
    options: HapticFeedbackOptions = {}
  ): boolean => {
    if (!isEnabled) {
      return false;
    }

    return hapticService.feedback(type, { ...defaultOptions, ...options });
  }, [isEnabled, defaultType, defaultOptions]);

  // 各种反馈类型的快捷方法
  const light = useCallback((options?: HapticFeedbackOptions) =>
    feedback('light', options), [feedback]);

  const medium = useCallback((options?: HapticFeedbackOptions) =>
    feedback('medium', options), [feedback]);

  const heavy = useCallback((options?: HapticFeedbackOptions) =>
    feedback('heavy', options), [feedback]);

  const success = useCallback((options?: HapticFeedbackOptions) =>
    feedback('success', options), [feedback]);

  const warning = useCallback((options?: HapticFeedbackOptions) =>
    feedback('warning', options), [feedback]);

  const error = useCallback((options?: HapticFeedbackOptions) =>
    feedback('error', options), [feedback]);

  const selection = useCallback((options?: HapticFeedbackOptions) =>
    feedback('selection', options), [feedback]);

  const impact = useCallback((options?: HapticFeedbackOptions) =>
    feedback('impact', options), [feedback]);

  const notification = useCallback((options?: HapticFeedbackOptions) =>
    feedback('notification', options), [feedback]);

  // 停止反馈
  const stop = useCallback(() => {
    hapticService.stop();
  }, []);

  // 测试反馈
  const test = useCallback((type: HapticFeedbackType = defaultType) => {
    hapticService.test(type);
  }, [defaultType]);

  // 启用或禁用
  const setEnabled = useCallback((enabled: boolean) => {
    hapticService.setEnabled(enabled);
  }, []);

  return {
    feedback,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    impact,
    notification,
    stop,
    test,
    isSupported,
    isEnabled,
    setEnabled,
  };
}

/**
 * 高阶组件：为组件添加触觉反馈支持
 */
export function withHapticFeedback<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultOptions: UseHapticFeedbackOptions = {}
) {
  return function WithHapticFeedbackWrapper(props: P) {
    const haptic = useHapticFeedback(defaultOptions);

    // 将haptic对象作为prop传递给包装的组件
    return <WrappedComponent {...props} haptic={haptic} />;
  };
}

/**
 * 点击时触发触觉反馈的Hook
 */
export function useHapticOnClick(
  type: HapticFeedbackType = 'selection',
  options: HapticFeedbackOptions = {}
) {
  const { feedback } = useHapticFeedback({ defaultType: type, defaultOptions: options });

  const handleClickWithHaptic = useCallback((
    onClick?: () => void,
    hapticOptions?: HapticFeedbackOptions
  ) => {
    return (e?: React.MouseEvent) => {
      // 执行触觉反馈
      feedback(type, { ...options, ...hapticOptions });

      // 调用原始点击处理函数
      if (onClick) {
        onClick();
      }

      // 阻止事件冒泡（如果需要）
      if (e) {
        e.stopPropagation();
      }
    };
  }, [feedback, type, options]);

  return handleClickWithHaptic;
}

export default useHapticFeedback;
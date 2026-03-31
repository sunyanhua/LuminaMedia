/**
 * 防止误触和滚动穿透的Hook
 * 解决移动端常见触摸交互问题
 */

import React, { useEffect, useRef } from 'react';

export interface TouchPreventionOptions {
  /**
   * 是否防止滚动穿透
   * @default true
   */
  preventScrollPropagation?: boolean;

  /**
   * 是否防止误触（快速多次点击）
   * @default true
   */
  preventFastClick?: boolean;

  /**
   * 误触时间阈值（毫秒）
   * @default 300
   */
  fastClickThreshold?: number;

  /**
   * 是否防止长按误触
   * @default true
   */
  preventLongPressAccident?: boolean;

  /**
   * 长按时间阈值（毫秒）
   * @default 1000
   */
  longPressThreshold?: number;

  /**
   * 是否防止滑动误触
   * @default true
   */
  preventSwipeAccident?: boolean;

  /**
   * 滑动阈值（像素）
   * @default 10
   */
  swipeThreshold?: number;

  /**
   * 是否启用触摸反馈优化
   * @default true
   */
  enableTouchFeedback?: boolean;

  /**
   * 触摸反馈延迟（毫秒）
   * @default 100
   */
  touchFeedbackDelay?: number;
}

export interface TouchPreventionResult {
  /**
   * 触摸开始处理函数
   */
  handleTouchStart: (e: React.TouchEvent) => void;

  /**
   * 触摸移动处理函数
   */
  handleTouchMove: (e: React.TouchEvent) => void;

  /**
   * 触摸结束处理函数
   */
  handleTouchEnd: (e: React.TouchEvent) => void;

  /**
   * 触摸取消处理函数
   */
  handleTouchCancel: (e: React.TouchEvent) => void;

  /**
   * 点击处理函数
   */
  handleClick: (e: React.MouseEvent) => void;

  /**
   * 当前触摸状态
   */
  isTouching: boolean;

  /**
   * 当前是否正在滑动
   */
  isSwiping: boolean;

  /**
   * 重置触摸状态
   */
  reset: () => void;
}

/**
 * 防止误触和滚动穿透的Hook
 */
export function useTouchPrevention(
  elementRef: React.RefObject<HTMLElement | null>,
  options: TouchPreventionOptions = {}
): TouchPreventionResult {
  const {
    preventScrollPropagation = true,
    preventFastClick = true,
    fastClickThreshold = 300,
    preventLongPressAccident = true,
    longPressThreshold = 1000,
    preventSwipeAccident = true,
    swipeThreshold = 10,
    enableTouchFeedback = true,
    touchFeedbackDelay = 100,
  } = options;

  const lastClickTime = useRef(0);
  const touchStartTime = useRef(0);
  const touchStartPosition = useRef({ x: 0, y: 0 });
  const isTouchingRef = useRef(false);
  const isSwipingRef = useRef(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchFeedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理函数
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (touchFeedbackTimerRef.current) {
        clearTimeout(touchFeedbackTimerRef.current);
      }
    };
  }, []);

  // 防止滚动穿透
  const preventScroll = (e: TouchEvent) => {
    if (!preventScrollPropagation || !elementRef.current) return;

    const element = elementRef.current;
    const isScrollable = element.scrollHeight > element.clientHeight;

    if (isScrollable) {
      // 元素可滚动，只在滚动到边界时阻止穿透
      const isAtTop = element.scrollTop === 0;
      const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

      if ((isAtTop && e.touches[0].clientY > touchStartPosition.current.y) ||
          (isAtBottom && e.touches[0].clientY < touchStartPosition.current.y)) {
        e.preventDefault();
      }
    } else {
      // 元素不可滚动，完全阻止默认行为
      e.preventDefault();
    }
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPosition.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    touchStartTime.current = Date.now();
    isTouchingRef.current = true;
    isSwipingRef.current = false;

    // 设置长按检测定时器
    if (preventLongPressAccident && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    if (preventLongPressAccident) {
      longPressTimerRef.current = setTimeout(() => {
        // 长按事件处理
        console.warn('长按操作，可能为误触');
        // 可以在这里触发长按反馈或取消操作
      }, longPressThreshold);
    }

    // 触摸反馈优化
    if (enableTouchFeedback && elementRef.current) {
      elementRef.current.style.transition = 'none';

      if (touchFeedbackTimerRef.current) {
        clearTimeout(touchFeedbackTimerRef.current);
      }
    }
  };

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchingRef.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPosition.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosition.current.y);

    // 检测是否为滑动
    if (preventSwipeAccident && (deltaX > swipeThreshold || deltaY > swipeThreshold)) {
      isSwipingRef.current = true;

      // 清除长按定时器
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    // 防止滚动穿透
    if (preventScrollPropagation) {
      e.preventDefault();
    }
  };

  // 处理触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime.current;

    // 清除长按定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // 触摸反馈优化
    if (enableTouchFeedback && elementRef.current) {
      elementRef.current.style.transition = `all ${touchFeedbackDelay}ms ease`;

      if (touchFeedbackTimerRef.current) {
        clearTimeout(touchFeedbackTimerRef.current);
      }

      touchFeedbackTimerRef.current = setTimeout(() => {
        if (elementRef.current) {
          elementRef.current.style.transition = '';
        }
      }, touchFeedbackDelay);
    }

    // 如果是滑动操作，可能不需要触发点击事件
    if (preventSwipeAccident && isSwipingRef.current) {
      // 滑动操作，阻止可能的点击事件
      e.preventDefault();
    }

    isTouchingRef.current = false;
    isSwipingRef.current = false;
  };

  // 处理触摸取消
  const handleTouchCancel = (e: React.TouchEvent) => {
    // 清除定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (touchFeedbackTimerRef.current) {
      clearTimeout(touchFeedbackTimerRef.current);
      touchFeedbackTimerRef.current = null;
    }

    isTouchingRef.current = false;
    isSwipingRef.current = false;
  };

  // 处理点击事件（防止快速点击）
  const handleClick = (e: React.MouseEvent) => {
    if (!preventFastClick) return;

    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTime.current;

    if (timeSinceLastClick < fastClickThreshold) {
      // 快速连续点击，阻止第二次点击
      e.preventDefault();
      e.stopPropagation();
      console.warn('快速点击已阻止，时间间隔:', timeSinceLastClick, 'ms');
      return;
    }

    lastClickTime.current = currentTime;
  };

  // 重置触摸状态
  const reset = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (touchFeedbackTimerRef.current) {
      clearTimeout(touchFeedbackTimerRef.current);
      touchFeedbackTimerRef.current = null;
    }

    isTouchingRef.current = false;
    isSwipingRef.current = false;
  };

  // 添加全局触摸事件监听器（防止滚动穿透）
  useEffect(() => {
    if (!preventScrollPropagation || !elementRef.current) {
      return;
    }

    const element = elementRef.current;
    const options = { passive: false };

    element.addEventListener('touchmove', preventScroll as EventListener, options);

    return () => {
      element.removeEventListener('touchmove', preventScroll as EventListener);
    };
  }, [preventScrollPropagation, elementRef]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handleClick,
    isTouching: isTouchingRef.current,
    isSwiping: isSwipingRef.current,
    reset,
  };
}

/**
 * 防止滚动穿透的高阶组件
 */
export function withScrollPrevention<P extends object>(
  WrappedComponent: React.ComponentType<P>
): (props: P) => React.ReactElement {
  return function ScrollPreventionWrapper(props: P) {
    const containerRef = useRef<HTMLDivElement>(null);

    useTouchPrevention(containerRef, {
      preventScrollPropagation: true,
      preventFastClick: true,
    });

    return (
      <div ref={containerRef} style={{ height: '100%', overflow: 'auto' }}>
        <WrappedComponent {...props} />
      </div>
    );
  };
}

/**
 * 快速点击防护函数
 */
export function withFastClickPrevention<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  threshold: number = 300
): (props: P) => React.ReactElement {
  return function FastClickPreventionWrapper(props: P) {
    const lastClickTime = useRef(0);

    const handleClick = (e: React.MouseEvent) => {
      const currentTime = Date.now();
      const timeSinceLastClick = currentTime - lastClickTime.current;

      if (timeSinceLastClick < threshold) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      lastClickTime.current = currentTime;

      // 调用原始组件的onClick（如果有）
      if (props && (props as any).onClick) {
        (props as any).onClick(e);
      }
    };

    return <WrappedComponent {...props} onClick={handleClick} />;
  };
}

export default useTouchPrevention;
/**
 * 移动端手势支持
 * 提供滑动、长按、缩放等手势检测
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface GestureEvent {
  type: 'swipe' | 'tap' | 'longPress' | 'pinch' | 'pan';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  velocity?: number;
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  duration: number;
  timestamp: number;
}

export interface GestureOptions {
  /**
   * 滑动阈值（像素）
   * @default 30
   */
  swipeThreshold?: number;
  /**
   * 长按时间阈值（毫秒）
   * @default 500
   */
  longPressThreshold?: number;
  /**
   * 双击时间阈值（毫秒）
   * @default 300
   */
  doubleTapThreshold?: number;
  /**
   * 缩放阈值
   * @default 0.1
   */
  pinchThreshold?: number;
  /**
   * 是否启用被动事件监听
   * @default true
   */
  passive?: boolean;
  /**
   * 是否阻止默认行为
   * @default true
   */
  preventDefault?: boolean;
}

export interface GestureCallbacks {
  onSwipe?: (event: GestureEvent) => void;
  onSwipeLeft?: (event: GestureEvent) => void;
  onSwipeRight?: (event: GestureEvent) => void;
  onSwipeUp?: (event: GestureEvent) => void;
  onSwipeDown?: (event: GestureEvent) => void;
  onTap?: (event: GestureEvent) => void;
  onDoubleTap?: (event: GestureEvent) => void;
  onLongPress?: (event: GestureEvent) => void;
  onPinch?: (event: GestureEvent & { scale: number }) => void;
  onPan?: (event: GestureEvent & { deltaX: number; deltaY: number }) => void;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
}

/**
 * 使用移动端手势的Hook
 */
export function useGestures(
  elementRef: React.RefObject<HTMLElement | null>,
  callbacks: GestureCallbacks = {},
  options: GestureOptions = {}
) {
  const {
    swipeThreshold = 30,
    longPressThreshold = 500,
    doubleTapThreshold = 300,
    pinchThreshold = 0.1,
    passive = true,
    preventDefault = true,
  } = options;

  const [isGesturing, setIsGesturing] = useState(false);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    touches: number;
  } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const lastDistanceRef = useRef<number | null>(null);

  const detectSwipe = useCallback(
    (startX: number, startY: number, endX: number, endY: number, duration: number) => {
      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const velocity = distance / duration;

      if (distance >= swipeThreshold) {
        let direction: 'left' | 'right' | 'up' | 'down';

        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }

        const event: GestureEvent = {
          type: 'swipe',
          direction,
          distance,
          velocity,
          startX,
          startY,
          endX,
          endY,
          duration,
          timestamp: Date.now(),
        };

        callbacks.onSwipe?.(event);

        switch (direction) {
          case 'left':
            callbacks.onSwipeLeft?.(event);
            break;
          case 'right':
            callbacks.onSwipeRight?.(event);
            break;
          case 'up':
            callbacks.onSwipeUp?.(event);
            break;
          case 'down':
            callbacks.onSwipeDown?.(event);
            break;
        }

        return true;
      }

      return false;
    },
    [swipeThreshold, callbacks]
  );

  const detectTap = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      const lastTap = lastTapRef.current;

      if (lastTap && now - lastTap.time < doubleTapThreshold) {
        const distance = Math.sqrt(
          Math.pow(x - lastTap.x, 2) + Math.pow(y - lastTap.y, 2)
        );

        if (distance < 50) {
          // 双击
          const event: GestureEvent = {
            type: 'tap',
            startX: x,
            startY: y,
            duration: 0,
            timestamp: now,
          };
          callbacks.onDoubleTap?.(event);
          lastTapRef.current = null;
          return;
        }
      }

      // 单击
      const event: GestureEvent = {
        type: 'tap',
        startX: x,
        startY: y,
        duration: 0,
        timestamp: now,
      };
      callbacks.onTap?.(event);
      lastTapRef.current = { time: now, x, y };
    },
    [doubleTapThreshold, callbacks]
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const startTime = Date.now();

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: startTime,
        touches: e.touches.length,
      };

      setIsGesturing(true);
      callbacks.onGestureStart?.();

      // 设置长按定时器
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }

      longPressTimerRef.current = setTimeout(() => {
        const start = touchStartRef.current;
        if (start) {
          const event: GestureEvent = {
            type: 'longPress',
            startX: start.x,
            startY: start.y,
            duration: Date.now() - start.time,
            timestamp: Date.now(),
          };
          callbacks.onLongPress?.(event);
        }
      }, longPressThreshold);

      // 初始化多点触控距离
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        lastDistanceRef.current = distance;
      }
    },
    [longPressThreshold, preventDefault, callbacks]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      const start = touchStartRef.current;
      if (!start) return;

      // 清除长按定时器
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      const touch = e.touches[0];
      const currentTime = Date.now();
      const duration = currentTime - start.time;

      // 处理平移
      if (e.touches.length === 1) {
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;

        const event: GestureEvent & { deltaX: number; deltaY: number } = {
          type: 'pan',
          startX: start.x,
          startY: start.y,
          endX: touch.clientX,
          endY: touch.clientY,
          duration,
          timestamp: currentTime,
          deltaX,
          deltaY,
        };

        callbacks.onPan?.(event);
      }

      // 处理缩放
      if (e.touches.length === 2 && lastDistanceRef.current !== null) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        const scale = currentDistance / lastDistanceRef.current;

        if (Math.abs(scale - 1) > pinchThreshold) {
          const event: GestureEvent & { scale: number } = {
            type: 'pinch',
            startX: start.x,
            startY: start.y,
            duration,
            timestamp: currentTime,
            scale,
          };

          callbacks.onPinch?.(event);
          lastDistanceRef.current = currentDistance;
        }
      }
    },
    [pinchThreshold, preventDefault, callbacks]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }

      const start = touchStartRef.current;
      if (!start) return;

      // 清除长按定时器
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      const touch = e.changedTouches[0];
      const endTime = Date.now();
      const duration = endTime - start.time;

      // 检测滑动
      const wasSwipe = detectSwipe(
        start.x,
        start.y,
        touch.clientX,
        touch.clientY,
        duration
      );

      // 如果不是滑动，检测点击
      if (!wasSwipe && duration < longPressThreshold) {
        detectTap(touch.clientX, touch.clientY);
      }

      touchStartRef.current = null;
      lastDistanceRef.current = null;
      setIsGesturing(false);
      callbacks.onGestureEnd?.();
    },
    [preventDefault, detectSwipe, detectTap, longPressThreshold, callbacks]
  );

  // 添加事件监听
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const eventOptions = { passive, capture: true };

    element.addEventListener('touchstart', handleTouchStart, eventOptions);
    element.addEventListener('touchmove', handleTouchMove, eventOptions);
    element.addEventListener('touchend', handleTouchEnd, eventOptions);
    element.addEventListener('touchcancel', handleTouchEnd, eventOptions);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart, eventOptions);
      element.removeEventListener('touchmove', handleTouchMove, eventOptions);
      element.removeEventListener('touchend', handleTouchEnd, eventOptions);
      element.removeEventListener('touchcancel', handleTouchEnd, eventOptions);

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [
    elementRef,
    passive,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return { isGesturing };
}

/**
 * 手势组件 - 包装其他组件以添加手势支持
 */
export function withGestures<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  gestureCallbacks: GestureCallbacks = {},
  options: GestureOptions = {}
) {
  return function GestureWrapper(props: P) {
    const elementRef = useRef<HTMLDivElement>(null);
    useGestures(elementRef, gestureCallbacks, options);

    return (
      <div ref={elementRef} style={{ touchAction: 'none' }}>
        <WrappedComponent {...props} />
      </div>
    );
  };
}

/**
 * 简化的手势Hook - 仅支持滑动
 */
export function useSwipe(
  elementRef: React.RefObject<HTMLElement | null>,
  callbacks: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  } = {},
  threshold: number = 30
) {
  return useGestures(elementRef, {
    onSwipeLeft: () => callbacks.onSwipeLeft?.(),
    onSwipeRight: () => callbacks.onSwipeRight?.(),
    onSwipeUp: () => callbacks.onSwipeUp?.(),
    onSwipeDown: () => callbacks.onSwipeDown?.(),
  }, { swipeThreshold: threshold });
}

/**
 * 简化的手势Hook - 仅支持长按
 */
export function useLongPress(
  elementRef: React.RefObject<HTMLElement | null>,
  callback: () => void,
  threshold: number = 500
) {
  return useGestures(
    elementRef,
    { onLongPress: () => callback() },
    { longPressThreshold: threshold }
  );
}
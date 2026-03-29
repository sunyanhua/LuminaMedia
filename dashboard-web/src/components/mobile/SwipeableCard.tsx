/**
 * 可滑动卡片组件
 * 支持左滑/右滑操作，显示操作按钮
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useGestures, GestureCallbacks } from './gestures';

export interface SwipeAction {
  /**
   * 操作文本
   */
  text: string;

  /**
   * 操作图标
   */
  icon?: React.ReactNode;

  /**
   * 背景颜色
   * @default '#3b82f6'
   */
  backgroundColor?: string;

  /**
   * 文本颜色
   * @default '#ffffff'
   */
  color?: string;

  /**
   * 点击回调
   */
  onClick?: () => void;

  /**
   * 操作宽度（像素）
   * @default 80
   */
  width?: number;
}

export interface SwipeableCardProps {
  /**
   * 卡片内容
   */
  children: React.ReactNode;

  /**
   * 左侧操作按钮
   */
  leftActions?: SwipeAction[];

  /**
   * 右侧操作按钮
   */
  rightActions?: SwipeAction[];

  /**
   * 滑动阈值（像素），超过此值触发操作
   * @default 60
   */
  swipeThreshold?: number;

  /**
   * 最大滑动距离（像素）
   * @default 120
   */
  maxSwipeDistance?: number;

  /**
   * 滑动阻力系数（0-1），值越小阻力越大
   * @default 0.5
   */
  resistance?: number;

  /**
   * 滑动动画持续时间（毫秒）
   * @default 300
   */
  animationDuration?: number;

  /**
   * 是否禁用滑动
   * @default false
   */
  disabled?: boolean;

  /**
   * 是否在滑动后自动恢复
   * @default false
   */
  autoReset?: boolean;

  /**
   * 自动恢复延迟时间（毫秒）
   * @default 2000
   */
  autoResetDelay?: number;

  /**
   * 是否显示滑动提示
   * @default false
   */
  showHint?: boolean;

  /**
   * 卡片类名
   */
  className?: string;

  /**
   * 样式
   */
  style?: React.CSSProperties;

  /**
   * 内容包装器类名
   */
  contentClassName?: string;

  /**
   * 操作按钮包装器类名
   */
  actionsClassName?: string;

  /**
   * 滑动开始时的回调
   */
  onSwipeStart?: () => void;

  /**
   * 滑动结束时的回调
   */
  onSwipeEnd?: () => void;

  /**
   * 滑动状态变化的回调
   */
  onSwipeStateChange?: (isSwiped: boolean, direction: 'left' | 'right' | null) => void;

  /**
   * 操作按钮点击后的回调
   */
  onAction?: (action: SwipeAction, direction: 'left' | 'right') => void;
}

export interface SwipeableCardState {
  isSwiping: boolean;
  translateX: number;
  startX: number;
  currentDirection: 'left' | 'right' | null;
  isSwiped: boolean;
  swipedDirection: 'left' | 'right' | null;
  isAnimating: boolean;
}

/**
 * 可滑动卡片组件
 */
export function SwipeableCard({
  children,
  leftActions = [],
  rightActions = [],
  swipeThreshold = 60,
  maxSwipeDistance = 120,
  resistance = 0.5,
  animationDuration = 300,
  disabled = false,
  autoReset = false,
  autoResetDelay = 2000,
  showHint = false,
  className,
  style,
  contentClassName,
  actionsClassName,
  onSwipeStart,
  onSwipeEnd,
  onSwipeStateChange,
  onAction,
}: SwipeableCardProps) {
  const [state, setState] = useState<SwipeableCardState>({
    isSwiping: false,
    translateX: 0,
    startX: 0,
    currentDirection: null,
    isSwiped: false,
    swipedDirection: null,
    isAnimating: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 计算操作按钮总宽度
  const leftActionsWidth = leftActions.reduce((sum, action) => sum + (action.width || 80), 0);
  const rightActionsWidth = rightActions.reduce((sum, action) => sum + (action.width || 80), 0);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
      }
    };
  }, []);

  // 状态变化回调
  useEffect(() => {
    onSwipeStateChange?.(state.isSwiped, state.swipedDirection);
  }, [state.isSwiped, state.swipedDirection, onSwipeStateChange]);

  // 自动重置
  const resetCard = useCallback(() => {
    if (state.isAnimating || disabled) return;

    setState((prev) => ({
      ...prev,
      isAnimating: true,
      translateX: 0,
      isSwiped: false,
      swipedDirection: null,
    }));

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isAnimating: false,
      }));
    }, animationDuration);
  }, [state.isAnimating, disabled, animationDuration]);

  // 设置自动重置定时器
  useEffect(() => {
    if (autoReset && state.isSwiped && !state.isSwiping) {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
      }

      autoResetTimerRef.current = setTimeout(() => {
        resetCard();
      }, autoResetDelay);
    }

    return () => {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
      }
    };
  }, [autoReset, state.isSwiped, state.isSwiping, autoResetDelay, resetCard]);

  // 手势处理
  const gestureCallbacks: GestureCallbacks = {
    onPan: (event) => {
      if (disabled || state.isAnimating) return;

      const deltaX = event.deltaX;

      if (!state.isSwiping) {
        setState((prev) => ({
          ...prev,
          isSwiping: true,
          startX: prev.translateX,
        }));
        onSwipeStart?.();
      }

      // 计算滑动距离，应用阻力
      let newTranslateX = state.startX + deltaX * resistance;

      // 限制滑动范围
      if (newTranslateX > 0) {
        // 向右滑动，显示左侧操作按钮
        newTranslateX = Math.min(newTranslateX, leftActionsWidth);
      } else {
        // 向左滑动，显示右侧操作按钮
        newTranslateX = Math.max(newTranslateX, -rightActionsWidth);
      }

      const direction = newTranslateX > 0 ? 'right' : newTranslateX < 0 ? 'left' : null;

      setState((prev) => ({
        ...prev,
        translateX: newTranslateX,
        currentDirection: direction,
      }));
    },

    onGestureEnd: () => {
      if (!state.isSwiping || disabled || state.isAnimating) return;

      const { translateX, currentDirection } = state;
      const absTranslateX = Math.abs(translateX);
      const threshold = swipeThreshold;

      let finalTranslateX = 0;
      let isSwiped = false;
      let swipedDirection: 'left' | 'right' | null = null;

      if (absTranslateX >= threshold) {
        // 超过阈值，保持滑动状态
        if (currentDirection === 'right' && leftActions.length > 0) {
          finalTranslateX = leftActionsWidth;
          isSwiped = true;
          swipedDirection = 'right';
        } else if (currentDirection === 'left' && rightActions.length > 0) {
          finalTranslateX = -rightActionsWidth;
          isSwiped = true;
          swipedDirection = 'left';
        } else {
          finalTranslateX = 0;
        }
      } else {
        // 未超过阈值，恢复原位
        finalTranslateX = 0;
      }

      setState((prev) => ({
        ...prev,
        isSwiping: false,
        isAnimating: true,
        translateX: finalTranslateX,
        isSwiped,
        swipedDirection,
      }));

      onSwipeEnd?.();

      // 动画完成后更新状态
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isAnimating: false,
        }));
      }, animationDuration);
    },
  };

  // 使用手势Hook
  useGestures(contentRef, gestureCallbacks, {
    preventDefault: true,
    passive: false,
  });

  // 处理操作按钮点击
  const handleActionClick = useCallback((action: SwipeAction, direction: 'left' | 'right') => {
    action.onClick?.();
    onAction?.(action, direction);

    if (autoReset) {
      resetCard();
    }
  }, [autoReset, resetCard, onAction]);

  // 渲染操作按钮
  const renderActions = (actions: SwipeAction[], direction: 'left' | 'right') => {
    const isLeft = direction === 'left';
    let accumulatedWidth = 0;

    return actions.map((action, index) => {
      const actionWidth = action.width || 80;
      const position = accumulatedWidth;
      accumulatedWidth += actionWidth;

      return (
        <button
          key={index}
          className="swipe-action-button"
          style={{
            position: 'absolute',
            [isLeft ? 'left' : 'right']: 0,
            transform: `translateX(${isLeft ? position : -position}px)`,
            width: actionWidth,
            height: '100%',
            backgroundColor: action.backgroundColor || '#3b82f6',
            color: action.color || '#ffffff',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'transform 0.2s ease',
          }}
          onClick={() => handleActionClick(action, direction)}
          aria-label={action.text}
        >
          {action.icon && <span className="action-icon">{action.icon}</span>}
          <span className="action-text">{action.text}</span>
        </button>
      );
    });
  };

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    backgroundColor: '#ffffff',
    transform: `translateX(${state.translateX}px)`,
    transition: state.isAnimating ? `transform ${animationDuration}ms ease` : 'none',
    cursor: disabled ? 'default' : 'grab',
    userSelect: 'none',
  };

  const actionsContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    zIndex: 1,
  };

  return (
    <div
      ref={containerRef}
      className={cn('swipeable-card', className)}
      style={cardStyle}
    >
      {/* 操作按钮容器 */}
      <div
        className={cn('swipe-actions-container', actionsClassName)}
        style={actionsContainerStyle}
      >
        {/* 左侧操作按钮 */}
        {leftActions.length > 0 && (
          <div
            className="left-actions"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: leftActionsWidth,
              display: 'flex',
            }}
          >
            {renderActions(leftActions, 'left')}
          </div>
        )}

        {/* 右侧操作按钮 */}
        {rightActions.length > 0 && (
          <div
            className="right-actions"
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: rightActionsWidth,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            {renderActions(rightActions, 'right')}
          </div>
        )}
      </div>

      {/* 卡片内容 */}
      <div
        ref={contentRef}
        className={cn('swipeable-card-content', contentClassName)}
        style={contentStyle}
        onMouseDown={(e) => {
          if (disabled) return;
          e.currentTarget.style.cursor = 'grabbing';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
      >
        {children}

        {/* 滑动提示 */}
        {showHint && !state.isSwiped && !disabled && (
          <div
            className="swipe-hint"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 8,
              display: 'flex',
              alignItems: 'center',
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '12px', color: '#666' }}>← 滑动</span>
          </div>
        )}
      </div>

      <style jsx global>{`
        .swipeable-card {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.2s ease;
        }

        .swipeable-card:active {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .swipeable-card-content {
          touch-action: pan-y;
        }

        .swipe-action-button {
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .swipe-action-button:hover {
          filter: brightness(0.9);
        }

        .swipe-action-button:active {
          transform: scale(0.95);
        }

        .action-icon {
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-text {
          white-space: nowrap;
        }

        /* 滑动时的视觉效果 */
        .swipeable-card-content[data-swiping="true"] {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* 禁用状态 */
        .swipeable-card[data-disabled="true"] {
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default SwipeableCard;
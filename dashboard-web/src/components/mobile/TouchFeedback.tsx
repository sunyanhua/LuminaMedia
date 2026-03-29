/**
 * 触摸反馈组件
 * 为移动端触摸操作提供视觉反馈（涟漪效果）
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TouchFeedbackProps {
  /**
   * 子组件
   */
  children: React.ReactElement;

  /**
   * 反馈类型
   * @default 'ripple'
   */
  type?: 'ripple' | 'opacity' | 'scale';

  /**
   * 涟漪颜色
   * @default 'rgba(0, 0, 0, 0.1)'
   */
  rippleColor?: string;

  /**
   * 涟漪持续时间（毫秒）
   * @default 600
   */
  rippleDuration?: number;

  /**
   * 是否禁用反馈
   * @default false
   */
  disabled?: boolean;

  /**
   * 点击时的不透明度（type为'opacity'时生效）
   * @default 0.7
   */
  activeOpacity?: number;

  /**
   * 点击时的缩放比例（type为'scale'时生效）
   * @default 0.95
   */
  activeScale?: number;

  /**
   * 触摸开始时的回调
   */
  onTouchStart?: (e: React.TouchEvent) => void;

  /**
   * 触摸结束时的回调
   */
  onTouchEnd?: (e: React.TouchEvent) => void;

  /**
   * 触摸取消时的回调
   */
  onTouchCancel?: (e: React.TouchEvent) => void;

  /**
   * 点击时的回调
   */
  onClick?: (e: React.MouseEvent) => void;

  /**
   * 额外的CSS类名
   */
  className?: string;

  /**
   * 样式
   */
  style?: React.CSSProperties;
}

export interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

/**
 * 触摸反馈组件
 */
export function TouchFeedback({
  children,
  type = 'ripple',
  rippleColor = 'rgba(0, 0, 0, 0.1)',
  rippleDuration = 600,
  disabled = false,
  activeOpacity = 0.7,
  activeScale = 0.95,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  onClick,
  className,
  style,
}: TouchFeedbackProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleIdCounter = useRef(0);

  // 清理过期的涟漪效果
  useEffect(() => {
    if (ripples.length === 0) return;

    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, rippleDuration);

    return () => clearTimeout(timer);
  }, [ripples, rippleDuration]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;

    setIsActive(true);

    if (type === 'ripple' && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // 计算涟漪大小（容器对角线长度）
      const size = Math.sqrt(rect.width ** 2 + rect.height ** 2);

      const newRipple: Ripple = {
        x,
        y,
        size,
        id: rippleIdCounter.current++,
      };

      setRipples((prev) => [...prev, newRipple]);
    }

    onTouchStart?.(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsActive(false);
    onTouchEnd?.(e);
  };

  const handleTouchCancel = (e: React.TouchEvent) => {
    setIsActive(false);
    onTouchCancel?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;

    setIsActive(true);

    if (type === 'ripple' && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 计算涟漪大小（容器对角线长度）
      const size = Math.sqrt(rect.width ** 2 + rect.height ** 2);

      const newRipple: Ripple = {
        x,
        y,
        size,
        id: rippleIdCounter.current++,
      };

      setRipples((prev) => [...prev, newRipple]);
    }
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  const handleMouseLeave = () => {
    setIsActive(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled) {
      onClick?.(e);
    }
  };

  // 克隆子元素，添加事件处理
  const child = React.Children.only(children);
  const enhancedChild = React.cloneElement(child, {
    onTouchStart: (e: React.TouchEvent) => {
      child.props.onTouchStart?.(e);
      handleTouchStart(e);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      child.props.onTouchEnd?.(e);
      handleTouchEnd(e);
    },
    onTouchCancel: (e: React.TouchEvent) => {
      child.props.onTouchCancel?.(e);
      handleTouchCancel(e);
    },
    onMouseDown: (e: React.MouseEvent) => {
      child.props.onMouseDown?.(e);
      handleMouseDown(e);
    },
    onMouseUp: (e: React.MouseEvent) => {
      child.props.onMouseUp?.(e);
      handleMouseUp();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      child.props.onMouseLeave?.(e);
      handleMouseLeave();
    },
    onClick: (e: React.MouseEvent) => {
      child.props.onClick?.(e);
      handleClick(e);
    },
  });

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-block',
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...(type === 'opacity' && {
      opacity: isActive && !disabled ? activeOpacity : 1,
      transition: 'opacity 150ms ease',
    }),
    ...(type === 'scale' && {
      transform: isActive && !disabled ? `scale(${activeScale})` : 'scale(1)',
      transition: 'transform 150ms ease',
    }),
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={cn('touch-feedback', className)}
      style={containerStyle}
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      {type === 'ripple' && ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            position: 'absolute',
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            backgroundColor: rippleColor,
            opacity: 0,
            transform: 'scale(0)',
            animation: `ripple-animation ${rippleDuration}ms ease-out`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {enhancedChild}

      <style jsx global>{`
        @keyframes ripple-animation {
          0% {
            opacity: 1;
            transform: scale(0);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        .touch-feedback:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .touch-feedback[aria-disabled="true"] {
          pointer-events: none;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

/**
 * 简化版本的触摸反馈包装器
 */
export function withTouchFeedback<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feedbackProps: Omit<TouchFeedbackProps, 'children'> = {}
) {
  return function WithTouchFeedbackWrapper(props: P) {
    return (
      <TouchFeedback {...feedbackProps}>
        <WrappedComponent {...props} />
      </TouchFeedback>
    );
  };
}

export default TouchFeedback;
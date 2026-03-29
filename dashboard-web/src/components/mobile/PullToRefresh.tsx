/**
 * 下拉刷新组件
 * 移动端下拉刷新功能实现
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface PullToRefreshProps {
  /**
   * 刷新时的回调函数
   */
  onRefresh: () => Promise<void> | void;

  /**
   * 下拉距离阈值（像素），超过此值触发刷新
   * @default 80
   */
  pullThreshold?: number;

  /**
   * 最大允许下拉距离（像素）
   * @default 150
   */
  maxPullDistance?: number;

  /**
   * 下拉时的阻力系数（0-1），值越小阻力越大
   * @default 0.5
   */
  resistance?: number;

  /**
   * 刷新完成后的回弹动画持续时间（毫秒）
   * @default 300
   */
  bounceDuration?: number;

  /**
   * 刷新状态提示文本配置
   */
  text?: {
    pullToRefresh?: string;
    releaseToRefresh?: string;
    refreshing?: string;
    refreshed?: string;
  };

  /**
   * 是否显示加载动画
   * @default true
   */
  showLoader?: boolean;

  /**
   * 自定义加载指示器
   */
  loader?: React.ReactNode;

  /**
   * 是否禁用下拉刷新
   * @default false
   */
  disabled?: boolean;

  /**
   * 内容区域
   */
  children: React.ReactNode;

  /**
   * 容器类名
   */
  className?: string;

  /**
   * 样式
   */
  style?: React.CSSProperties;

  /**
   * 刷新完成后的回调
   */
  onRefreshComplete?: () => void;
}

export interface PullToRefreshState {
  isRefreshing: boolean;
  isPulling: boolean;
  pullDistance: number;
  pullProgress: number; // 0-1
  status: 'idle' | 'pulling' | 'pull-to-refresh' | 'refreshing' | 'refreshed';
}

/**
 * 下拉刷新组件
 */
export function PullToRefresh({
  onRefresh,
  pullThreshold = 80,
  maxPullDistance = 150,
  resistance = 0.5,
  bounceDuration = 300,
  text = {},
  showLoader = true,
  loader,
  disabled = false,
  children,
  className,
  style,
  onRefreshComplete,
}: PullToRefreshProps) {
  const {
    pullToRefresh = '下拉刷新',
    releaseToRefresh = '释放刷新',
    refreshing = '刷新中...',
    refreshed = '刷新完成',
  } = text;

  const [state, setState] = useState<PullToRefreshState>({
    isRefreshing: false,
    isPulling: false,
    pullDistance: 0,
    pullProgress: 0,
    status: 'idle',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const currentPullDistance = useRef(0);
  const isTouching = useRef(false);
  const isAtTop = useRef(true);

  // 检查是否在顶部
  const checkIsAtTop = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    // 检查第一个子元素是否在可视区域顶部
    const firstChild = container.firstElementChild;
    if (!firstChild) return true;

    const containerRect = container.getBoundingClientRect();
    const childRect = firstChild.getBoundingClientRect();

    return childRect.top >= containerRect.top;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || state.isRefreshing) return;

    isAtTop.current = checkIsAtTop();
    if (!isAtTop.current) return;

    isTouching.current = true;
    touchStartY.current = e.touches[0].clientY;

    setState((prev) => ({
      ...prev,
      isPulling: true,
      status: 'pulling',
    }));
  }, [disabled, state.isRefreshing, checkIsAtTop]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTouching.current || disabled || state.isRefreshing || !isAtTop.current) {
      return;
    }

    e.preventDefault(); // 阻止默认滚动行为

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY.current;

    if (deltaY <= 0) {
      // 向上滑动，不处理
      return;
    }

    // 应用阻力效果
    const pullDistance = Math.min(
      deltaY * resistance,
      maxPullDistance
    );

    currentPullDistance.current = pullDistance;
    const progress = Math.min(pullDistance / pullThreshold, 1);

    setState({
      isRefreshing: false,
      isPulling: true,
      pullDistance,
      pullProgress: progress,
      status: progress >= 1 ? 'pull-to-refresh' : 'pulling',
    });
  }, [disabled, state.isRefreshing, resistance, maxPullDistance, pullThreshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isTouching.current || disabled || !isAtTop.current) {
      return;
    }

    isTouching.current = false;

    const { pullDistance } = state;
    const shouldRefresh = pullDistance >= pullThreshold;

    if (shouldRefresh) {
      // 触发刷新
      setState({
        isRefreshing: true,
        isPulling: false,
        pullDistance: pullThreshold,
        pullProgress: 1,
        status: 'refreshing',
      });

      try {
        await onRefresh();

        // 刷新成功
        setState({
          isRefreshing: false,
          isPulling: false,
          pullDistance: 0,
          pullProgress: 0,
          status: 'refreshed',
        });

        onRefreshComplete?.();

        // 显示"刷新完成"状态，然后回弹
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            status: 'idle',
          }));
        }, 800);
      } catch (error) {
        // 刷新失败，直接回弹
        setState({
          isRefreshing: false,
          isPulling: false,
          pullDistance: 0,
          pullProgress: 0,
          status: 'idle',
        });
        console.error('下拉刷新失败:', error);
      }
    } else {
      // 未达到阈值，回弹
      setState({
        isRefreshing: false,
        isPulling: false,
        pullDistance: 0,
        pullProgress: 0,
        status: 'idle',
      });
    }
  }, [disabled, state.pullDistance, pullThreshold, onRefresh, onRefreshComplete]);

  // 添加事件监听
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options = { passive: false };

    container.addEventListener('touchstart', handleTouchStart, options);
    container.addEventListener('touchmove', handleTouchMove, options);
    container.addEventListener('touchend', handleTouchEnd, options);
    container.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 状态文本
  const statusText = () => {
    switch (state.status) {
      case 'pulling':
        return pullToRefresh;
      case 'pull-to-refresh':
        return releaseToRefresh;
      case 'refreshing':
        return refreshing;
      case 'refreshed':
        return refreshed;
      default:
        return pullToRefresh;
    }
  };

  // 默认加载指示器
  const defaultLoader = (
    <div className="pull-to-refresh-loader">
      <div className="loader-spinner">
        <div className="spinner-dot" />
        <div className="spinner-dot" />
        <div className="spinner-dot" />
      </div>
      <span className="loader-text">{statusText()}</span>
    </div>
  );

  const pullIndicatorStyle: React.CSSProperties = {
    height: state.pullDistance,
    opacity: state.isPulling || state.isRefreshing ? 1 : 0,
    transform: `translateY(${state.pullDistance}px)`,
    transition: state.isPulling
      ? 'none'
      : `transform ${bounceDuration}ms ease, opacity ${bounceDuration}ms ease`,
  };

  return (
    <div
      ref={containerRef}
      className={cn('pull-to-refresh-container', className)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* 下拉指示器 */}
      <div
        className="pull-to-refresh-indicator"
        style={pullIndicatorStyle}
      >
        <div
          className="pull-to-refresh-content"
          style={{
            height: pullThreshold,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            transform: `translateY(${-state.pullDistance}px)`,
          }}
        >
          {showLoader && (loader || defaultLoader)}
        </div>
      </div>

      {/* 实际内容 */}
      <div
        className="pull-to-refresh-children"
        style={{
          transform: `translateY(${state.pullDistance}px)`,
          transition: state.isPulling
            ? 'none'
            : `transform ${bounceDuration}ms ease`,
        }}
      >
        {children}
      </div>

      <style jsx global>{`
        .pull-to-refresh-container {
          -webkit-overflow-scrolling: touch;
          user-select: none;
        }

        .pull-to-refresh-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
        }

        .loader-spinner {
          display: flex;
          gap: 4px;
        }

        .spinner-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #3b82f6;
          opacity: 0.6;
          animation: spinner-dot-bounce 1.4s infinite ease-in-out both;
        }

        .spinner-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .spinner-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes spinner-dot-bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.3;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .loader-text {
          font-size: 14px;
          color: #666;
          transition: color 0.2s ease;
        }

        .pull-to-refresh-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 10;
        }

        /* 刷新状态样式 */
        .pull-to-refresh-container[data-status="refreshing"] .loader-text {
          color: #3b82f6;
        }

        .pull-to-refresh-container[data-status="refreshed"] .loader-text {
          color: #10b981;
        }
      `}</style>
    </div>
  );
}

export default PullToRefresh;
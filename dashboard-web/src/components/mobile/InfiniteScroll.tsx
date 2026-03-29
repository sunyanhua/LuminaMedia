/**
 * 无限滚动组件
 * 移动端上拉加载更多功能实现
 */

import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InfiniteScrollProps<T = any> {
  /**
   * 数据数组
   */
  data: T[];

  /**
   * 渲染每个项目的函数
   */
  renderItem: (item: T, index: number) => ReactNode;

  /**
   * 加载更多数据的回调函数
   */
  loadMore: () => Promise<void> | void;

  /**
   * 是否还有更多数据可加载
   * @default true
   */
  hasMore?: boolean;

  /**
   * 是否正在加载
   */
  isLoading?: boolean;

  /**
   * 触发加载的距离阈值（像素）
   * @default 100
   */
  threshold?: number;

  /**
   * 滚动容器高度（px或vh），默认为父容器高度
   */
  height?: string | number;

  /**
   * 是否反向滚动（从底部开始）
   * @default false
   */
  reverse?: boolean;

  /**
   * 自定义加载指示器
   */
  loader?: ReactNode;

  /**
   * 没有更多数据时显示的内容
   */
  endMessage?: ReactNode;

  /**
   * 初始加载时显示的内容
   */
  initialLoader?: ReactNode;

  /**
   * 错误处理
   */
  error?: Error | null;
  onError?: (error: Error) => void;

  /**
   * 滚动容器类名
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
   * 是否禁用无限滚动
   * @default false
   */
  disabled?: boolean;

  /**
   * 滚动事件回调
   */
  onScroll?: (scrollTop: number) => void;
}

export interface InfiniteScrollState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  isInitialLoading: boolean;
}

/**
 * 无限滚动组件
 */
export function InfiniteScroll<T>({
  data,
  renderItem,
  loadMore,
  hasMore = true,
  isLoading: externalIsLoading,
  threshold = 100,
  height,
  reverse = false,
  loader,
  endMessage,
  initialLoader,
  error,
  onError,
  className,
  style,
  contentClassName,
  disabled = false,
  onScroll,
}: InfiniteScrollProps<T>) {
  const [internalState, setInternalState] = useState<InfiniteScrollState>({
    isLoading: false,
    hasError: false,
    errorMessage: null,
    isInitialLoading: data.length === 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollObserverRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalState.isLoading;

  // 清理函数
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (scrollObserverRef.current) {
        scrollObserverRef.current.disconnect();
      }
    };
  }, []);

  // 错误处理
  useEffect(() => {
    if (error) {
      setInternalState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage: error.message,
      }));
      onError?.(error);
    }
  }, [error, onError]);

  // 加载更多函数
  const handleLoadMore = useCallback(async () => {
    if (disabled || isLoading || !hasMore || internalState.hasError) {
      return;
    }

    try {
      setInternalState((prev) => ({ ...prev, isLoading: true }));
      await loadMore();
      if (isMountedRef.current) {
        setInternalState((prev) => ({ ...prev, isLoading: false, hasError: false }));
      }
    } catch (err) {
      if (isMountedRef.current) {
        setInternalState((prev) => ({
          ...prev,
          isLoading: false,
          hasError: true,
          errorMessage: err instanceof Error ? err.message : '加载失败',
        }));
        onError?.(err instanceof Error ? err : new Error('加载失败'));
      }
    }
  }, [disabled, isLoading, hasMore, internalState.hasError, loadMore, onError]);

  // 设置Intersection Observer
  useEffect(() => {
    if (!loadMoreTriggerRef.current || disabled || !hasMore) {
      return;
    }

    if (scrollObserverRef.current) {
      scrollObserverRef.current.disconnect();
    }

    const options: IntersectionObserverInit = {
      root: containerRef.current,
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0.1,
    };

    scrollObserverRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoading && hasMore) {
        handleLoadMore();
      }
    }, options);

    scrollObserverRef.current.observe(loadMoreTriggerRef.current);

    return () => {
      if (scrollObserverRef.current) {
        scrollObserverRef.current.disconnect();
      }
    };
  }, [disabled, hasMore, isLoading, threshold, handleLoadMore]);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !onScroll) return;

    const scrollTop = containerRef.current.scrollTop;
    onScroll(scrollTop);
  }, [onScroll]);

  // 初始化加载
  useEffect(() => {
    if (data.length === 0 && hasMore && !isLoading && !internalState.hasError) {
      handleLoadMore();
    }
  }, [data.length, hasMore, isLoading, internalState.hasError, handleLoadMore]);

  // 默认加载指示器
  const defaultLoader = (
    <div className="infinite-scroll-loader">
      <div className="loader-spinner">
        <div className="spinner-bar" />
        <div className="spinner-bar" />
        <div className="spinner-bar" />
        <div className="spinner-bar" />
        <div className="spinner-bar" />
      </div>
      <span className="loader-text">加载中...</span>
    </div>
  );

  // 默认结束消息
  const defaultEndMessage = (
    <div className="infinite-scroll-end">
      <span className="end-text">没有更多内容了</span>
    </div>
  );

  // 默认初始加载器
  const defaultInitialLoader = (
    <div className="infinite-scroll-initial-loader">
      <div className="initial-loader-spinner" />
      <span className="initial-loader-text">加载中...</span>
    </div>
  );

  // 错误状态显示
  const errorDisplay = internalState.hasError && (
    <div className="infinite-scroll-error">
      <span className="error-text">{internalState.errorMessage || '加载失败'}</span>
      <button
        className="error-retry-btn"
        onClick={handleLoadMore}
        disabled={isLoading}
      >
        重试
      </button>
    </div>
  );

  const containerStyle: React.CSSProperties = {
    height: height || '100%',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    ...(reverse && { display: 'flex', flexDirection: 'column-reverse' }),
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={cn('infinite-scroll-container', className)}
      style={containerStyle}
      onScroll={handleScroll}
    >
      {internalState.isInitialLoading && data.length === 0 ? (
        <div className="infinite-scroll-initial">
          {initialLoader || defaultInitialLoader}
        </div>
      ) : (
        <>
          <div className={cn('infinite-scroll-content', contentClassName)}>
            {data.map((item, index) => (
              <div key={index} className="infinite-scroll-item">
                {renderItem(item, index)}
              </div>
            ))}
          </div>

          {/* 加载触发器（不可见） */}
          {hasMore && !internalState.hasError && (
            <div
              ref={loadMoreTriggerRef}
              className="infinite-scroll-trigger"
              style={{ height: 1, opacity: 0 }}
            />
          )}

          {/* 加载状态指示器 */}
          {isLoading && (loader || defaultLoader)}

          {/* 错误显示 */}
          {errorDisplay}

          {/* 没有更多数据的提示 */}
          {!hasMore && data.length > 0 && (endMessage || defaultEndMessage)}
        </>
      )}

      <style jsx global>{`
        .infinite-scroll-container {
          position: relative;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        .infinite-scroll-content {
          min-height: 100%;
        }

        .infinite-scroll-item {
          margin-bottom: 1px;
        }

        /* 加载指示器样式 */
        .infinite-scroll-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #666;
        }

        .loader-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          margin-bottom: 8px;
          height: 30px;
        }

        .spinner-bar {
          width: 4px;
          height: 18px;
          background-color: #3b82f6;
          border-radius: 2px;
          animation: spinner-bar-wave 1.2s infinite ease-in-out;
        }

        .spinner-bar:nth-child(1) {
          animation-delay: -1.2s;
        }

        .spinner-bar:nth-child(2) {
          animation-delay: -1.1s;
        }

        .spinner-bar:nth-child(3) {
          animation-delay: -1s;
        }

        .spinner-bar:nth-child(4) {
          animation-delay: -0.9s;
        }

        .spinner-bar:nth-child(5) {
          animation-delay: -0.8s;
        }

        @keyframes spinner-bar-wave {
          0%, 40%, 100% {
            transform: scaleY(0.4);
            opacity: 0.5;
          }
          20% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        .loader-text {
          font-size: 14px;
          color: #666;
        }

        /* 初始加载器样式 */
        .infinite-scroll-initial-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #666;
        }

        .initial-loader-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: initial-loader-spin 1s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes initial-loader-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .initial-loader-text {
          font-size: 14px;
          color: #666;
        }

        /* 结束消息样式 */
        .infinite-scroll-end {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #9ca3af;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
          margin-top: 10px;
        }

        .end-text {
          position: relative;
          padding: 0 20px;
        }

        .end-text::before,
        .end-text::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 30px;
          height: 1px;
          background-color: #e5e7eb;
        }

        .end-text::before {
          right: 100%;
        }

        .end-text::after {
          left: 100%;
        }

        /* 错误样式 */
        .infinite-scroll-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #ef4444;
          text-align: center;
        }

        .error-text {
          margin-bottom: 12px;
          font-size: 14px;
        }

        .error-retry-btn {
          padding: 6px 16px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .error-retry-btn:hover {
          background-color: #2563eb;
        }

        .error-retry-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default InfiniteScroll;
import { useEffect, useRef } from 'react';
import { isInWeChatBrowser } from '@/services/wechatService';

/**
 * 微信浏览器修复Hook
 * 提供针对微信浏览器常见问题的解决方案
 */
export function useWeChatFix() {
  const isWeChat = isInWeChatBrowser();

  /**
   * 修复输入框遮挡问题
   * 在微信浏览器中，键盘弹出时输入框可能被遮挡
   */
  const useInputFocusFix = () => {
    useEffect(() => {
      if (!isWeChat) return;

      const handleFocus = (event: FocusEvent) => {
        const target = event.target as HTMLElement;

        // 如果是输入框或文本域
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          // 延迟滚动以确保键盘完全弹出
          setTimeout(() => {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }, 300);
        }
      };

      document.addEventListener('focusin', handleFocus);
      return () => {
        document.removeEventListener('focusin', handleFocus);
      };
    }, [isWeChat]);
  };

  /**
   * 禁用微信下拉刷新
   * 防止微信下拉刷新与页面滚动冲突
   */
  const useDisablePullRefresh = () => {
    useEffect(() => {
      if (!isWeChat) return;

      const originalStyle = document.body.style.overscrollBehavior;
      document.body.style.overscrollBehavior = 'contain';

      return () => {
        document.body.style.overscrollBehavior = originalStyle;
      };
    }, [isWeChat]);
  };

  /**
   * 修复fixed定位问题
   * 微信浏览器中fixed定位元素可能会抖动
   */
  const useFixedPositionFix = (elementRef: React.RefObject<HTMLElement>) => {
    useEffect(() => {
      if (!isWeChat || !elementRef.current) return;

      const element = elementRef.current;
      element.classList.add('wechat-fix', 'wechat-fixed-bottom');

      return () => {
        element.classList.remove('wechat-fix', 'wechat-fixed-bottom');
      };
    }, [isWeChat, elementRef]);
  };

  /**
   * 防止微信调整字体大小
   */
  const usePreventTextAdjust = () => {
    useEffect(() => {
      if (!isWeChat) return;

      document.documentElement.classList.add('wechat-no-text-adjust');

      return () => {
        document.documentElement.classList.remove('wechat-no-text-adjust');
      };
    }, [isWeChat]);
  };

  /**
   * 修复点击延迟
   * 微信浏览器有300ms点击延迟
   */
  const useFastClick = () => {
    useEffect(() => {
      if (!isWeChat) return;

      // 添加touch-action: manipulation样式
      document.documentElement.style.touchAction = 'manipulation';

      // 使用touchstart事件模拟快速点击
      const handleTouchStart = () => {};

      document.addEventListener('touchstart', handleTouchStart, { passive: true });

      return () => {
        document.documentElement.style.touchAction = '';
        document.removeEventListener('touchstart', handleTouchStart);
      };
    }, [isWeChat]);
  };

  /**
   * 全面应用微信修复
   * 一次性应用所有常见的微信浏览器修复
   */
  const useComprehensiveWeChatFix = () => {
    useInputFocusFix();
    useDisablePullRefresh();
    usePreventTextAdjust();
    useFastClick();
  };

  return {
    isWeChat,
    useInputFocusFix,
    useDisablePullRefresh,
    useFixedPositionFix,
    usePreventTextAdjust,
    useFastClick,
    useComprehensiveWeChatFix,
  };
}

/**
 * 微信分享Hook
 * 用于在微信中配置分享
 */
export function useWeChatShare(shareConfig?: {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}) {
  useEffect(() => {
    if (!isInWeChatBrowser() || !shareConfig) return;

    import('@/services/wechatService').then(({ weChatService }) => {
      weChatService.init(false).then((initialized) => {
        if (initialized) {
          weChatService.setupShare(shareConfig);
        }
      });
    });
  }, [shareConfig]);

  const updateShare = (config: typeof shareConfig) => {
    if (!isInWeChatBrowser() || !config) return;

    import('@/services/wechatService').then(({ weChatService }) => {
      weChatService.setupShare(config);
    });
  };

  return { updateShare };
}

/**
 * 微信登录Hook
 */
export function useWeChatLogin() {
  const login = (redirectUri: string) => {
    if (!isInWeChatBrowser()) {
      console.warn('请在微信浏览器中登录');
      return null;
    }

    import('@/services/wechatService').then(({ weChatService }) => {
      const loginUrl = weChatService.getLoginUrl(redirectUri);
      window.location.href = loginUrl;
    });

    return null;
  };

  const handleCallback = async (code: string) => {
    if (!isInWeChatBrowser()) {
      throw new Error('请在微信浏览器中处理登录回调');
    }

    const { weChatService } = await import('@/services/wechatService');
    return weChatService.handleLoginCallback(code);
  };

  return { login, handleCallback };
}
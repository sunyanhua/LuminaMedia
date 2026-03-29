import React, { useState, useEffect } from 'react';
import { Share2, Link, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWeChatShare, isInWeChatBrowser } from '@/services/wechatService';
import { useWeChatShare as useWeChatShareHook } from '@/hooks/useWeChatFix';

interface WeChatShareButtonProps {
  /** 分享标题 */
  title: string;
  /** 分享描述 */
  description: string;
  /** 分享链接，默认为当前页面URL */
  link?: string;
  /** 分享图片URL */
  imageUrl?: string;
  /** 按钮样式类名 */
  className?: string;
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示分享菜单 */
  showMenu?: boolean;
  /** 自定义分享成功回调 */
  onShareSuccess?: () => void;
  /** 自定义分享失败回调 */
  onShareError?: (error: any) => void;
}

/**
 * 微信分享按钮组件
 * 在微信浏览器中显示微信分享功能，在其他浏览器中显示普通分享菜单
 */
export function WeChatShareButton({
  title,
  description,
  link = window.location.href,
  imageUrl = '/logo.png',
  className,
  size = 'md',
  showMenu = true,
  onShareSuccess,
  onShareError,
}: WeChatShareButtonProps) {
  const [isWeChat, setIsWeChat] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // 初始化微信分享
  const { updateShare } = useWeChatShareHook({
    title,
    desc: description,
    link,
    imgUrl: imageUrl,
  });

  useEffect(() => {
    setIsWeChat(isInWeChatBrowser());
  }, []);

  const handleShare = () => {
    if (isWeChat) {
      // 在微信中，直接使用JSSDK分享
      updateShare({
        title,
        desc: description,
        link,
        imgUrl: imageUrl,
      });
      onShareSuccess?.();
    } else if (showMenu) {
      // 非微信环境，显示分享菜单
      setShowShareMenu(true);
    } else {
      // 非微信环境且不显示菜单，复制链接到剪贴板
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      onShareSuccess?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      onShareError?.(error);
    }
  };

  const shareToPlatform = (platform: string) => {
    let shareUrl = '';

    switch (platform) {
      case 'weibo':
        shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title)}`;
        break;
      case 'qq':
        shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
        break;
      case 'qzone':
        shareUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
    onShareSuccess?.();
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className={cn(
          'flex items-center justify-center gap-2',
          'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
          'text-white font-medium rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900',
          'active:scale-95',
          sizeClasses[size],
          className,
          isWeChat && 'wechat-fix' // 添加微信修复类
        )}
        aria-label="分享"
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        <span>{copied ? '已复制' : isWeChat ? '微信分享' : '分享'}</span>
      </button>

      {/* 分享菜单（非微信环境） */}
      {showShareMenu && !isWeChat && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-sm text-slate-400 border-b border-slate-700">
              分享到
            </div>

            <button
              onClick={() => shareToPlatform('weibo')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
            >
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">微</span>
              </div>
              <span>微博</span>
            </button>

            <button
              onClick={() => shareToPlatform('qq')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">Q</span>
              </div>
              <span>QQ</span>
            </button>

            <button
              onClick={() => shareToPlatform('qzone')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
            >
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">Z</span>
              </div>
              <span>QQ空间</span>
            </button>

            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
            >
              <Copy className="w-5 h-5 text-slate-400" />
              <span>复制链接</span>
            </button>

            <button
              onClick={() => setShowShareMenu(false)}
              className="w-full mt-1 px-3 py-2 text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 微信登录按钮组件
 */
export function WeChatLoginButton({
  redirectUri,
  className,
  children,
}: {
  redirectUri: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [isWeChat, setIsWeChat] = useState(false);
  const { login } = useWeChatLogin();

  useEffect(() => {
    setIsWeChat(isInWeChatBrowser());
  }, []);

  const handleLogin = () => {
    if (isWeChat) {
      login(redirectUri);
    } else {
      alert('请在微信浏览器中打开以使用微信登录');
    }
  };

  return (
    <button
      onClick={handleLogin}
      className={cn(
        'flex items-center justify-center gap-3',
        'bg-green-500 hover:bg-green-600 text-white',
        'font-medium rounded-lg px-6 py-3',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        'active:scale-95',
        isWeChat && 'wechat-fix',
        className
      )}
      aria-label="微信登录"
    >
      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
        <span className="text-green-500 font-bold text-sm">微</span>
      </div>
      {children || '微信登录'}
    </button>
  );
}

export default WeChatShareButton;
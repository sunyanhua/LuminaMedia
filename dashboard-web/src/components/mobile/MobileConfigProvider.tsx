/**
 * Ant Design Mobile 配置提供者
 * 包装整个应用，提供主题、语言等配置
 */

import React from 'react';
import { ConfigProvider } from 'antd-mobile';
import { getThemeConfig } from './theme';

interface MobileConfigProviderProps {
  children: React.ReactNode;
  /**
   * 是否为暗色模式
   * @default false
   */
  darkMode?: boolean;
  /**
   * 语言配置
   * @default 'zh-CN'
   */
  locale?: 'zh-CN' | 'en-US';
}

/**
 * 移动端配置提供者组件
 * 提供Ant Design Mobile的主题、语言等全局配置
 */
export function MobileConfigProvider({
  children,
  darkMode = false,
  locale = 'zh-CN',
}: MobileConfigProviderProps) {
  const themeConfig = getThemeConfig(darkMode);

  // 语言配置
  const localeConfig = {
    'zh-CN': {
      locale: 'zh-CN',
      // 可以在这里添加自定义的中文文本
    },
    'en-US': {
      locale: 'en-US',
      // 可以在这里添加自定义的英文文本
    },
  }[locale];

  return (
    <ConfigProvider
      theme={themeConfig}
      locale={localeConfig}
      // 其他全局配置
      safeArea={{
        position: { top: true, bottom: true },
      }}
      // 手势配置
      gesture={{
        // 启用全局手势支持
        enabled: true,
        // 手势阈值
        threshold: 10,
      }}
    >
      {children}
    </ConfigProvider>
  );
}

/**
 * 导出Hook：使用移动端配置上下文
 */
export function useMobileConfig() {
  // 这里可以添加自定义的配置逻辑
  return {
    isDarkMode: false, // 可以从主题Provider获取
    toggleDarkMode: () => {},
  };
}

export default MobileConfigProvider;
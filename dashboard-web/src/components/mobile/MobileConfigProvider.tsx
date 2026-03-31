/**
 * Ant Design Mobile 配置提供者
 * 包装整个应用，提供主题、语言等配置
 */

import React from 'react';
import { ConfigProvider } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import enUS from 'antd-mobile/es/locales/en-US';
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
  const localeConfig = locale === 'zh-CN' ? zhCN : enUS;

  return (
    <ConfigProvider
      locale={localeConfig}
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
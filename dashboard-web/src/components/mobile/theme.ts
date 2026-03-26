/**
 * Ant Design Mobile 主题配置
 * 参考: https://mobile.ant.design/zh/guide/theming
 */

type ThemeConfig = any;

/**
 * 项目主题配置 - 亮色模式
 */
export const lightTheme: ThemeConfig = {
  token: {
    // 主色 - 品牌蓝色
    colorPrimary: '#1677ff',
    colorPrimaryActive: '#0958d9',
    colorPrimaryHover: '#4096ff',

    // 成功、警告、错误色
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',

    // 文本色
    colorTextBase: '#262626',
    colorTextSecondary: '#8c8c8c',
    colorTextTertiary: '#bfbfbf',

    // 背景色
    colorFill: '#f5f5f5',
    colorFillSecondary: '#fafafa',
    colorFillTertiary: '#ffffff',

    // 边框色
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',

    // 圆角
    borderRadiusXS: 4,
    borderRadiusSM: 8,
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusXL: 24,

    // 字体
    fontSizeXS: 12,
    fontSizeSM: 14,
    fontSize: 16,
    fontSizeLG: 18,
    fontSizeXL: 20,
    fontSizeXXL: 24,

    // 间距
    spacingXS: 8,
    spacingSM: 12,
    spacing: 16,
    spacingLG: 24,
    spacingXL: 32,
    spacingXXL: 48,

    // 行高
    lineHeightXS: 1.2,
    lineHeightSM: 1.4,
    lineHeight: 1.6,
    lineHeightLG: 1.8,
  },
  components: {
    // 按钮组件定制
    button: {
      colorPrimary: '#1677ff',
      borderRadius: 12,
      fontSize: 16,
      paddingHorizontal: 20,
      paddingVertical: 12,
      height: 44,
    },
    // 卡片组件定制
    card: {
      borderRadius: 16,
      padding: 16,
      backgroundColor: '#ffffff',
    },
    // 表单组件定制
    form: {
      fontSize: 16,
      labelFontSize: 14,
      labelColor: '#8c8c8c',
      extraColor: '#bfbfbf',
    },
    // 输入框组件定制
    input: {
      fontSize: 16,
      height: 44,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: '#ffffff',
    },
  },
};

/**
 * 项目主题配置 - 暗色模式
 */
export const darkTheme: ThemeConfig = {
  token: {
    // 主色 - 亮蓝色
    colorPrimary: '#4096ff',
    colorPrimaryActive: '#0958d9',
    colorPrimaryHover: '#1677ff',

    // 成功、警告、错误色
    colorSuccess: '#73d13d',
    colorWarning: '#ffc53d',
    colorError: '#ff7875',

    // 文本色
    colorTextBase: '#f0f0f0',
    colorTextSecondary: '#bfbfbf',
    colorTextTertiary: '#8c8c8c',

    // 背景色
    colorFill: '#1f1f1f',
    colorFillSecondary: '#262626',
    colorFillTertiary: '#141414',

    // 边框色
    colorBorder: '#434343',
    colorBorderSecondary: '#303030',

    // 圆角（与亮色模式保持一致）
    borderRadiusXS: 4,
    borderRadiusSM: 8,
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusXL: 24,

    // 字体（与亮色模式保持一致）
    fontSizeXS: 12,
    fontSizeSM: 14,
    fontSize: 16,
    fontSizeLG: 18,
    fontSizeXL: 20,
    fontSizeXXL: 24,

    // 间距（与亮色模式保持一致）
    spacingXS: 8,
    spacingSM: 12,
    spacing: 16,
    spacingLG: 24,
    spacingXL: 32,
    spacingXXL: 48,

    // 行高（与亮色模式保持一致）
    lineHeightXS: 1.2,
    lineHeightSM: 1.4,
    lineHeight: 1.6,
    lineHeightLG: 1.8,
  },
  components: {
    // 按钮组件定制
    button: {
      colorPrimary: '#4096ff',
      borderRadius: 12,
      fontSize: 16,
      paddingHorizontal: 20,
      paddingVertical: 12,
      height: 44,
    },
    // 卡片组件定制
    card: {
      borderRadius: 16,
      padding: 16,
      backgroundColor: '#262626',
    },
    // 表单组件定制
    form: {
      fontSize: 16,
      labelFontSize: 14,
      labelColor: '#bfbfbf',
      extraColor: '#8c8c8c',
    },
    // 输入框组件定制
    input: {
      fontSize: 16,
      height: 44,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: '#262626',
    },
  },
};

/**
 * 获取当前主题配置
 * @param isDarkMode 是否为暗色模式
 */
export function getThemeConfig(isDarkMode: boolean = false): ThemeConfig {
  return isDarkMode ? darkTheme : lightTheme;
}

/**
 * 导出默认主题（亮色）
 */
export default lightTheme;
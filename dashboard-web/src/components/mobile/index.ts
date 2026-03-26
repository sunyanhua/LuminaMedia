/**
 * 移动端组件库入口文件
 * 基于Ant Design Mobile的移动端组件库
 */

// 主题配置
export * from './theme';
export * from './MobileConfigProvider';

// 业务组件
export * from './MobileCard';
export * from './MobileForm';
export * from './MobileTable';
export * from './MobileChart';

// 手势支持
export * from './gestures';

// 类型导出
export type {
  MobileCardProps,
  MobileFormProps,
  MobileFormItemProps,
  MobileTableProps,
  MobileTableColumn,
  MobileChartProps,
  ChartType,
  ChartSeries,
  GestureEvent,
  GestureOptions,
  GestureCallbacks,
} from './';

// 默认导出（按需）
import MobileCard from './MobileCard';
import MobileForm from './MobileForm';
import MobileTable from './MobileTable';
import MobileChart from './MobileChart';
import MobileConfigProvider from './MobileConfigProvider';

export {
  MobileCard,
  MobileForm,
  MobileTable,
  MobileChart,
  MobileConfigProvider,
};

/**
 * 移动端组件库使用示例：
 *
 * ```tsx
 * import {
 *   MobileCard,
 *   MobileForm,
 *   MobileTable,
 *   MobileChart,
 *   MobileConfigProvider,
 *   useGestures,
 * } from '@/components/mobile';
 *
 * // 在应用根组件中包装
 * <MobileConfigProvider darkMode={isDarkMode}>
 *   <App />
 * </MobileConfigProvider>
 * ```
 */
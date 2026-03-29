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

// 触摸交互组件
export * from './TouchFeedback';
export * from './PullToRefresh';
export * from './InfiniteScroll';
export * from './SwipeableCard';

// 类型导出
export type {
  MobileCardProps,
} from './MobileCard';
export type {
  MobileFormProps,
  MobileFormItemProps,
} from './MobileForm';
export type {
  MobileTableProps,
  MobileTableColumn,
} from './MobileTable';
export type {
  MobileChartProps,
  ChartType,
  ChartSeries,
} from './MobileChart';
export type {
  GestureEvent,
  GestureOptions,
  GestureCallbacks,
} from './gestures';
export type {
  TouchFeedbackProps,
  Ripple,
} from './TouchFeedback';
export type {
  PullToRefreshProps,
  PullToRefreshState,
} from './PullToRefresh';
export type {
  InfiniteScrollProps,
  InfiniteScrollState,
} from './InfiniteScroll';
export type {
  SwipeableCardProps,
  SwipeAction,
  SwipeableCardState,
} from './SwipeableCard';

// 默认导出（按需）
import MobileCard from './MobileCard';
import MobileForm from './MobileForm';
import MobileTable from './MobileTable';
import MobileChart from './MobileChart';
import MobileConfigProvider from './MobileConfigProvider';
import TouchFeedback from './TouchFeedback';
import PullToRefresh from './PullToRefresh';
import InfiniteScroll from './InfiniteScroll';
import SwipeableCard from './SwipeableCard';

export {
  MobileCard,
  MobileForm,
  MobileTable,
  MobileChart,
  MobileConfigProvider,
  TouchFeedback,
  PullToRefresh,
  InfiniteScroll,
  SwipeableCard,
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
 *   TouchFeedback,
 *   PullToRefresh,
 *   InfiniteScroll,
 *   SwipeableCard,
 * } from '@/components/mobile';
 *
 * // 在应用根组件中包装
 * <MobileConfigProvider darkMode={isDarkMode}>
 *   <App />
 * </MobileConfigProvider>
 * ```
 */
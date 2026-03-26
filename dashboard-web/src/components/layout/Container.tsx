import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * 是否使用最大宽度约束
   * @default true
   */
  constrained?: boolean;
  /**
   * 是否启用内边距
   * @default true
   */
  padded?: boolean;
}

/**
 * 响应式容器组件
 *
 * 提供移动优先的响应式布局容器，支持从手机到桌面的断点适配。
 * - 移动端: 全宽，左右内边距
 * - 平板端: 最大宽度增加
 * - 桌面端: 标准容器宽度
 *
 * 触摸目标优化：所有交互元素最小尺寸 44×44px
 */
export function Container({
  children,
  className,
  constrained = true,
  padded = true,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        // 移动端基础内边距
        padded && 'px-4 xs:px-6',
        // 响应式最大宽度约束
        constrained && [
          'mx-auto',
          'max-w-full', // 移动端全宽
          'sm:max-w-screen-sm',
          'md:max-w-screen-md',
          'lg:max-w-screen-lg',
          'xl:max-w-screen-xl',
          '2xl:max-w-screen-2xl',
        ],
        // 触摸目标优化：确保内部交互元素有足够大小
        'touch-target-optimized',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * 网格布局组件 - 移动优先响应式网格
 */
export function Grid({
  children,
  className,
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  xlCols,
  gap = 4,
}: {
  children: ReactNode;
  className?: string;
  cols?: number;
  smCols?: number;
  mdCols?: number;
  lgCols?: number;
  xlCols?: number;
  gap?: number;
}) {
  const gridCols = [
    `grid-cols-${cols}`,
    smCols && `sm:grid-cols-${smCols}`,
    mdCols && `md:grid-cols-${mdCols}`,
    lgCols && `lg:grid-cols-${lgCols}`,
    xlCols && `xl:grid-cols-${xlCols}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cn(
        'grid',
        gridCols,
        `gap-${gap}`,
        'w-full',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * 弹性布局组件 - 响应式Flex容器
 */
export function Flex({
  children,
  className,
  direction = 'col',
  smDirection,
  mdDirection,
  lgDirection,
  xlDirection,
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 4,
}: {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  smDirection?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  mdDirection?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  lgDirection?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  xlDirection?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: boolean;
  gap?: number;
}) {
  const flexDirection = [
    `flex-${direction}`,
    smDirection && `sm:flex-${smDirection}`,
    mdDirection && `md:flex-${mdDirection}`,
    lgDirection && `lg:flex-${lgDirection}`,
    xlDirection && `xl:flex-${xlDirection}`,
  ]
    .filter(Boolean)
    .join(' ');

  const justifyContent = `justify-${justify}`;
  const alignItems = `items-${align}`;
  const flexWrap = wrap ? 'flex-wrap' : 'flex-nowrap';

  return (
    <div
      className={cn(
        'flex',
        flexDirection,
        justifyContent,
        alignItems,
        flexWrap,
        `gap-${gap}`,
        'w-full',
        className
      )}
    >
      {children}
    </div>
  );
}
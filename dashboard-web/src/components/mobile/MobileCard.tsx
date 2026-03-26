/**
 * 移动端数据卡片组件
 * 基于Ant Design Mobile Card组件，适配移动端显示
 */

import React from 'react';
import { Card, Tag, Space, Button } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { cn } from '../../lib/utils';

export interface MobileCardProps {
  /**
   * 卡片标题
   */
  title: string;
  /**
   * 卡片副标题
   */
  subtitle?: string;
  /**
   * 卡片内容
   */
  children?: React.ReactNode;
  /**
   * 卡片标签
   */
  tags?: string[];
  /**
   * 统计数值
   */
  stats?: {
    value: string | number;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
    change?: string;
  }[];
  /**
   * 操作按钮
   */
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'outline';
  }[];
  /**
   * 点击卡片回调
   */
  onClick?: () => void;
  /**
   * 是否显示箭头
   * @default false
   */
  showArrow?: boolean;
  /**
   * 卡片样式类名
   */
  className?: string;
  /**
   * 卡片内容样式类名
   */
  bodyClassName?: string;
  /**
   * 是否为紧凑模式（减少内边距）
   * @default false
   */
  compact?: boolean;
  /**
   * 卡片边框样式
   * @default 'default'
   */
  border?: 'default' | 'none' | 'shadow';
}

/**
 * 移动端数据卡片组件
 */
export function MobileCard({
  title,
  subtitle,
  children,
  tags = [],
  stats = [],
  actions = [],
  onClick,
  showArrow = false,
  className,
  bodyClassName,
  compact = false,
  border = 'default',
}: MobileCardProps) {
  const borderClasses = {
    default: 'border border-border',
    none: 'border-0',
    shadow: 'shadow-md border-0',
  }[border];

  return (
    <Card
      className={cn(
        'w-full',
        compact ? 'p-3' : 'p-4',
        borderClasses,
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
      onClick={onClick}
    >
      {/* 卡片头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-foreground truncate">
              {title}
            </h3>
            {showArrow && (
              <RightOutline className="text-text-tertiary text-sm" />
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-text-secondary truncate">{subtitle}</p>
          )}
        </div>

        {/* 标签 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Tag
                key={index}
                color="default"
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* 卡片内容 */}
      {children && (
        <div className={cn('mb-3', bodyClassName)}>
          {children}
        </div>
      )}

      {/* 统计信息 */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {stat.label}
              </div>
              {stat.change && (
                <div
                  className={cn(
                    'text-xs mt-0.5',
                    stat.trend === 'up'
                      ? 'text-success'
                      : stat.trend === 'down'
                      ? 'text-error'
                      : 'text-text-tertiary'
                  )}
                >
                  {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '↔'} {stat.change}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      {actions.length > 0 && (
        <div className="flex gap-2 mt-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              size="small"
              color={action.variant === 'primary' ? 'primary' : 'default'}
              fill={action.variant === 'outline' ? 'outline' : 'solid'}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className="flex-1"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}

/**
 * 卡片组组件 - 用于垂直排列多个卡片
 */
export function MobileCardGroup({
  children,
  spacing = 'default',
  className,
}: {
  children: React.ReactNode;
  spacing?: 'default' | 'compact' | 'none';
  className?: string;
}) {
  const spacingClasses = {
    default: 'space-y-4',
    compact: 'space-y-2',
    none: 'space-y-0',
  }[spacing];

  return (
    <div className={cn(spacingClasses, className)}>
      {children}
    </div>
  );
}

export default MobileCard;
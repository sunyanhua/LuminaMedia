/**
 * 移动端图表适配器
 * 基于Recharts，优化移动端图表显示和交互
 */

import React, { useState, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  ComposedChart,
  Line,
  Bar,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Sector,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Button, Space, Loading, Empty } from 'antd-mobile';
import {
  DownlandOutline as DownloadOutline,
  RedoOutline as RefreshOutline,
  EyeOutline,
  EyeInvisibleOutline,
} from 'antd-mobile-icons';
import { cn } from '../../lib/utils';

export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'pie'
  | 'radar'
  | 'composed'
  | 'scatter';

export interface ChartSeries {
  /**
   * 数据字段名
   */
  dataKey: string;
  /**
   * 系列名称
   */
  name: string;
  /**
   * 颜色
   */
  color?: string;
  /**
   * 图表类型（在组合图表中使用）
   */
  type?: 'line' | 'bar' | 'area';
  /**
   * 是否隐藏
   */
  hidden?: boolean;
  /**
   * 是否启用动画
   */
  animation?: boolean;
}

export interface MobileChartProps {
  /**
   * 图表类型
   */
  type: ChartType;
  /**
   * 图表数据
   */
  data: any[];
  /**
   * 图表系列配置
   */
  series: ChartSeries[];
  /**
   * X轴数据字段名
   */
  xAxisKey?: string;
  /**
   * 图表标题
   */
  title?: string;
  /**
   * 图表描述
   */
  description?: string;
  /**
   * 图表高度
   * @default 300
   */
  height?: number;
  /**
   * 是否显示工具栏
   * @default true
   */
  showToolbar?: boolean;
  /**
   * 是否显示图例
   * @default true
   */
  showLegend?: boolean;
  /**
   * 是否显示工具提示
   * @default true
   */
  showTooltip?: boolean;
  /**
   * 是否显示网格
   * @default true
   */
  showGrid?: boolean;
  /**
   * 是否显示坐标轴
   * @default true
   */
  showAxes?: boolean;
  /**
   * 是否正在加载
   */
  loading?: boolean;
  /**
   * 空状态文本
   */
  emptyText?: string;
  /**
   * 是否响应式
   * @default true
   */
  responsive?: boolean;
  /**
   * 点击图表回调
   */
  onClick?: (data: any, index: number) => void;
  /**
   * 点击系列回调
   */
  onSeriesClick?: (series: ChartSeries, index: number) => void;
  /**
   * 下载图表回调
   */
  onDownload?: (chartType: string) => void;
  /**
   * 刷新图表回调
   */
  onRefresh?: () => void;
  /**
   * 图表类名
   */
  className?: string;
  /**
   * 容器类名
   */
  containerClassName?: string;
  /**
   * 是否为暗色模式
   */
  darkMode?: boolean;
}

/**
 * 移动端图表组件
 */
export function MobileChart({
  type,
  data,
  series,
  xAxisKey = 'name',
  title,
  description,
  height = 300,
  showToolbar = true,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showAxes = true,
  loading = false,
  emptyText = '暂无数据',
  responsive = true,
  onClick,
  onSeriesClick,
  onDownload,
  onRefresh,
  className,
  containerClassName,
  darkMode = false,
}: MobileChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const chartRef = useRef<any>(null);

  // 过滤隐藏的系列
  const visibleSeries = series.filter(
    (s) => !s.hidden && !hiddenSeries.has(s.dataKey)
  );

  // 切换系列显示/隐藏
  const toggleSeries = (dataKey: string) => {
    const newHidden = new Set(hiddenSeries);
    if (newHidden.has(dataKey)) {
      newHidden.delete(dataKey);
    } else {
      newHidden.add(dataKey);
    }
    setHiddenSeries(newHidden);
  };

  // 下载图表
  const handleDownload = () => {
    if (onDownload) {
      onDownload(type);
    } else {
      // 默认下载逻辑
      const svgElement = chartRef.current?.container?.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'chart'}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  // 渲染图表
  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <Loading />
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <Empty description={emptyText} />
        </div>
      );
    }

    const chartProps = {
      data,
      onClick: (_: any, index: number) => onClick?.(data[index], index),
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    };

    const commonProps = {
      strokeWidth: 2,
      dot: { r: 3 },
      activeDot: { r: 5 },
      animationDuration: 500,
    };

    const colorPalette = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
      '#00c49f', '#ffbb28', '#ff6b6b', '#6b5b95', '#feb236'
    ];

    // 渲染系列
    const renderSeries = () => {
      return visibleSeries.map((s, index) => {
        const color = s.color || colorPalette[index % colorPalette.length];
        const props = {
          key: s.dataKey,
          dataKey: s.dataKey,
          name: s.name,
          stroke: color,
          fill: color,
          ...commonProps,
          animation: s.animation !== false,
          onClick: () => onSeriesClick?.(s, index),
        };

        switch (type) {
          case 'line':
            return <Line {...props} />;
          case 'bar':
            return <Bar {...props} />;
          case 'area':
            return <Area {...props} />;
          case 'composed':
            return s.type === 'bar' ? (
              <Bar {...props} />
            ) : s.type === 'area' ? (
              <Area {...props} />
            ) : (
              <Line {...props} />
            );
          default:
            return <Line {...props} />;
        }
      });
    };

    // 渲染饼图
    const renderPieChart = () => {
      const activeSeries = series[0] || { dataKey: 'value', name: 'value' };
      const color = activeSeries.color || colorPalette[0];

      return (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={80}
            fill={color}
            dataKey={activeSeries.dataKey}
            nameKey={xAxisKey}
            activeIndex={activePieIndex}
            activeShape={(props: any) => (
              <Sector
                {...props}
                outerRadius={90}
                fill={color}
                opacity={0.8}
              />
            )}
            onClick={(_, index) => setActivePieIndex(index)}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colorPalette[index % colorPalette.length]}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
        </PieChart>
      );
    };

    // 渲染雷达图
    const renderRadarChart = () => {
      return (
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey={xAxisKey} />
          <PolarRadiusAxis />
          {visibleSeries.map((s, index) => {
            const color = s.color || colorPalette[index % colorPalette.length];
            return (
              <Radar
                key={s.dataKey}
                name={s.name}
                dataKey={s.dataKey}
                stroke={color}
                fill={color}
                fillOpacity={0.6}
              />
            );
          })}
          {showLegend && <Legend />}
          {showTooltip && <Tooltip />}
        </RadarChart>
      );
    };

    // 选择主图表
    let ChartComponent;
    switch (type) {
      case 'line':
        ChartComponent = LineChart;
        break;
      case 'bar':
        ChartComponent = BarChart;
        break;
      case 'area':
        ChartComponent = AreaChart;
        break;
      case 'pie':
        return renderPieChart();
      case 'radar':
        return renderRadarChart();
      case 'composed':
        ChartComponent = ComposedChart;
        break;
      default:
        ChartComponent = LineChart;
    }

    return (
      <ChartComponent {...chartProps} ref={chartRef}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
        {showAxes && xAxisKey && (
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e5e5' }}
          />
        )}
        {showAxes && (
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e5e5' }}
          />
        )}
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {renderSeries()}
      </ChartComponent>
    );
  };

  // 图表容器
  const chartContainer = responsive ? (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  ) : (
    <div style={{ width: '100%', height }}>
      {renderChart()}
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      {/* 标题和描述 */}
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>
      )}

      {/* 工具栏 */}
      {showToolbar && (
        <div className="flex items-center justify-between mb-4">
          <Space wrap>
            {series.map((s, index) => (
              <Button
                key={s.dataKey}
                size="small"
                fill={hiddenSeries.has(s.dataKey) ? 'outline' : 'solid'}
                onClick={() => toggleSeries(s.dataKey)}
                className="text-xs"
              >
                {hiddenSeries.has(s.dataKey) ? (
                  <EyeInvisibleOutline />
                ) : (
                  <EyeOutline />
                )}
                <span className="ml-1">{s.name}</span>
              </Button>
            ))}
          </Space>

          <Space>
            {onRefresh && (
              <Button size="small" onClick={onRefresh}>
                <RefreshOutline />
              </Button>
            )}
            <Button size="small" onClick={handleDownload}>
              <DownloadOutline />
            </Button>
          </Space>
        </div>
      )}

      {/* 图表容器 */}
      <div className={cn('bg-white dark:bg-gray-900 rounded-lg p-4', containerClassName)}>
        {chartContainer}
      </div>
    </div>
  );
}

/**
 * 简化版折线图
 */
export function MobileLineChart(props: Omit<MobileChartProps, 'type'>) {
  return <MobileChart type="line" {...props} />;
}

/**
 * 简化版柱状图
 */
export function MobileBarChart(props: Omit<MobileChartProps, 'type'>) {
  return <MobileChart type="bar" {...props} />;
}

/**
 * 简化版饼图
 */
export function MobilePieChart(props: Omit<MobileChartProps, 'type'>) {
  return <MobileChart type="pie" {...props} />;
}

/**
 * 简化版面积图
 */
export function MobileAreaChart(props: Omit<MobileChartProps, 'type'>) {
  return <MobileChart type="area" {...props} />;
}

/**
 * 仪表盘图表 - 组合多个图表
 */
export function MobileDashboard({
  charts,
  columns = 1,
  className,
}: {
  charts: React.ReactNode[];
  columns?: 1 | 2;
  className?: string;
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
  }[columns];

  return (
    <div className={cn('grid gap-4', gridClasses, className)}>
      {charts.map((chart, index) => (
        <div key={index} className="bg-card rounded-lg p-4">
          {chart}
        </div>
      ))}
    </div>
  );
}

export default MobileChart;
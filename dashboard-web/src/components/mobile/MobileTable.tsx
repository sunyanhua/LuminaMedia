/**
 * 移动端表格组件（支持虚拟滚动）
 * 优化移动端表格显示和交互
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Pagination,
  Empty,
  Loading,
} from 'antd-mobile';
import { SearchOutline, FilterOutline, SortAscendingOutline } from 'antd-mobile-icons';
import type { TableProps as MobileTableProps } from 'antd-mobile';
import { cn } from '../../lib/utils';

export interface MobileTableColumn<T = any> {
  /**
   * 列标题
   */
  title: string;
  /**
   * 数据字段名
   */
  dataIndex: string;
  /**
   * 列宽（像素或百分比）
   */
  width?: number | string;
  /**
   * 自定义渲染函数
   */
  render?: (text: any, record: T, index: number) => React.ReactNode;
  /**
   * 是否可排序
   */
  sortable?: boolean;
  /**
   * 是否可筛选
   */
  filterable?: boolean;
  /**
   * 对齐方式
   */
  align?: 'left' | 'center' | 'right';
  /**
   * 是否固定在左侧
   */
  fixed?: 'left' | 'right';
}

export interface MobileTableProps<T = any> extends Omit<MobileTableProps<T>, 'columns' | 'data'> {
  /**
   * 表格列配置
   */
  columns: MobileTableColumn<T>[];
  /**
   * 表格数据
   */
  data: T[];
  /**
   * 是否启用虚拟滚动
   * @default true
   */
  virtualScroll?: boolean;
  /**
   * 虚拟滚动每项高度（像素）
   * @default 50
   */
  itemHeight?: number;
  /**
   * 虚拟滚动可视区域高度（像素）
   * @default 400
   */
  viewportHeight?: number;
  /**
   * 是否显示搜索框
   * @default false
   */
  showSearch?: boolean;
  /**
   * 搜索框占位符
   */
  searchPlaceholder?: string;
  /**
   * 搜索回调
   */
  onSearch?: (keyword: string) => void;
  /**
   * 是否显示分页
   * @default true
   */
  showPagination?: boolean;
  /**
   * 当前页码
   */
  currentPage?: number;
  /**
   * 每页条数
   */
  pageSize?: number;
  /**
   * 总条数
   */
  total?: number;
  /**
   * 分页变化回调
   */
  onPageChange?: (page: number, pageSize: number) => void;
  /**
   * 是否正在加载
   */
  loading?: boolean;
  /**
   * 空状态显示文本
   */
  emptyText?: string;
  /**
   * 表格类名
   */
  className?: string;
  /**
   * 表格行类名
   */
  rowClassName?: string | ((record: T, index: number) => string);
  /**
   * 点击行回调
   */
  onRowClick?: (record: T, index: number) => void;
  /**
   * 是否启用斑马纹
   * @default true
   */
  striped?: boolean;
}

/**
 * 移动端表格组件
 */
export function MobileTable<T extends Record<string, any> = any>({
  columns,
  data,
  virtualScroll = true,
  itemHeight = 50,
  viewportHeight = 400,
  showSearch = false,
  searchPlaceholder = '搜索...',
  onSearch,
  showPagination = true,
  currentPage = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  loading = false,
  emptyText = '暂无数据',
  className,
  rowClassName,
  onRowClick,
  striped = true,
  ...tableProps
}: MobileTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const viewportRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  // 处理排序
  const handleSort = (column: MobileTableColumn<T>) => {
    if (!column.sortable) return;

    if (sortColumn === column.dataIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column.dataIndex);
      setSortDirection('asc');
    }
  };

  // 虚拟滚动计算可见区域
  useEffect(() => {
    if (!virtualScroll || !viewportRef.current) return;

    const calculateVisibleRange = () => {
      const scrollTop = viewportRef.current?.scrollTop || 0;
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(
        start + Math.ceil(viewportHeight / itemHeight),
        data.length
      );
      setVisibleRange({ start, end });
    };

    const viewport = viewportRef.current;
    viewport.addEventListener('scroll', calculateVisibleRange);
    calculateVisibleRange();

    return () => viewport.removeEventListener('scroll', calculateVisibleRange);
  }, [virtualScroll, itemHeight, viewportHeight, data.length]);

  // 渲染虚拟滚动表格
  const renderVirtualTable = () => {
    const { start, end } = visibleRange;
    const visibleData = data.slice(start, end);
    const offsetY = start * itemHeight;

    return (
      <div
        ref={viewportRef}
        className="overflow-auto relative"
        style={{ height: `${viewportHeight}px` }}
      >
        {/* 占位高度，撑开滚动区域 */}
        <div style={{ height: `${data.length * itemHeight}px` }}>
          {/* 可见数据行 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              transform: `translateY(${offsetY}px)`,
            }}
          >
            <Table<T> className="w-full">
              <Table.Header>
                <Table.Row>
                  {columns.map((column, index) => (
                    <Table.Column
                      key={column.dataIndex || index}
                      width={column.width}
                      align={column.align}
                      fixed={column.fixed}
                      onClick={() => handleSort(column)}
                      className={cn(
                        'font-semibold',
                        column.sortable && 'cursor-pointer'
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {column.title}
                        {column.sortable && sortColumn === column.dataIndex && (
                          <SortAscendingOutline
                            className={cn(
                              'text-xs',
                              sortDirection === 'desc' && 'rotate-180'
                            )}
                          />
                        )}
                      </div>
                    </Table.Column>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {visibleData.map((record, rowIndex) => {
                  const actualIndex = start + rowIndex;
                  return (
                    <Table.Row
                      key={record.id || actualIndex}
                      onClick={() => onRowClick?.(record, actualIndex)}
                      className={cn(
                        'transition-colors',
                        striped && actualIndex % 2 === 0 && 'bg-gray-50 dark:bg-gray-900',
                        onRowClick && 'cursor-pointer active:bg-gray-100 dark:active:bg-gray-800',
                        typeof rowClassName === 'function'
                          ? rowClassName(record, actualIndex)
                          : rowClassName
                      )}
                    >
                      {columns.map((column, colIndex) => (
                        <Table.Cell
                          key={`${actualIndex}-${column.dataIndex || colIndex}`}
                          width={column.width}
                          align={column.align}
                          fixed={column.fixed}
                        >
                          {column.render
                            ? column.render(record[column.dataIndex], record, actualIndex)
                            : record[column.dataIndex]}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  // 渲染普通表格
  const renderNormalTable = () => (
    <div className="overflow-auto">
      <Table<T>
        columns={columns.map((column) => ({
          key: column.dataIndex,
          title: column.title,
          width: column.width,
          align: column.align,
          fixed: column.fixed,
          onHeaderCell: column.sortable
            ? () => ({
                onClick: () => handleSort(column),
                className: 'cursor-pointer',
              })
            : undefined,
          render: column.render,
        }))}
        data={data}
        rowClassName={(record, index) =>
          cn(
            striped && index % 2 === 0 && 'bg-gray-50 dark:bg-gray-900',
            onRowClick && 'cursor-pointer active:bg-gray-100 dark:active:bg-gray-800',
            typeof rowClassName === 'function'
              ? rowClassName(record, index)
              : rowClassName
          )
        }
        onRowClick={onRowClick}
        {...tableProps}
      />
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      {/* 搜索和筛选栏 */}
      {(showSearch || columns.some(col => col.filterable)) && (
        <div className="flex items-center gap-2 mb-4">
          {showSearch && (
            <Input
              value={searchValue}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              clearable
              prefix={<SearchOutline />}
              className="flex-1"
            />
          )}
          {columns.some(col => col.filterable) && (
            <Button>
              <FilterOutline />
            </Button>
          )}
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      ) : data.length === 0 ? (
        <Empty description={emptyText} />
      ) : virtualScroll ? (
        renderVirtualTable()
      ) : (
        renderNormalTable()
      )}

      {/* 分页 */}
      {showPagination && total > 0 && (
        <div className="flex justify-center mt-4">
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={(page) => onPageChange?.(page, pageSize)}
            className="custom-pagination"
          />
        </div>
      )}
    </div>
  );
}

/**
 * 简化版表格 - 适用于简单数据展示
 */
export function SimpleMobileTable<T extends Record<string, any> = any>({
  columns,
  data,
  ...props
}: Omit<MobileTableProps<T>, 'virtualScroll' | 'showPagination'>) {
  return (
    <MobileTable
      columns={columns}
      data={data}
      virtualScroll={false}
      showPagination={false}
      showSearch={false}
      {...props}
    />
  );
}

/**
 * 卡片式表格 - 每行显示为卡片，适用于移动端小屏幕
 */
export function CardMobileTable<T extends Record<string, any> = any>({
  columns,
  data,
  renderCard,
  ...props
}: Omit<MobileTableProps<T>, 'virtualScroll'> & {
  renderCard?: (record: T, index: number) => React.ReactNode;
}) {
  if (renderCard) {
    return (
      <div className="space-y-3">
        {data.map((record, index) => (
          <div key={record.id || index}>
            {renderCard(record, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((record, index) => (
        <div
          key={record.id || index}
          className="bg-card rounded-lg p-4 shadow-sm border"
          onClick={() => props.onRowClick?.(record, index)}
        >
          {columns.map((column) => (
            <div key={column.dataIndex} className="flex justify-between mb-2 last:mb-0">
              <span className="text-text-secondary text-sm">{column.title}:</span>
              <span className="text-foreground font-medium">
                {column.render
                  ? column.render(record[column.dataIndex], record, index)
                  : record[column.dataIndex]}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default MobileTable;
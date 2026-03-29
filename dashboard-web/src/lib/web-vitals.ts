import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

type ReportHandler = (metric: Metric) => void;

/**
 * 报告单个Web Vitals指标
 */
function reportWebVitals(onPerfEntry?: ReportHandler) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
}

/**
 * 控制台报告器 - 在开发环境中输出到控制台
 */
function consoleReporter(metric: Metric) {
  console.log(`[Web Vitals] ${metric.name}: ${Math.round(metric.value * 100) / 100}`, metric);
}

/**
 * 分析服务报告器 - 生产环境中发送到分析服务
 */
function analyticsReporter(metric: Metric) {
  // 在实际应用中，这里可以发送数据到Google Analytics、自定义后端等
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // 使用navigator.sendBeacon或fetch发送
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/web-vitals', body);
  } else {
    fetch('/api/web-vitals', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    });
  }
}

/**
 * 根据环境选择报告器
 */
function getReporter(): ReportHandler {
  if (process.env.NODE_ENV === 'production') {
    return analyticsReporter;
  }
  return consoleReporter;
}

/**
 * 初始化Web Vitals监控
 */
export function initWebVitals() {
  const reporter = getReporter();
  reportWebVitals(reporter);

  // 额外性能监控：长任务检测
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`[Performance] 长任务 detected: ${entry.duration}ms`, entry);
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  }

  console.log('[Web Vitals] 性能监控已初始化');
}

export default reportWebVitals;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREDEFINED_METRICS = exports.MetricType = void 0;
var MetricType;
(function (MetricType) {
    MetricType["COUNTER"] = "counter";
    MetricType["GAUGE"] = "gauge";
    MetricType["HISTOGRAM"] = "histogram";
    MetricType["SUMMARY"] = "summary";
})(MetricType || (exports.MetricType = MetricType = {}));
exports.PREDEFINED_METRICS = [
    {
        name: 'http_requests_total',
        description: 'HTTP请求总数',
        type: MetricType.COUNTER,
        defaultTags: { protocol: 'http' },
    },
    {
        name: 'http_request_duration_ms',
        description: 'HTTP请求耗时（毫秒）',
        type: MetricType.HISTOGRAM,
        defaultTags: { protocol: 'http' },
    },
    {
        name: 'http_errors_total',
        description: 'HTTP错误总数',
        type: MetricType.COUNTER,
        defaultTags: { protocol: 'http' },
    },
    {
        name: 'database_queries_total',
        description: '数据库查询总数',
        type: MetricType.COUNTER,
        defaultTags: { type: 'query' },
    },
    {
        name: 'database_query_duration_ms',
        description: '数据库查询耗时（毫秒）',
        type: MetricType.HISTOGRAM,
        defaultTags: { type: 'query' },
    },
    {
        name: 'active_users',
        description: '活跃用户数',
        type: MetricType.GAUGE,
        defaultTags: {},
    },
    {
        name: 'content_published_total',
        description: '内容发布总数',
        type: MetricType.COUNTER,
        defaultTags: {},
    },
    {
        name: 'ai_requests_total',
        description: 'AI请求总数',
        type: MetricType.COUNTER,
        defaultTags: { provider: 'gemini' },
    },
    {
        name: 'ai_request_duration_ms',
        description: 'AI请求耗时（毫秒）',
        type: MetricType.HISTOGRAM,
        defaultTags: { provider: 'gemini' },
    },
    {
        name: 'queue_length',
        description: '任务队列长度',
        type: MetricType.GAUGE,
        defaultTags: { queue: 'publish' },
    },
];
//# sourceMappingURL=metrics.interface.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStatus = exports.TaskStatus = exports.CollectionMethod = exports.PlatformType = void 0;
var PlatformType;
(function (PlatformType) {
    PlatformType["WECHAT"] = "wechat";
    PlatformType["WEIBO"] = "weibo";
    PlatformType["XIAOHONGSHU"] = "xiaohongshu";
    PlatformType["DOUYIN"] = "douyin";
    PlatformType["NEWS"] = "news";
    PlatformType["FORUM"] = "forum";
    PlatformType["OTHER"] = "other";
})(PlatformType || (exports.PlatformType = PlatformType = {}));
var CollectionMethod;
(function (CollectionMethod) {
    CollectionMethod["API"] = "api";
    CollectionMethod["RSS"] = "rss";
    CollectionMethod["CRAWLER"] = "crawler";
    CollectionMethod["HYBRID"] = "hybrid";
})(CollectionMethod || (exports.CollectionMethod = CollectionMethod = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["SCHEDULED"] = "scheduled";
    TaskStatus["RUNNING"] = "running";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["RETRYING"] = "retrying";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var DataStatus;
(function (DataStatus) {
    DataStatus["RAW"] = "raw";
    DataStatus["CLEANED"] = "cleaned";
    DataStatus["PROCESSED"] = "processed";
    DataStatus["ARCHIVED"] = "archived";
    DataStatus["DELETED"] = "deleted";
})(DataStatus || (exports.DataStatus = DataStatus = {}));
//# sourceMappingURL=data-collection.interface.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishStatusType = exports.PlatformType = void 0;
var PlatformType;
(function (PlatformType) {
    PlatformType["WECHAT"] = "wechat";
    PlatformType["XIAOHONGSHU"] = "xiaohongshu";
    PlatformType["WEIBO"] = "weibo";
    PlatformType["DOUYIN"] = "douyin";
    PlatformType["TIKTOK"] = "tiktok";
    PlatformType["BILIBILI"] = "bilibili";
    PlatformType["KUAISHOU"] = "kuaishou";
    PlatformType["OTHER"] = "other";
})(PlatformType || (exports.PlatformType = PlatformType = {}));
var PublishStatusType;
(function (PublishStatusType) {
    PublishStatusType["DRAFT"] = "draft";
    PublishStatusType["PENDING"] = "pending";
    PublishStatusType["PUBLISHING"] = "publishing";
    PublishStatusType["PUBLISHED"] = "published";
    PublishStatusType["FAILED"] = "failed";
    PublishStatusType["DELETED"] = "deleted";
    PublishStatusType["SCHEDULED"] = "scheduled";
})(PublishStatusType || (exports.PublishStatusType = PublishStatusType = {}));
//# sourceMappingURL=platform-adapter.interface.js.map
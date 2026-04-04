"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceLevel = exports.GovernmentContentStyle = exports.GovernmentContentType = void 0;
var GovernmentContentType;
(function (GovernmentContentType) {
    GovernmentContentType["OFFICIAL_DOCUMENT"] = "official_document";
    GovernmentContentType["ANTI_FRAUD"] = "anti_fraud";
    GovernmentContentType["POLICY_INTERPRETATION"] = "policy_interpretation";
    GovernmentContentType["GOVERNMENT_SERVICE"] = "government_service";
    GovernmentContentType["PUBLIC_ANNOUNCEMENT"] = "public_announcement";
    GovernmentContentType["EMERGENCY_RESPONSE"] = "emergency_response";
})(GovernmentContentType || (exports.GovernmentContentType = GovernmentContentType = {}));
var GovernmentContentStyle;
(function (GovernmentContentStyle) {
    GovernmentContentStyle["FORMAL"] = "formal";
    GovernmentContentStyle["SERIOUS"] = "serious";
    GovernmentContentStyle["AUTHORITATIVE"] = "authoritative";
    GovernmentContentStyle["INSTRUCTIVE"] = "instructive";
    GovernmentContentStyle["FRIENDLY"] = "friendly";
})(GovernmentContentStyle || (exports.GovernmentContentStyle = GovernmentContentStyle = {}));
var ComplianceLevel;
(function (ComplianceLevel) {
    ComplianceLevel["HIGH"] = "high";
    ComplianceLevel["MEDIUM"] = "medium";
    ComplianceLevel["LOW"] = "low";
})(ComplianceLevel || (exports.ComplianceLevel = ComplianceLevel = {}));
//# sourceMappingURL=government-content.interface.js.map
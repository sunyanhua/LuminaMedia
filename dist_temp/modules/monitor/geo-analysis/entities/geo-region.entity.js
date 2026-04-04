"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoRegion = exports.RegionType = exports.RegionLevel = void 0;
const typeorm_1 = require("typeorm");
var RegionLevel;
(function (RegionLevel) {
    RegionLevel["COUNTRY"] = "country";
    RegionLevel["PROVINCE"] = "province";
    RegionLevel["CITY"] = "city";
    RegionLevel["DISTRICT"] = "district";
})(RegionLevel || (exports.RegionLevel = RegionLevel = {}));
var RegionType;
(function (RegionType) {
    RegionType["URBAN"] = "urban";
    RegionType["RURAL"] = "rural";
    RegionType["SUBURBAN"] = "suburban";
    RegionType["INDUSTRIAL"] = "industrial";
    RegionType["COMMERCIAL"] = "commercial";
    RegionType["RESIDENTIAL"] = "residential";
})(RegionType || (exports.RegionType = RegionType = {}));
let GeoRegion = class GeoRegion {
    id;
    tenantId;
    regionCode;
    name;
    englishName;
    regionLevel;
    regionType;
    parentId;
    parentName;
    latitude;
    longitude;
    boundingBox;
    population;
    area;
    gdp;
    gdpPerCapita;
    economicIndicators;
    demographicData;
    culturalData;
    consumerBehavior;
    digitalInfrastructure;
    competitors;
    opportunities;
    competitionIntensity;
    entryBarriers;
    marketConcentration;
    isActive;
    dataUpdatedAt;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
};
exports.GeoRegion = GeoRegion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GeoRegion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], GeoRegion.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], GeoRegion.prototype, "regionCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], GeoRegion.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GeoRegion.prototype, "englishName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], GeoRegion.prototype, "regionLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], GeoRegion.prototype, "regionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], GeoRegion.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GeoRegion.prototype, "parentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GeoRegion.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GeoRegion.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoRegion.prototype, "boundingBox", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GeoRegion.prototype, "population", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GeoRegion.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GeoRegion.prototype, "gdp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GeoRegion.prototype, "gdpPerCapita", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoRegion.prototype, "economicIndicators", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoRegion.prototype, "demographicData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoRegion.prototype, "culturalData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoRegion.prototype, "consumerBehavior", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoRegion.prototype, "digitalInfrastructure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], GeoRegion.prototype, "competitors", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], GeoRegion.prototype, "opportunities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GeoRegion.prototype, "competitionIntensity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], GeoRegion.prototype, "entryBarriers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GeoRegion.prototype, "marketConcentration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], GeoRegion.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], GeoRegion.prototype, "dataUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GeoRegion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GeoRegion.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GeoRegion.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GeoRegion.prototype, "updatedBy", void 0);
exports.GeoRegion = GeoRegion = __decorate([
    (0, typeorm_1.Entity)('geo_regions'),
    (0, typeorm_1.Index)(['tenantId', 'regionCode'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId', 'parentId']),
    (0, typeorm_1.Index)(['tenantId', 'regionLevel']),
    (0, typeorm_1.Index)(['tenantId', 'isActive'])
], GeoRegion);
//# sourceMappingURL=geo-region.entity.js.map
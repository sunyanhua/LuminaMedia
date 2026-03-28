# SmartDataEngine 智能数据引擎使用指南

## 概述

SmartDataEngine 是 LuminaMedia 2.0 的核心数据引擎，负责企业级数据导入、清洗、标签计算和用户画像生成。支持600万级数据处理，标签计算准确率≥95%。

## 核心功能

### 1. 数据导入适配器
- **Excel/CSV智能解析**: 支持.xlsx/.xls/.csv文件，自动识别中文表头
- **API数据流式接收**: 实时API数据接收和验证
- **数据验证和清洗**: 自动数据清洗管道，确保数据质量

### 2. AI字段自动映射引擎
- **智能表头映射**: AI自动识别非标Excel/API表头，转换为标准4维度字段
- **标准字段词典**: 4维度共50+标准字段
- **映射规则学习和缓存**: 支持人工修正和确认

### 3. 离线标签计算引擎
- **SQL模板系统**: 基于SQL的高效离线标签计算，避免Token浪费
- **批量计算**: 支持100万数据标签计算时间<10分钟
- **增量更新和全量重算**: 灵活的计算策略

### 4. 4维度用户画像系统
- **完整用户画像**: 基于标签计算生成4维度用户画像
- **画像数据模型**: 标准化的数据结构
- **可视化支持**: 画像对比和趋势分析

### 5. 数据质量监控
- **实时监控**: 数据缺失预警和完整性校验
- **质量规则**: 完整性、准确性、一致性、时效性
- **告警通知**: 集成邮件、钉钉、企业微信

## API接口

### 数据导入
- `POST /api/data-engine/import/excel` - Excel文件导入
- `POST /api/data-engine/import/api` - API数据接收
- `GET /api/data-engine/import/status/{jobId}` - 导入状态查询

### 字段映射
- `POST /api/data-engine/field-mapping/analyze` - 分析表头映射
- `POST /api/data-engine/field-mapping/confirm` - 确认映射关系
- `GET /api/data-engine/field-mapping/templates` - 获取映射模板

### 标签计算
- `POST /api/data-engine/tag-calculation/batch` - 批量标签计算
- `GET /api/data-engine/tag-calculation/jobs/{jobId}` - 计算任务状态
- `POST /api/data-engine/tag-calculation/incremental` - 增量标签更新

### 用户画像
- `GET /api/data-engine/user-profile/{customerId}` - 获取用户画像
- `POST /api/data-engine/user-profile/query` - 批量查询用户画像
- `GET /api/data-engine/user-profile/segments` - 用户分群分析

### 数据质量
- `GET /api/data-engine/data-quality/rules` - 获取质量规则
- `POST /api/data-engine/data-quality/scan` - 执行质量扫描
- `GET /api/data-engine/data-quality/reports` - 获取质量报告

## 配置指南

### 环境变量
```bash
# 数据库配置
DATABASE_URL=mysql://user:password@localhost:3306/lumina_media

# Redis配置（用于缓存）
REDIS_URL=redis://localhost:6379

# 文件上传限制
MAX_FILE_SIZE_MB=100
```

### 数据库表结构
参考 `scripts/07-data-engine-tables.sql` 创建所需表结构。

## 性能优化

### 大规模数据处理
- **分区策略**: 按tenant_id进行数据库分区
- **索引优化**: 关键查询字段添加索引
- **缓存策略**: Redis缓存中间计算结果

### 计算优化
- **批量处理**: 避免单条记录计算
- **SQL优化**: 使用窗口函数和CTE
- **异步任务**: 长时间任务异步执行

## 监控与维护

### 健康检查
- `GET /health/data-engine` - 数据引擎健康状态

### 性能监控
- 标签计算耗时监控
- 数据导入成功率监控
- 内存和CPU使用率监控

## 常见问题

### 数据导入失败
1. 检查文件格式是否支持
2. 验证表头识别是否准确
3. 检查数据库连接和权限

### 标签计算慢
1. 确认数据库索引是否生效
2. 考虑增加批量大小
3. 检查SQL执行计划

### 用户画像数据不全
1. 验证标签计算是否完成
2. 检查数据源完整性
3. 确认映射关系是否正确

---

**版本**: 1.0
**更新日期**: 2026-03-29
**相关模块**: `src/modules/data-engine/`
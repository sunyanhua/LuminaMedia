# LuminaMedia 2.0 DEMO版本数据库设计文档

## 概述

本文档记录LuminaMedia 2.0 DEMO版本的数据库设计，用于支持商务版DEMO的展示需求。DEMO数据库与真实业务数据完全隔离，专门用于产品演示和市场验证。

## 数据库设计原则

1. **数据隔离**: DEMO数据与真实业务数据物理隔离，使用独立的数据库
2. **简化设计**: 表结构简化但支持完整业务场景展示
3. **易于重置**: 支持一键数据重置，恢复到初始演示状态
4. **性能优化**: 为演示场景优化查询性能，包含必要索引

## 数据库架构

### 数据库信息
- **数据库名**: `lumina_demo`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **默认租户ID**: `demo-tenant`

### 数据表清单

| 表名 | 描述 | 记录数（示例） |
|------|------|----------------|
| `demo_customer_profiles` | 客户档案表 | 4 |
| `demo_purchase_records` | 消费记录表 | 5 |
| `demo_user_behavior` | 用户行为记录表 | 4 |
| `demo_campaign_participation` | 营销活动参与记录表 | 3 |
| `demo_social_interaction` | 社交媒体互动记录表 | 3 |
| `demo_data_import` | 数据导入记录表 | 2 |
| `demo_reset_log` | 数据重置日志表 | 1 |

## 详细表结构

### 1. demo_customer_profiles（客户档案表）

**用途**: 存储DEMO客户的基本信息和会员数据

**字段说明**:
- `id`: UUID主键
- `tenant_id`: 租户ID，固定为`demo-tenant`
- `name`: 客户姓名
- `gender`: 性别 (M/F)
- `age`: 年龄
- `mobile`: 手机号
- `email`: 邮箱
- `registration_date`: 注册日期
- `membership_level`: 会员等级 (bronze/silver/gold/platinum)
- `points`: 积分
- `total_spent`: 累计消费金额
- `last_purchase_date`: 最后购买日期
- `created_at`: 创建时间
- `updated_at`: 更新时间

**索引**:
- 主键: `id`
- 普通索引: `tenant_id`, `membership_level`, `last_purchase_date`, `registration_date`

### 2. demo_purchase_records（消费记录表）

**用途**: 存储DEMO客户的消费记录

**字段说明**:
- `id`: UUID主键
- `customer_id`: 客户ID（外键）
- `tenant_id`: 租户ID，固定为`demo-tenant`
- `purchase_date`: 购买时间
- `store_id`: 门店ID
- `product_category`: 商品类别
- `product_name`: 商品名称
- `quantity`: 数量
- `unit_price`: 单价
- `total_amount`: 总金额
- `payment_method`: 支付方式 (alipay/wechat/card/cash)
- `created_at`: 创建时间

**索引**:
- 主键: `id`
- 普通索引: `customer_id`, `purchase_date`, `product_category`, `tenant_id`
- 外键: `customer_id` 引用 `demo_customer_profiles(id)`

### 3. demo_user_behavior（用户行为记录表）

**用途**: 存储DEMO客户的浏览、点击、收藏等行为记录

**字段说明**:
- `id`: UUID主键
- `customer_id`: 客户ID（外键）
- `tenant_id`: 租户ID
- `behavior_type`: 行为类型 (browse/click/collect/cart_add/search)
- `target_id`: 目标ID（商品ID、页面ID等）
- `target_type`: 目标类型 (product/category/page等)
- `duration_seconds`: 停留时长（秒）
- `device_type`: 设备类型 (mobile/desktop/tablet)
- `platform`: 平台 (web/app/wechat)
- `location`: 地理位置
- `created_at`: 行为时间

**索引**:
- 主键: `id`
- 普通索引: `customer_id`, `behavior_type`, `created_at`, `tenant_id`
- 外键: `customer_id` 引用 `demo_customer_profiles(id)`

### 4. demo_campaign_participation（营销活动参与记录表）

**用途**: 存储DEMO客户参与营销活动的记录

**字段说明**:
- `id`: UUID主键
- `customer_id`: 客户ID（外键）
- `tenant_id`: 租户ID
- `campaign_id`: 活动ID
- `campaign_name`: 活动名称
- `participation_type`: 参与类型 (signup/share/purchase/review/redeem)
- `participation_date`: 参与时间
- `reward_points`: 奖励积分
- `coupon_code`: 优惠券代码
- `created_at`: 创建时间

**索引**:
- 主键: `id`
- 普通索引: `customer_id`, `campaign_id`, `participation_date`, `tenant_id`
- 外键: `customer_id` 引用 `demo_customer_profiles(id)`

### 5. demo_social_interaction（社交媒体互动记录表）

**用途**: 存储DEMO客户在社交媒体上的互动记录

**字段说明**:
- `id`: UUID主键
- `customer_id`: 客户ID（外键）
- `tenant_id`: 租户ID
- `platform`: 社交平台 (wechat/xiaohongshu/weibo/douyin)
- `interaction_type`: 互动类型 (follow/like/comment/share/read)
- `content_id`: 内容ID
- `content_type`: 内容类型 (article/video/post等)
- `interaction_date`: 互动时间
- `metadata`: 元数据（JSON格式）
- `created_at`: 创建时间

**索引**:
- 主键: `id`
- 普通索引: `customer_id`, `platform`, `interaction_date`, `tenant_id`
- 外键: `customer_id` 引用 `demo_customer_profiles(id)`

### 6. demo_data_import（数据导入记录表）

**用途**: 记录DEMO数据的导入操作

**字段说明**:
- `id`: UUID主键
- `tenant_id`: 租户ID
- `import_type`: 导入数据类型 (customer/purchase/behavior/campaign/social)
- `record_count`: 记录数量
- `file_name`: 文件名
- `import_date`: 导入时间
- `status`: 导入状态 (success/failed/partial)
- `error_message`: 错误信息
- `created_at`: 创建时间

**索引**:
- 主键: `id`
- 普通索引: `import_type`, `import_date`, `tenant_id`

### 7. demo_reset_log（数据重置日志表）

**用途**: 记录DEMO数据重置操作

**字段说明**:
- `id`: UUID主键
- `tenant_id`: 租户ID
- `reset_type`: 重置类型 (full/partial)
- `reset_target`: 重置目标表（JSON数组）
- `records_affected`: 影响的记录数
- `reset_by`: 执行者
- `reset_date`: 重置时间
- `reason`: 重置原因
- `created_at`: 创建时间

**索引**:
- 主键: `id`
- 普通索引: `reset_date`, `tenant_id`

## 数据隔离策略

### 1. 数据库层面隔离
- 独立的 `lumina_demo` 数据库，与生产数据库 `lumina_media` 完全分离
- 独立的数据库用户 `demo_user`，仅限访问DEMO数据库

### 2. 应用层面隔离
- 所有DEMO表包含 `tenant_id` 字段，固定值为 `demo-tenant`
- 应用层通过 `tenant_id` 过滤数据访问

### 3. 数据访问控制
- DEMO数据仅供演示使用，不包含真实客户信息
- 所有数据操作记录在 `demo_reset_log` 表中

## 数据重置工具

### 工具位置
- `tools/demo-reset/reset-demo-data.js` - Node.js重置脚本
- `tools/demo-reset/reset-data.sql` - SQL重置脚本

### 使用方法
```bash
# 使用默认配置
node tools/demo-reset/reset-demo-data.js

# 自定义配置
node tools/demo-reset/reset-demo-data.js \
  --host localhost \
  --port 3308 \
  --user demo_user \
  --password demo_password \
  --database lumina_demo
```

### 功能说明
1. 清空所有DEMO表（按外键依赖顺序）
2. 重新插入示例数据
3. 记录重置操作到 `demo_reset_log` 表
4. 提供执行结果统计

## 示例数据

### 客户数据示例
| 姓名 | 性别 | 年龄 | 会员等级 | 积分 | 累计消费 | 最后购买 |
|------|------|------|----------|------|----------|----------|
| 张三 | M | 28 | gold | 1250 | 5800.50 | 2026-03-28 |
| 李四 | F | 35 | platinum | 3200 | 15200.00 | 2026-03-30 |
| 王五 | M | 42 | silver | 800 | 3200.75 | 2026-03-25 |
| 赵六 | F | 31 | bronze | 300 | 1500.00 | 2026-03-20 |

### 消费记录示例
| 客户 | 商品 | 类别 | 数量 | 金额 | 支付方式 | 时间 |
|------|------|------|------|------|----------|------|
| 张三 | 智能手机 | 电子产品 | 1 | 2999.00 | alipay | 2026-03-28 14:30 |
| 张三 | 蓝牙耳机 | 电子产品 | 1 | 399.50 | wechat | 2026-03-28 15:15 |
| 李四 | 冬季外套 | 服装 | 1 | 1200.00 | card | 2026-03-30 10:20 |

## 部署说明

### 数据库初始化
1. 执行 `demo/sql/init-demo.sql` 创建数据库和表结构
2. 默认包含示例数据

### 日常维护
1. 定期使用重置工具恢复DEMO数据
2. 监控 `demo_reset_log` 表了解数据变更历史
3. 根据演示需求调整示例数据

## 后续开发建议

### 数据扩展
1. 根据新的演示场景添加数据表
2. 丰富示例数据的多样性和真实性
3. 添加数据验证规则确保数据质量

### 工具优化
1. 添加数据导出功能
2. 支持部分数据重置
3. 添加数据质量检查工具

### 性能优化
1. 根据查询模式调整索引策略
2. 考虑分区表支持大数据量演示
3. 添加查询缓存机制

---
**文档版本**: 1.0
**更新日期**: 2026-03-30
**关联任务**: D1.2 - DEMO数据表设计
**负责人**: Claude Code
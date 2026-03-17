-- DashboardService 查询性能优化索引
-- 版本: 1.0
-- 描述: 为DashboardService常用查询添加数据库索引

USE lumina_media;

-- 1. 为 user_behaviors 表添加 timestamp 索引（支持时间范围查询）
-- DashboardService中的 getRealTimeMetrics 和 getUserActivityChart 方法需要
CREATE INDEX IF NOT EXISTS idx_user_behaviors_timestamp ON user_behaviors (timestamp);

-- 2. 为 marketing_campaigns 表添加 status 索引
-- DashboardService中的 getDashboardStats 需要按状态计数
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns (status);

-- 3. 为 marketing_strategies 表添加 campaign_id 索引
-- DashboardService中的 getMarketingPerformance 需要按活动ID查询策略
CREATE INDEX IF NOT EXISTS idx_marketing_strategies_campaign_id ON marketing_strategies (campaign_id);

-- 4. 为 customer_segments 表添加 member_count 索引（如果不存在）
-- DashboardService中的 getCustomerOverview 可能按成员数量排序
-- 注意：customer-data-migration.sql 中已有 idx_customer_segments_member_count 索引
-- 这里使用 IF NOT EXISTS 避免重复创建

-- 5. 为 user_behaviors 表添加 event_type 索引（支持按事件类型过滤）
-- DashboardService中的 getRealTimeMetrics 按事件类型过滤
CREATE INDEX IF NOT EXISTS idx_user_behaviors_event_type ON user_behaviors (event_type);

-- 6. 复合索引优化：user_behaviors 表的 (timestamp, event_type) 用于时间范围+事件类型查询
CREATE INDEX IF NOT EXISTS idx_user_behaviors_timestamp_event_type ON user_behaviors (timestamp, event_type);

-- 7. 为 customer_profiles 表添加 created_at 索引（支持按时间排序）
CREATE INDEX IF NOT EXISTS idx_customer_profiles_created_at ON customer_profiles (created_at);

-- 8. 为 data_import_jobs 表添加 (customer_profile_id, status) 复合索引
-- DashboardService可能按客户档案和状态查询导入任务
CREATE INDEX IF NOT EXISTS idx_data_import_jobs_profile_status ON data_import_jobs (customer_profile_id, status);

-- 完成
SELECT 'DashboardService查询优化索引添加完成' AS migration_status;
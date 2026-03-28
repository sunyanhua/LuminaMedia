-- LuminaMedia 2.0 分表（分区）策略初始化脚本
-- 版本: 1.0
-- 描述: 为大数据表设计分表策略，支持600万数据处理
-- 执行时间: 2026-03-26
-- 关联任务: 第一阶段任务2.3 - 基础分表策略设计

USE lumina_media;

-- =====================================================================
-- 分表策略说明
-- =====================================================================
-- 1. 策略类型: 按tenant_id哈希分区 (HASH Partitioning)
-- 2. 分区数量: 16个分区 (p0-p15)
-- 3. 分区算法: MOD(CRC32(tenant_id), 16)
-- 4. 适用范围: 预期数据量超过100万行的大表
-- 5. 优势:
--    - 数据自动按租户分布到不同分区
--    - 查询时MySQL自动路由到正确分区
--    - 支持大数据量下的并行查询
--    - 便于数据归档和清理

-- =====================================================================
-- 分区表创建/修改函数
-- =====================================================================

DELIMITER $$

-- 函数：检查表是否存在
DROP FUNCTION IF EXISTS table_exists$$
CREATE FUNCTION table_exists(table_name VARCHAR(64))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE table_count INT;
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
        AND table_name = table_name;
    RETURN table_count > 0;
END$$

-- 函数：检查表是否已分区
DROP FUNCTION IF EXISTS is_table_partitioned$$
CREATE FUNCTION is_table_partitioned(table_name VARCHAR(64))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE partition_count INT;
    SELECT COUNT(*) INTO partition_count
    FROM information_schema.partitions
    WHERE table_schema = DATABASE()
        AND table_name = table_name
        AND partition_name IS NOT NULL;
    RETURN partition_count > 0;
END$$

-- 函数：为表添加分区（如果未分区）
DROP PROCEDURE IF EXISTS partition_table_by_tenant$$
CREATE PROCEDURE partition_table_by_tenant(
    IN table_name VARCHAR(64),
    IN partition_count INT
)
BEGIN
    DECLARE table_exist BOOLEAN;
    DECLARE partitioned BOOLEAN;
    DECLARE sql_stmt TEXT;

    SET table_exist = table_exists(table_name);
    SET partitioned = is_table_partitioned(table_name);

    IF table_exist AND NOT partitioned THEN
        -- 构建分区SQL
        SET sql_stmt = CONCAT(
            'ALTER TABLE ', table_name, ' ',
            'PARTITION BY KEY(tenant_id) ',
            'PARTITIONS ', partition_count
        );

        -- 执行分区语句
        SET @dynamic_sql = sql_stmt;
        PREPARE stmt FROM @dynamic_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SELECT CONCAT('Table ', table_name, ' partitioned successfully') AS result;
    ELSEIF NOT table_exist THEN
        SELECT CONCAT('Table ', table_name, ' does not exist, skipping') AS result;
    ELSE
        SELECT CONCAT('Table ', table_name, ' is already partitioned, skipping') AS result;
    END IF;
END$$

DELIMITER ;

-- =====================================================================
-- 主执行逻辑
-- =====================================================================

SET @partition_count = 16;
SET @tables_to_partition = 'customer_profiles,content_drafts,publish_tasks,marketing_strategies,user_behaviors';

SELECT 'Starting table partitioning process...' AS status;

-- 1. customer_profiles 表
CALL partition_table_by_tenant('customer_profiles', @partition_count);

-- 2. content_drafts 表
CALL partition_table_by_tenant('content_drafts', @partition_count);

-- 3. publish_tasks 表
CALL partition_table_by_tenant('publish_tasks', @partition_count);

-- 4. marketing_strategies 表
CALL partition_table_by_tenant('marketing_strategies', @partition_count);

-- 5. user_behaviors 表
CALL partition_table_by_tenant('user_behaviors', @partition_count);

-- =====================================================================
-- 分区信息查询
-- =====================================================================

SELECT 'Partitioning completed. Showing partition information:' AS status;

SELECT
    table_name,
    partition_name,
    partition_ordinal_position AS position,
    table_rows,
    data_length,
    index_length
FROM information_schema.partitions
WHERE table_schema = DATABASE()
    AND table_name IN ('customer_profiles', 'content_drafts', 'publish_tasks', 'marketing_strategies', 'user_behaviors')
    AND partition_name IS NOT NULL
ORDER BY table_name, partition_ordinal_position;

-- =====================================================================
-- 分表管理工具使用示例
-- =====================================================================

SELECT '=' AS separator;
SELECT 'Sharding Management Examples:' AS title;
SELECT '=' AS separator;

-- 示例1: KEY分区示例 - 分区由MySQL内部处理
SELECT
    'Example 1: KEY partitioning uses MySQL internal hash function' AS example,
    'Partition determined by MySQL automatically' AS partition_info;

-- 示例2: 检查分区表状态
SELECT
    'Example 2: Partition table status' AS example,
    table_name,
    IF(is_table_partitioned(table_name), 'Partitioned', 'Not Partitioned') AS status
FROM (
    SELECT 'customer_profiles' AS table_name
    UNION SELECT 'content_drafts'
    UNION SELECT 'publish_tasks'
    UNION SELECT 'marketing_strategies'
    UNION SELECT 'user_behaviors'
) AS tables;

-- =====================================================================
-- 清理临时函数和过程
-- =====================================================================

DROP PROCEDURE IF EXISTS partition_table_by_tenant;
DROP FUNCTION IF EXISTS is_table_partitioned;
DROP FUNCTION IF EXISTS table_exists;

SELECT 'Sharding setup script completed successfully!' AS final_status;
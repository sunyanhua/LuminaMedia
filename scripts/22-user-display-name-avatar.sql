-- LuminaMedia 用户显示名称和头像字段添加脚本
-- 版本: 1.0
-- 描述: 为users表添加display_name和avatar字段，更新DEMO用户显示名称
-- 执行时间: 2026-04-06
-- 关联版本: v19.0 (3.1 DEMO细节推进版 Phase 6 Day 25)

USE lumina_media;

-- 临时禁用外键约束检查
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. 添加display_name列
-- ============================================================================

SELECT '=== 添加display_name列 ===' AS step;

SET @display_name_exists = (SELECT COUNT(*) FROM information_schema.columns
                           WHERE table_schema = 'lumina_media'
                           AND table_name = 'users'
                           AND column_name = 'display_name');

SELECT IF(@display_name_exists > 0, 'display_name column already exists', 'adding display_name column') AS column_status;

SET @sql_display_name = IF(@display_name_exists = 0,
    'ALTER TABLE users ADD COLUMN display_name VARCHAR(100) DEFAULT NULL AFTER email;',
    'SELECT \'display_name column already exists, skipping\' AS result;');

PREPARE stmt_display_name FROM @sql_display_name;
EXECUTE stmt_display_name;
DEALLOCATE PREPARE stmt_display_name;

-- ============================================================================
-- 2. 添加avatar列
-- ============================================================================

SELECT '=== 添加avatar列 ===' AS step;

SET @avatar_exists = (SELECT COUNT(*) FROM information_schema.columns
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'users'
                     AND column_name = 'avatar');

SELECT IF(@avatar_exists > 0, 'avatar column already exists', 'adding avatar column') AS column_status;

SET @sql_avatar = IF(@avatar_exists = 0,
    'ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL AFTER display_name;',
    'SELECT \'avatar column already exists, skipping\' AS result;');

PREPARE stmt_avatar FROM @sql_avatar;
EXECUTE stmt_avatar;
DEALLOCATE PREPARE stmt_avatar;

-- ============================================================================
-- 3. 更新DEMO用户显示名称
-- ============================================================================

SELECT '=== 更新DEMO用户显示名称 ===' AS step;

-- 政务版演示租户ID
SET @tenant_id = '33333333-3333-3333-3333-333333333333';

-- 更新editor@demo-gov
UPDATE users
SET display_name = '政务编辑'
WHERE username = 'editor@demo-gov' AND tenant_id = @tenant_id;

-- 更新manager@demo-gov
UPDATE users
SET display_name = '政务主管'
WHERE username = 'manager@demo-gov' AND tenant_id = @tenant_id;

-- 更新legal@demo-gov
UPDATE users
SET display_name = '政务法务'
WHERE username = 'legal@demo-gov' AND tenant_id = @tenant_id;

-- 更新admin@demo-gov
UPDATE users
SET display_name = '系统管理员'
WHERE username = 'admin@demo-gov' AND tenant_id = @tenant_id;

SELECT '✅ DEMO用户显示名称更新完成' AS result;

-- ============================================================================
-- 4. 验证更新结果
-- ============================================================================

SELECT '=== 验证更新结果 ===' AS step;

SELECT
    username,
    display_name,
    avatar,
    status,
    created_at
FROM users
WHERE tenant_id = @tenant_id AND username LIKE '%@demo-gov'
ORDER BY username;

-- 显示更新后的表结构
DESCRIBE users;

-- 恢复外键约束检查
SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ 用户显示名称和头像字段添加完成' AS final_result;
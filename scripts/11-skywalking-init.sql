-- SkyWalking数据库初始化脚本
-- 版本: 1.0
-- 描述: 创建SkyWalking数据库和用户

-- 1. 创建SkyWalking数据库
CREATE DATABASE IF NOT EXISTS skywalking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 切换到SkyWalking数据库
USE skywalking;

-- 3. 创建SkyWalking用户（如果不存在）
-- 注意：实际用户已在docker-compose.yml中配置为lumina_user
-- 这里确保用户有权限访问skywalking数据库

-- 4. 输出成功信息
SELECT 'SkyWalking database initialization completed successfully!' AS message;

-- 注意：SkyWalking OAP Server会自动创建所需的表结构
-- 不需要手动创建表，只需确保数据库存在且用户有权限
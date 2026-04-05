-- LuminaMedia 舆情监测表迁移脚本
-- 版本: 1.0
-- 描述: 创建sentiments表，存储舆情监测数据，并插入DEMO数据
-- 执行时间: 2026-04-06
-- 关联版本: v19.0 (3.1 DEMO细节推进版 Phase 5)

USE lumina_media;

-- 检查sentiments表是否存在，不存在则创建
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables
                     WHERE table_schema = 'lumina_media'
                     AND table_name = 'sentiments');

SELECT IF(@table_exists > 0, 'sentiments table already exists', 'creating sentiments table') AS table_status;

-- 创建表的SQL语句
SET @sql_create_table = IF(@table_exists = 0,
    'CREATE TABLE sentiments (
        id VARCHAR(36) NOT NULL,
        tenant_id VARCHAR(36) DEFAULT \'default-tenant\',
        platform ENUM(\'weibo\', \'wechat\', \'douyin\', \'xiaohongshu\') NOT NULL COMMENT \"平台：微博、微信、抖音、小红书\",
        content TEXT NOT NULL COMMENT \"舆情内容\",
        author VARCHAR(255) NOT NULL COMMENT \"作者/发布者\",
        publish_time TIMESTAMP NULL DEFAULT NULL COMMENT \"发布时间\",
        sentiment ENUM(\'positive\', \'negative\', \'neutral\') NOT NULL COMMENT \"情感类型：正面、负面、中性\",
        sentiment_score DECIMAL(5,2) DEFAULT 0.00 COMMENT \"情感分数，范围-1到1，正数为正面，负数为负面\",
        read_count INT DEFAULT 0 COMMENT \"阅读数\",
        share_count INT DEFAULT 0 COMMENT \"分享数\",
        comment_count INT DEFAULT 0 COMMENT \"评论数\",
        keywords JSON DEFAULT NULL COMMENT \"关键词列表\",
        url VARCHAR(2000) DEFAULT NULL COMMENT \"原文链接\",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_tenant_id (tenant_id),
        INDEX idx_platform (platform),
        INDEX idx_sentiment (sentiment),
        INDEX idx_publish_time (publish_time),
        CONSTRAINT fk_sentiments_tenant_id FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;',
    'SELECT \'sentiments table already exists, skipping\' AS result;');

PREPARE stmt_create_table FROM @sql_create_table;
EXECUTE stmt_create_table;
DEALLOCATE PREPARE stmt_create_table;

-- 显示表结构
DESCRIBE sentiments;

-- 显示索引信息
SHOW INDEX FROM sentiments;

-- 插入DEMO舆情数据
-- 首先删除可能存在的旧DEMO数据（tenant_id为'demo-government-tenant'的租户）
DELETE FROM sentiments WHERE tenant_id = 'demo-government-tenant';

-- 插入模拟舆情数据（覆盖不同平台和情感类型，包含政务相关热点话题）
INSERT INTO sentiments (id, tenant_id, platform, content, author, publish_time, sentiment, sentiment_score, read_count, share_count, comment_count, keywords, url) VALUES
-- 正面舆情
(UUID(), 'demo-government-tenant', 'wechat', '市政府推出便民服务新举措，市民纷纷点赞', '政务发布', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'positive', 0.85, 12000, 3500, 890, '[\"便民服务\", \"市政府\", \"点赞\"]', 'https://example.com/wechat/positive1'),
(UUID(), 'demo-government-tenant', 'weibo', '#地方两会# 代表委员热议民生改善，提案质量显著提升', '两会观察员', DATE_SUB(NOW(), INTERVAL 5 HOUR), 'positive', 0.78, 85000, 12000, 4500, '[\"两会\", \"民生改善\", \"提案\"]', 'https://weibo.com/positive1'),
(UUID(), 'demo-government-tenant', 'douyin', '乡村振兴见成效，特色农产品直播带货火爆', '乡村振兴局', DATE_SUB(NOW(), INTERVAL 1 DAY), 'positive', 0.92, 250000, 78000, 12000, '[\"乡村振兴\", \"农产品\", \"直播带货\"]', 'https://douyin.com/positive1'),
(UUID(), 'demo-government-tenant', 'xiaohongshu', '政务服务中心环境升级，办事体验大幅提升', '市民小王', DATE_SUB(NOW(), INTERVAL 3 DAY), 'positive', 0.65, 5600, 1200, 340, '[\"政务服务中心\", \"办事体验\", \"环境升级\"]', 'https://xiaohongshu.com/positive1'),

-- 负面舆情
(UUID(), 'demo-government-tenant', 'weibo', '某地环保问题被曝光，群众反映强烈', '环保监督', DATE_SUB(NOW(), INTERVAL 4 HOUR), 'negative', -0.75, 98000, 24000, 6700, '[\"环保问题\", \"曝光\", \"群众反映\"]', 'https://weibo.com/negative1'),
(UUID(), 'demo-government-tenant', 'wechat', '市民反映某路段交通拥堵问题长期未解决', '交通之声', DATE_SUB(NOW(), INTERVAL 8 HOUR), 'negative', -0.60, 23000, 4500, 1200, '[\"交通拥堵\", \"长期未解决\", \"市民反映\"]', 'https://example.com/wechat/negative1'),
(UUID(), 'demo-government-tenant', 'douyin', '小区物业管理混乱，业主集体维权', '业主代表', DATE_SUB(NOW(), INTERVAL 2 DAY), 'negative', -0.82, 180000, 56000, 8900, '[\"物业管理\", \"业主维权\", \"混乱\"]', 'https://douyin.com/negative1'),
(UUID(), 'demo-government-tenant', 'xiaohongshu', '政务服务APP使用复杂，老年人操作困难', '老年用户', DATE_SUB(NOW(), INTERVAL 4 DAY), 'negative', -0.45, 7800, 1200, 450, '[\"政务服务APP\", \"操作困难\", \"老年人\"]', 'https://xiaohongshu.com/negative1'),

-- 中性舆情
(UUID(), 'demo-government-tenant', 'weibo', '市统计局发布第一季度经济数据', '市统计局', DATE_SUB(NOW(), INTERVAL 6 HOUR), 'neutral', 0.05, 45000, 5600, 1200, '[\"经济数据\", \"统计局\", \"第一季度\"]', 'https://weibo.com/neutral1'),
(UUID(), 'demo-government-tenant', 'wechat', '关于举办网络安全宣传周的通知', '网信办', DATE_SUB(NOW(), INTERVAL 12 HOUR), 'neutral', 0.10, 15000, 2300, 560, '[\"网络安全\", \"宣传周\", \"通知\"]', 'https://example.com/wechat/neutral1'),
(UUID(), 'demo-government-tenant', 'douyin', '历史文化街区改造工程进展顺利', '建设局', DATE_SUB(NOW(), INTERVAL 3 DAY), 'neutral', 0.15, 89000, 12000, 3400, '[\"历史文化街区\", \"改造工程\", \"进展顺利\"]', 'https://douyin.com/neutral1'),
(UUID(), 'demo-government-tenant', 'xiaohongshu', '政务公开目录更新，新增多项办事指南', '政务公开办', DATE_SUB(NOW(), INTERVAL 5 DAY), 'neutral', 0.08, 6700, 890, 230, '[\"政务公开\", \"办事指南\", \"目录更新\"]', 'https://xiaohongshu.com/neutral1'),

-- 更多舆情数据以覆盖不同时间范围
(UUID(), 'demo-government-tenant', 'weibo', '五一假期旅游市场火爆，各地景点接待创新高', '旅游报', DATE_SUB(NOW(), INTERVAL 7 DAY), 'positive', 0.88, 156000, 45000, 12000, '[\"五一假期\", \"旅游市场\", \"景点接待\"]', 'https://weibo.com/positive2'),
(UUID(), 'demo-government-tenant', 'wechat', '医保政策调整解读，覆盖更多人群', '医保局', DATE_SUB(NOW(), INTERVAL 6 DAY), 'positive', 0.72, 32000, 7800, 2100, '[\"医保政策\", \"政策调整\", \"覆盖人群\"]', 'https://example.com/wechat/positive2'),
(UUID(), 'demo-government-tenant', 'douyin', '城市绿化覆盖率提升，生态环境持续改善', '园林局', DATE_SUB(NOW(), INTERVAL 8 DAY), 'positive', 0.80, 145000, 32000, 7800, '[\"城市绿化\", \"生态环境\", \"覆盖率\"]', 'https://douyin.com/positive2'),
(UUID(), 'demo-government-tenant', 'xiaohongshu', '政务服务「一件事一次办」改革获好评', '改革办', DATE_SUB(NOW(), INTERVAL 10 DAY), 'positive', 0.68, 8900, 2100, 560, '[\"一件事一次办\", \"政务服务\", \"改革\"]', 'https://xiaohongshu.com/positive2'),

(UUID(), 'demo-government-tenant', 'weibo', '部分地区出现疫苗供应紧张情况', '健康时报', DATE_SUB(NOW(), INTERVAL 9 DAY), 'negative', -0.70, 112000, 34000, 8900, '[\"疫苗供应\", \"紧张\", \"部分地区\"]', 'https://weibo.com/negative2'),
(UUID(), 'demo-government-tenant', 'wechat', '老旧小区改造进度缓慢，居民意见大', '社区之声', DATE_SUB(NOW(), INTERVAL 11 DAY), 'negative', -0.65, 28000, 6700, 1900, '[\"老旧小区\", \"改造进度\", \"居民意见\"]', 'https://example.com/wechat/negative2'),
(UUID(), 'demo-government-tenant', 'douyin', '食品安全抽检不合格产品曝光', '市场监管局', DATE_SUB(NOW(), INTERVAL 12 DAY), 'negative', -0.85, 198000, 56000, 14500, '[\"食品安全\", \"抽检不合格\", \"曝光\"]', 'https://douyin.com/negative2'),
(UUID(), 'demo-government-tenant', 'xiaohongshu', '政务服务热线接通率低，群众反映多次无人接听', '热线办', DATE_SUB(NOW(), INTERVAL 14 DAY), 'negative', -0.55, 12000, 2300, 780, '[\"政务服务热线\", \"接通率低\", \"无人接听\"]', 'https://xiaohongshu.com/negative2');

-- 显示插入的数据量
SELECT COUNT(*) AS total_sentiments_inserted FROM sentiments WHERE tenant_id = 'demo-government-tenant';

-- 按平台统计
SELECT platform, COUNT(*) AS count FROM sentiments WHERE tenant_id = 'demo-government-tenant' GROUP BY platform;

-- 按情感统计
SELECT sentiment, COUNT(*) AS count FROM sentiments WHERE tenant_id = 'demo-government-tenant' GROUP BY sentiment;
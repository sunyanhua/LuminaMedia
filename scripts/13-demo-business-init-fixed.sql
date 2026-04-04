-- 商务版演示租户初始化脚本
-- 版本: 1.0
-- 描述: 创建商务版演示租户(demo-business-001)、演示账号(demo@business.com)和预置演示数据
-- 执行时间: 2026-04-04
-- 依赖: 功能配置系统表已创建，roles/permissions表已扩展tenant_type字段
-- ============================================================================
-- 任务4：商务版演示租户创建
-- ============================================================================

-- 创建商务版演示租户 (demo-business-001)
INSERT INTO tenants (id, name, status, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'demo-business-001', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status), updated_at = NOW();

SELECT '✅ 商务版演示租户创建完成' AS result;

-- 创建商务版演示账号 (demo@business.com / LuminaDemo2026)
-- 密码哈希: LuminaDemo2026 使用 bcrypt(10) 生成
INSERT INTO users (id, username, password_hash, email, created_at, tenant_id) VALUES
('22222222-2222-2222-2222-222222222222', 'demo@business.com',
 '$2b$10$tPdHoS6o9OBIKB2nsMEhHunw/jcuETYByrVGihx2qvIPn/4s3YtJG',
 'demo@business.com', NOW(), '11111111-1111-1111-1111-111111111111')
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  password_hash = VALUES(password_hash),
  email = VALUES(email),
  tenant_id = VALUES(tenant_id);

SELECT '✅ 商务版演示账号创建完成' AS result;

-- ============================================================================
-- 商务版预置演示数据导入
-- ============================================================================

-- 生成一些客户档案（customer_profiles）
-- 注意：user_id 需要引用现有用户或使用演示用户ID，这里使用演示用户ID
INSERT INTO customer_profiles (id, user_id, customer_name, customer_type, industry, data_sources, profile_data, behavior_insights, created_at, tenant_id, is_preset, demo_scenario) VALUES
(UUID(), '22222222-2222-2222-2222-222222222222', '阿里巴巴集团', 'ENTERPRISE', 'TECHNOLOGY',
 '{"sources": ["CRM", "电商平台", "社交媒体"]}',
 '{"employees": 250000, "revenue": "700B", "industry_rank": 1}',
 '{"purchase_frequency": "high", "loyalty_score": 95, "preferred_channels": ["移动端", "PC端"]}',
 NOW(), '11111111-1111-1111-1111-111111111111', TRUE, '商务版演示场景'),
(UUID(), '22222222-2222-2222-2222-222222222222', '腾讯控股', 'ENTERPRISE', 'TECHNOLOGY',
 '{"sources": ["游戏平台", "社交媒体", "广告系统"]}',
 '{"employees": 108000, "revenue": "560B", "industry_rank": 2}',
 '{"purchase_frequency": "medium", "loyalty_score": 92, "preferred_channels": ["移动端", "社交应用"]}',
 NOW(), '11111111-1111-1111-1111-111111111111', TRUE, '商务版演示场景'),
(UUID(), '22222222-2222-2222-2222-222222222222', '华为技术有限公司', 'ENTERPRISE', 'TECHNOLOGY',
 '{"sources": ["B2B销售", "运营商", "消费者业务"]}',
 '{"employees": 195000, "revenue": "890B", "industry_rank": 3}',
 '{"purchase_frequency": "high", "loyalty_score": 96, "preferred_channels": ["企业采购", "线下渠道"]}',
 NOW(), '11111111-1111-1111-1111-111111111111', TRUE, '商务版演示场景'),
(UUID(), '22222222-2222-2222-2222-222222222222', '字节跳动', 'ENTERPRISE', 'TECHNOLOGY',
 '{"sources": ["抖音", "今日头条", "TikTok"]}',
 '{"employees": 110000, "revenue": "450B", "industry_rank": 4}',
 '{"purchase_frequency": "high", "loyalty_score": 94, "preferred_channels": ["短视频", "信息流广告"]}',
 NOW(), '11111111-1111-1111-1111-111111111111', TRUE, '商务版演示场景'),
(UUID(), '22222222-2222-2222-2222-222222222222', '美团', 'ENTERPRISE', 'TECHNOLOGY',
 '{"sources": ["外卖平台", "酒店预订", "到店餐饮"]}',
 '{"employees": 85000, "revenue": "180B", "industry_rank": 5}',
 '{"purchase_frequency": "very_high", "loyalty_score": 90, "preferred_channels": ["移动端", "小程序"]}',
 NOW(), '11111111-1111-1111-1111-111111111111', TRUE, '商务版演示场景');

SELECT '✅ 客户档案演示数据导入完成（5条）' AS result;

-- 创建客户分群（customer_segments）
INSERT INTO customer_segments (id, customer_profile_id, segment_name, description, criteria, member_count, member_ids, segment_insights, created_at, updated_at, tenant_id) VALUES
(UUID(), (SELECT id FROM customer_profiles WHERE customer_name = '阿里巴巴集团' AND tenant_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), '高价值企业客户', NULL,
 '{"revenue": {"min": 1000000000}, "employees": {"min": 10000}, "industry": ["TECHNOLOGY", "FINANCE"]}',
 5, NULL, NULL, NOW(), NULL, '11111111-1111-1111-1111-111111111111'),
(UUID(), (SELECT id FROM customer_profiles WHERE customer_name = '阿里巴巴集团' AND tenant_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), '中小型企业客户', NULL,
 '{"revenue": {"min": 10000000, "max": 1000000000}, "employees": {"min": 100, "max": 1000}}',
 0, NULL, NULL, NOW(), NULL, '11111111-1111-1111-1111-111111111111'),
(UUID(), (SELECT id FROM customer_profiles WHERE customer_name = '阿里巴巴集团' AND tenant_id = '11111111-1111-1111-1111-111111111111' LIMIT 1), '零售个体客户', NULL,
 '{"revenue": {"max": 10000000}, "industry": ["RETAIL", "ECOMMERCE"]}',
 0, NULL, NULL, NOW(), NULL, '11111111-1111-1111-1111-111111111111');

SELECT '✅ 客户分群演示数据导入完成（3个分群）' AS result;

-- 创建营销活动（marketing_campaigns）
INSERT INTO marketing_campaigns (id, user_id, customer_profile_id, name, campaign_type, target_audience, budget, status, start_date, end_date, created_at, tenant_id, is_preset) VALUES
(UUID(), '22222222-2222-2222-2222-222222222222',
 (SELECT id FROM customer_profiles WHERE customer_name = '阿里巴巴集团' AND tenant_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
 '阿里云企业解决方案推广', 'ONLINE',
 '{"segments": ["高价值企业客户"], "industries": ["TECHNOLOGY", "FINANCE"], "regions": ["华东", "华南"]}',
 500000.00, 'ACTIVE', '2026-04-01', '2026-06-30', NOW(), '11111111-1111-1111-1111-111111111111', TRUE),
(UUID(), '22222222-2222-2222-2222-222222222222',
 (SELECT id FROM customer_profiles WHERE customer_name = '腾讯控股' AND tenant_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
 '腾讯广告平台春季促销', 'HYBRID',
 '{"segments": ["高价值企业客户", "中小型企业客户"], "industries": ["TECHNOLOGY", "MEDIA_ENTERTAINMENT"], "regions": ["全国"]}',
 300000.00, 'ACTIVE', '2026-04-01', '2026-05-31', NOW(), '11111111-1111-1111-1111-111111111111', TRUE);

SELECT '✅ 营销活动演示数据导入完成（2个活动）' AS result;

-- ============================================================================
-- 验证数据
-- ============================================================================

SELECT '=== 租户验证 ===' AS verification;
SELECT id, name, status FROM tenants WHERE id = '11111111-1111-1111-1111-111111111111';

SELECT '=== 用户验证 ===' AS verification;
SELECT id, username, email, tenant_id FROM users WHERE id = '22222222-2222-2222-2222-222222222222';

SELECT '=== 客户档案统计 ===' AS verification;
SELECT COUNT(*) AS customer_profiles_count FROM customer_profiles WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
SELECT COUNT(*) AS customer_profiles_preset FROM customer_profiles WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND is_preset = TRUE;

SELECT '=== 客户分群统计 ===' AS verification;
SELECT COUNT(*) AS customer_segments_count FROM customer_segments WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

SELECT '=== 营销活动统计 ===' AS verification;
SELECT COUNT(*) AS marketing_campaigns_count FROM marketing_campaigns WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
SELECT COUNT(*) AS marketing_campaigns_preset FROM marketing_campaigns WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND is_preset = TRUE;

SELECT '✅ 商务版演示租户初始化脚本执行完成' AS final_result;
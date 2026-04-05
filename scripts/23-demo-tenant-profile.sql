-- LuminaMedia 政务版演示租户单位画像数据
-- 版本: 1.0
-- 描述: 为政务版演示租户创建完整的单位画像数据
-- 执行时间: 2026-04-06
-- 关联版本: v19.0 (3.1 DEMO细节推进版 Phase 6 Day 25)

USE lumina_media;

-- 临时禁用外键约束检查
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. 插入政务版演示租户单位画像
-- ============================================================================

SELECT '=== 插入政务版演示租户单位画像 ===' AS step;

-- 政务版演示租户ID
SET @tenant_id = '33333333-3333-3333-3333-333333333333';
-- 管理员用户ID（用于last_edited_by）
SET @admin_user_id = (SELECT id FROM users WHERE username = 'admin@demo-gov' AND tenant_id = @tenant_id LIMIT 1);

-- 删除已存在的画像（如果有）
DELETE FROM tenant_profiles WHERE tenant_id = @tenant_id;

-- 插入新的单位画像
INSERT INTO tenant_profiles (
  id,
  tenant_id,
  positioning,
  positioning_description,
  positioning_tags,
  language_style,
  language_style_description,
  language_style_examples,
  visual_preference,
  visual_preference_detail,
  topic_preference,
  publishing_habits,
  status,
  raw_data,
  generated_at,
  last_edited_at,
  last_edited_by,
  version
) VALUES (
  UUID(),
  @tenant_id,
  'authoritative', -- 权威型形象定位
  'XX市政务服务中心作为政府直接服务群众的重要窗口，形象定位为权威、专业、可信赖的官方政务服务平台。在内容创作中注重政策解读的准确性、信息发布的及时性和服务指导的专业性，树立政府权威形象的同时保持亲民务实作风。',
  JSON_ARRAY('政府权威', '政策解读', '政务服务', '民生关注'),
  'formal', -- 正式严谨的语言风格
  '采用正式严谨的公文式语言风格，语句规范、用词准确、逻辑清晰。在政策解读和服务指南中保持专业性和权威性，同时避免过于晦涩的官方术语，确保群众能够理解。适当结合亲民表达，增强可读性。',
  JSON_ARRAY(
    '根据《XX市优化营商环境条例》相关规定，企业开办时间压缩至1个工作日内完成。',
    '市政务服务中心推行“一窗受理、集成服务”模式，实现群众办事“最多跑一次”。',
    '2026年第一季度，我市新增市场主体同比增长15.3%，营商环境持续优化。'
  ),
  'modern', -- 现代风格视觉偏好
  JSON_OBJECT(
    'primaryColor', '#0066CC',
    'secondaryColor', '#F5F5F5',
    'fontFamily', '"Microsoft YaHei", "SimHei", sans-serif',
    'imageStyle', '政务宣传图、数据图表、服务场景照片',
    'layoutPreference', '简洁大方、重点突出、图文并茂'
  ),
  JSON_ARRAY(
    JSON_OBJECT('name', '政务服务改革', 'weight', 95, 'frequency', 85),
    JSON_OBJECT('name', '营商环境优化', 'weight', 90, 'frequency', 80),
    JSON_OBJECT('name', '民生政策解读', 'weight', 88, 'frequency', 75),
    JSON_OBJECT('name', '数字政府建设', 'weight', 85, 'frequency', 70),
    JSON_OBJECT('name', '便民服务指南', 'weight', 82, 'frequency', 90)
  ),
  JSON_OBJECT(
    'bestTime', JSON_ARRAY('morning', 'afternoon'),
    'frequency', 'weekly_3_4',
    'preferredPlatforms', JSON_ARRAY('微信公众号', '政府网站', '政务头条号'),
    'contentLength', 'medium',
    'postFormat', JSON_ARRAY('图文消息', '政策解读长图', '服务指南')
  ),
  'published', -- 画像状态：已发布
  JSON_OBJECT(
    'analyzedDocuments', JSON_ARRAY('doc-001', 'doc-002', 'doc-003'),
    'aiModel', 'gemini-2.5-flash',
    'aiPrompt', '分析政务服务中心的历史发文、政策文件和宣传材料，生成包括形象定位、语言风格、视觉偏好、话题偏好和发布习惯五个维度的单位画像。',
    'analysisDate', '2026-04-05 10:30:00',
    'confidence', 92,
    'version', '1.0',
    'metadata', JSON_OBJECT('analyzedBy', 'AI系统', 'reviewedBy', '政务编辑')
  ),
  '2026-04-05 10:30:00', -- generated_at
  '2026-04-05 14:20:00', -- last_edited_at
  @admin_user_id,
  2
);

SELECT '✅ 政务版演示租户单位画像插入完成' AS result;

-- ============================================================================
-- 2. 验证插入结果
-- ============================================================================

SELECT '=== 验证单位画像数据 ===' AS step;

SELECT
  id,
  tenant_id,
  positioning,
  language_style,
  visual_preference,
  status,
  version,
  generated_at
FROM tenant_profiles
WHERE tenant_id = @tenant_id;

SELECT '=== 画像详情预览 ===' AS info;
SELECT
  positioning_description,
  JSON_LENGTH(positioning_tags) as positioning_tags_count,
  language_style_description,
  JSON_LENGTH(language_style_examples) as language_examples_count,
  JSON_EXTRACT(visual_preference_detail, '$.primaryColor') as primary_color,
  JSON_LENGTH(topic_preference) as topic_count,
  JSON_EXTRACT(publishing_habits, '$.frequency') as publishing_frequency
FROM tenant_profiles
WHERE tenant_id = @tenant_id;

-- 恢复外键约束检查
SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ 政务版演示租户单位画像数据完善完成' AS final_result;
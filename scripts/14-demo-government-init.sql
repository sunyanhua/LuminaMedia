-- 政务版演示租户初始化脚本
-- 版本: 1.0
-- 描述: 创建政务版演示租户(demo-government-001)、演示账号(demo@government.com)和预置演示数据
-- 执行时间: 2026-04-04
-- 依赖: 功能配置系统表已创建，roles/permissions表已扩展tenant_type字段
-- ============================================================================
-- 任务5：政务版演示租户创建
-- ============================================================================

-- 创建政务版演示租户 (demo-government-001)
INSERT INTO tenants (id, name, status, created_at, updated_at) VALUES
('33333333-3333-3333-3333-333333333333', 'demo-government-001', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status), updated_at = NOW();

SELECT '✅ 政务版演示租户创建完成' AS result;

-- 创建政务版演示账号 (demo@government.com / LuminaDemo2026)
-- 密码哈希: LuminaDemo2026 使用 bcrypt(10) 生成（与商务版相同）
INSERT INTO users (id, username, password_hash, email, created_at, tenant_id) VALUES
('44444444-4444-4444-4444-444444444444', 'demo@government.com',
 '$2b$10$tPdHoS6o9OBIKB2nsMEhHunw/jcuETYByrVGihx2qvIPn/4s3YtJG',
 'demo@government.com', NOW(), '33333333-3333-3333-3333-333333333333')
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  password_hash = VALUES(password_hash),
  email = VALUES(email),
  tenant_id = VALUES(tenant_id);

SELECT '✅ 政务版演示账号创建完成' AS result;

-- ============================================================================
-- 政务版预置演示数据导入
-- ============================================================================

-- 插入预置政府内容 (government_contents)
INSERT INTO government_contents (
    id, tenant_id, content_type, title, document_number, issuing_authority,
    issue_date, content_text, status, compliance_score, is_preset, demo_scenario, created_by
) VALUES
(
    UUID(),
    '33333333-3333-3333-3333-333333333333',
    'official_document',
    '关于做好2026年春季防火工作的通知',
    '政发〔2026〕15号',
    '市应急管理局',
    '2026-03-15',
    '各区县人民政府，市政府各部门：\n\n为切实做好2026年春季防火工作，有效预防和减少火灾事故发生，保障人民群众生命财产安全，现就有关事项通知如下：\n\n一、提高思想认识，落实防火责任\n各级各部门要充分认识春季防火工作的重要性和紧迫性，切实增强责任感和使命感...\n\n二、加强火源管理，消除火灾隐患\n严格执行野外用火审批制度，加强林区、草原等重点区域的火源管控...\n\n三、强化宣传教育，提高防火意识\n广泛开展防火宣传教育，利用多种媒体平台宣传防火知识...\n\n四、完善应急预案，做好应急准备\n修订完善火灾应急预案，加强应急队伍建设和物资储备...\n\n五、加强值班值守，确保信息畅通\n严格执行24小时值班和领导带班制度，确保火情信息及时准确上报...\n\n特此通知。',
    'published',
    98.50,
    TRUE,
    'fire-prevention',
    'system'
),
(
    UUID(),
    '33333333-3333-3333-3333-333333333333',
    'anti_fraud',
    '警惕新型网络投资诈骗 守护好您的"钱袋子"',
    NULL,
    '市公安局反诈中心',
    '2026-03-20',
    '近期，我市发生多起新型网络投资诈骗案件，犯罪嫌疑人利用虚假投资平台实施诈骗，给人民群众造成重大财产损失。为有效防范此类诈骗，市公安局反诈中心提醒广大市民：\n\n一、诈骗手法揭秘\n1. "高回报"诱惑：承诺短期内获得高额回报，吸引投资者。\n2. "专业"包装：伪造专业投资团队、豪华办公场所。\n3. "初期返利"：前期给予小额返利，诱骗加大投资。\n4. "突然失联"：待投资者投入大额资金后，平台关闭、人员失联。\n\n二、识别防范要点\n1. 核实平台资质：查询平台是否具有合法金融牌照。\n2. 警惕高额回报：任何承诺"保本高收益"的投资都是诈骗。\n3. 保护个人信息：不向陌生人透露身份证、银行卡等信息。\n4. 及时咨询报警：发现可疑情况，立即向公安机关咨询或报警。\n\n三、举报途径\n1. 反诈专线：96110\n2. 市公安局反诈中心：xxx-xxxxxxx\n3. 微信公众号："平安城市"反诈专栏\n\n请广大市民提高警惕，远离网络投资诈骗，守护好您的"钱袋子"。',
    'published',
    96.80,
    TRUE,
    'anti-fraud',
    'system'
),
(
    UUID(),
    '33333333-3333-3333-3333-333333333333',
    'policy_interpretation',
    '《新能源汽车产业发展规划》政策解读',
    '发改产业〔2026〕8号',
    '国家发展和改革委员会',
    '2026-02-10',
    '为贯彻落实国家碳达峰碳中和战略部署，推动新能源汽车产业高质量发展，国家发展改革委、工业和信息化部等十部门联合印发《新能源汽车产业发展规划（2026-2030年）》。现将主要内容解读如下：\n\n一、发展目标\n到2030年，新能源汽车新车销售量达到汽车新车销售总量的50%左右...\n\n二、重点任务\n1. 提升技术创新能力：加强电池、电机、电控等关键核心技术研发...\n2. 构建新型产业生态：推动新能源汽车与能源、交通、信息通信深度融合...\n3. 完善基础设施体系：加快充电、换电、加氢等基础设施建设...\n\n三、保障措施\n1. 完善政策体系：延续和优化新能源汽车车辆购置税减免政策...\n2. 强化金融支持：鼓励金融机构加大信贷支持力度...\n3. 加强国际协作：深化与国际组织和各国在新能源汽车领域的合作...',
    'published',
    97.20,
    TRUE,
    'policy-interpretation',
    'system'
),
(
    UUID(),
    '33333333-3333-3333-3333-333333333333',
    'public_service',
    '2026年城乡居民基本医疗保险参保缴费指南',
    NULL,
    '市医疗保障局',
    '2026-01-05',
    '广大城乡居民：\n\n2026年度城乡居民基本医疗保险参保缴费工作现已开始。为确保您及时享受医疗保障待遇，现将有关事项通知如下：\n\n一、参保对象\n本市户籍城乡居民、持有本市居住证的非本市户籍人员、各类在校学生等。\n\n二、缴费标准\n1. 成年居民：每人每年480元\n2. 未成年居民（含中小学生）：每人每年320元\n3. 大学生：每人每年280元\n\n三、缴费时间\n2026年1月1日至2026年3月31日\n\n四、缴费方式\n1. 线上缴费：通过"市民通"APP、支付宝、微信等平台缴费\n2. 线下缴费：前往各街道（乡镇）便民服务中心、银行网点办理\n\n五、待遇享受期\n2026年1月1日至2026年12月31日\n\n咨询电话：12333\n\n请广大居民相互转告，及时办理参保缴费手续。',
    'published',
    99.00,
    TRUE,
    'public-service',
    'system'
);

SELECT '✅ 政府内容演示数据导入完成（4条）' AS result;

-- ============================================================================
-- 验证数据
-- ============================================================================

SELECT '=== 租户验证 ===' AS verification;
SELECT id, name, status FROM tenants WHERE id = '33333333-3333-3333-3333-333333333333';

SELECT '=== 用户验证 ===' AS verification;
SELECT id, username, email, tenant_id FROM users WHERE id = '44444444-4444-4444-4444-444444444444';

SELECT '=== 政府内容统计 ===' AS verification;
SELECT COUNT(*) AS government_contents_count FROM government_contents WHERE tenant_id = '33333333-3333-3333-3333-333333333333';
SELECT COUNT(*) AS government_contents_preset FROM government_contents WHERE tenant_id = '33333333-3333-3333-3333-333333333333' AND is_preset = TRUE;

SELECT '✅ 政务版演示租户初始化脚本执行完成' AS final_result;
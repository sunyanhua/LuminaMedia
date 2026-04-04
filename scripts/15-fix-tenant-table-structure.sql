-- 修复 tenants 表结构 - 添加 tenant_type 字段
-- 用于支持业务版、政务版、演示版租户类型的区分

-- 添加 tenant_type 字段
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS tenant_type ENUM('business', 'government', 'demo_business', 'demo_government')
DEFAULT 'business';

-- 更新现有的演示租户类型
UPDATE tenants
SET tenant_type = 'demo_business'
WHERE name LIKE '%demo%' AND name LIKE '%business%' AND tenant_type = 'business';

UPDATE tenants
SET tenant_type = 'demo_government'
WHERE name LIKE '%demo%' AND name LIKE '%government%' AND tenant_type = 'business';

UPDATE tenants
SET tenant_type = 'government'
WHERE name LIKE '%government%' AND tenant_type = 'business' AND name NOT LIKE '%demo%';

-- 验证更改
DESCRIBE tenants;
SELECT * FROM tenants;
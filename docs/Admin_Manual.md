# LuminaMedia 2.0 管理员配置手册

**版本**: v2.0  
**发布日期**: 2026-04-04  
**适用环境**: 生产环境 / 演示环境

## 1. 系统概述

本手册为系统管理员提供 LuminaMedia 2.0 平台的配置和管理指南。涵盖了环境配置、功能管理、租户管理、监控和维护等核心内容。

## 2. 环境配置

### 2.1 环境变量配置

#### 主要环境变量
```bash
# 应用配置
NODE_ENV=production          # 运行环境 (production/development/testing)
PORT=3003                   # 应用端口

# 数据库配置
DATABASE_URL=mysql://username:password@host:port/database
REDIS_URL=redis://host:port

# 安全配置
JWT_SECRET=your_secret_key_here              # JWT密钥
JWT_EXPIRES_IN=24h                          # Token有效期

# AI服务配置
GEMINI_API_KEY=your_gemini_api_key          # Gemini API密钥
QWEN_API_KEY=your_qwen_api_key              # 通义千问API密钥

# 云服务配置
ALIBABA_CLOUD_ACCESS_KEY=access_key         # 阿里云访问密钥
ALIBABA_CLOUD_SECRET_KEY=secret_key         # 阿里云密钥
```

#### 演示环境特殊配置
```bash
# 演示模式
DEMO_MODE=true                              # 是否开启演示模式

# 配额限制
MAX_AI_CALLS_PER_DAY=5                      # 每日AI调用次数上限
MAX_PUBLISHES_PER_DAY=10                    # 每日发布次数上限
MAX_IMPORTS_PER_DAY=3                       # 每日导入次数上限

# CORS配置
CORS_ORIGINS=http://localhost:3000,https://demo.lumina.com
```

### 2.2 数据库配置

#### MySQL配置
```sql
-- 数据库连接池配置
max_connections = 200
innodb_buffer_pool_size = 1G
query_cache_size = 64M
```

#### Redis配置
```conf
# Redis配置要点
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
```

### 2.3 Nginx配置

#### 反向代理配置
```nginx
server {
    listen 80;
    server_name demo.lumina.com;

    location / {
        proxy_pass http://dashboard:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://app:3003/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2.4 SSL证书配置

#### HTTPS配置
```nginx
server {
    listen 443 ssl http2;
    server_name demo.lumina.com;

    ssl_certificate /etc/ssl/certs/demo.lumina.com.crt;
    ssl_certificate_key /etc/ssl/certs/demo.lumina.com.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
}
```

## 3. 功能配置管理

### 3.1 功能配置表结构

#### 表: feature_configs
```sql
+-------------+--------------+------+-----+---------+-------+
| Field       | Type         | Null | Key | Default | Extra |
+-------------+--------------+------+-----+---------+-------+
| id          | varchar(36)  | NO   | PRI | NULL    |       |
| feature_key | varchar(100) | NO   | UNI | NULL    |       |
| feature_name| varchar(200) | NO   |     | NULL    |       |
| description | text         | YES  |     | NULL    |       |
| is_enabled  | tinyint(1)   | NO   |     | 0       |       |
| tenant_type | enum(...)    | NO   |     | all     |       |
| config_data | json         | YES  |     | NULL    |       |
| created_at  | timestamp    | NO   |     | NULL    |       |
| updated_at  | timestamp    | NO   |     | NULL    |       |
+-------------+--------------+------+-----+---------+-------+
```

### 3.2 功能配置操作

#### 添加功能配置
```sql
INSERT INTO feature_configs (
    id, 
    feature_key, 
    feature_name, 
    description, 
    is_enabled, 
    tenant_type
) VALUES (
    UUID(), 
    'new-feature', 
    '新功能名称', 
    '新功能描述', 
    TRUE, 
    'all'
);
```

#### 修改功能配置
```sql
UPDATE feature_configs 
SET is_enabled = TRUE, 
    updated_at = NOW()
WHERE feature_key = 'customer-analytics';
```

#### 删除功能配置
```sql
DELETE FROM feature_configs 
WHERE feature_key = 'old-feature';
```

### 3.3 租户功能开关操作

#### 表: tenant_feature_toggles
```sql
+---------------+--------------+------+-----+---------+-------+
| Field         | Type         | Null | Key | Default | Extra |
+---------------+--------------+------+-----+---------+-------+
| id            | varchar(36)  | NO   | PRI | NULL    |       |
| tenant_id     | varchar(100) | NO   | MUL | NULL    |       |
| feature_key   | varchar(100) | NO   | MUL | NULL    |       |
| is_enabled    | tinyint(1)   | NO   |     | 0       |       |
| quota_config  | json         | YES  |     | NULL    |       |
| created_at    | timestamp    | NO   |     | NULL    |       |
| updated_at    | timestamp    | NO   |     | NULL    |       |
+---------------+--------------+------+-----+---------+-------+
```

#### 启用租户功能
```sql
INSERT INTO tenant_feature_toggles (
    id, tenant_id, feature_key, is_enabled
) VALUES (
    UUID(), 'tenant-001', 'ai-strategy', TRUE
) ON DUPLICATE KEY UPDATE is_enabled = TRUE;
```

#### 批量启用功能
```sql
-- 批量启用租户功能
UPDATE tenant_feature_toggles 
SET is_enabled = TRUE 
WHERE tenant_id = 'tenant-001' 
AND feature_key IN ('feature1', 'feature2', 'feature3');
```

## 4. 配额管理

### 4.1 配额配置表结构

#### 表: tenant_quotas
```sql
+----------------+-------------+------+-----+---------+-------+
| Field          | Type        | Null | Key | Default | Extra |
+----------------+-------------+------+-----+---------+-------+
| id             | varchar(36) | NO   | PRI | NULL    |       |
| tenant_id      | varchar(100)| NO   | MUL | NULL    |       |
| feature_key    | varchar(100)| NO   | MUL | NULL    |       |
| used_count     | int         | NO   |     | 0       |       |
| max_count      | int         | NO   |     | 100     |       |
| quota_period   | enum(...)   | NO   |     | daily   |       |
| reset_time     | timestamp   | NO   | MUL | NULL    |       |
| created_at     | timestamp   | NO   |     | NULL    |       |
| updated_at     | timestamp   | NO   |     | NULL    |       |
+----------------+-------------+------+-----+---------+-------+
```

### 4.2 配额管理操作

#### 查看配额使用情况
```sql
SELECT 
    tenant_id,
    feature_key,
    used_count,
    max_count,
    (used_count / max_count * 100) AS usage_percentage
FROM tenant_quotas 
WHERE tenant_id = 'demo-business-001';
```

#### 修改配额限制
```sql
UPDATE tenant_quotas 
SET max_count = 10 
WHERE tenant_id = 'demo-business-001' 
AND feature_key = 'ai-strategy';
```

#### 重置配额
```sql
UPDATE tenant_quotas 
SET used_count = 0, 
    reset_time = NOW() 
WHERE tenant_id = 'demo-business-001';
```

#### 重置特定功能配额
```sql
UPDATE tenant_quotas 
SET used_count = 0 
WHERE tenant_id = 'demo-business-001' 
AND feature_key = 'customer-analytics';
```

### 4.3 配额周期管理

#### 每日配额重置脚本
```bash
#!/bin/bash
# 每日凌晨执行的配额重置脚本

mysql -u lumina -p -e "
UPDATE tenant_quotas 
SET used_count = 0 
WHERE quota_period = 'daily' 
AND DATE(reset_time) < CURDATE();
"
```

#### 每周配额重置脚本
```bash
#!/bin/bash
# 每周一凌晨执行的配额重置脚本

mysql -u lumina -p -e "
UPDATE tenant_quotas 
SET used_count = 0 
WHERE quota_period = 'weekly' 
AND WEEK(reset_time) < WEEK(NOW());
"
```

## 5. 演示数据管理

### 5.1 演示数据表结构

#### 关键演示数据表
- `customers`: 客户信息表
- `marketing_campaigns`: 营销活动表
- `marketing_strategies`: 营销策略表
- `government_contents`: 政府内容表
- `sentiment_analysis_results`: 舆情分析结果表

### 5.2 演示数据操作

#### 重置演示数据
```sql
-- 仅清空动态生成的数据，保留预置数据
DELETE FROM marketing_campaigns WHERE is_preset = FALSE;
DELETE FROM marketing_strategies WHERE is_preset = FALSE;
DELETE FROM customer_profiles WHERE is_preset = FALSE;
DELETE FROM content_drafts WHERE is_preset = FALSE;
```

#### 查看演示数据状态
```sql
SELECT 
    table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN is_preset THEN 1 END) as preset_records,
    COUNT(CASE WHEN NOT is_preset THEN 1 END) as dynamic_records
FROM (
    SELECT 'marketing_campaigns' as table_name, is_preset FROM marketing_campaigns
    UNION ALL
    SELECT 'marketing_strategies' as table_name, is_preset FROM marketing_strategies
    UNION ALL
    SELECT 'customer_profiles' as table_name, is_preset FROM customer_profiles
) t
GROUP BY table_name;
```

### 5.3 演示数据备份与恢复

#### 备份演示数据
```bash
# 备份演示数据表
mysqldump -u lumina -p lumina_db \
--tables marketing_campaigns marketing_strategies customer_profiles \
> demo_data_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 恢复演示数据
```bash
# 恢复演示数据
mysql -u lumina -p lumina_db < demo_data_backup_20260404_100000.sql
```

## 6. 租户管理

### 6.1 租户表结构

#### 表: tenants
```sql
+---------------+--------------+------+-----+---------+-------+
| Field         | Type         | Null | Key | Default | Extra |
+---------------+--------------+------+-----+---------+-------+
| id            | varchar(100) | NO   | PRI | NULL    |       |
| tenant_name   | varchar(200) | NO   |     | NULL    |       |
| tenant_type   | varchar(50)  | NO   |     | NULL    |       |
| description   | text         | YES  |     | NULL    |       |
| is_active     | tinyint(1)   | NO   |     | 1       |       |
| created_at    | timestamp    | NO   |     | NULL    |       |
| updated_at    | timestamp    | NO   |     | NULL    |       |
+---------------+--------------+------+-----+---------+-------+
```

### 6.2 租户管理操作

#### 创建新租户
```sql
INSERT INTO tenants (
    id, tenant_name, tenant_type, description, is_active
) VALUES (
    'new-tenant-001', 
    '新租户名称', 
    'business', 
    '新租户描述',
    TRUE
);
```

#### 更新租户信息
```sql
UPDATE tenants 
SET description = '更新后的描述',
    is_active = TRUE
WHERE id = 'tenant-id-001';
```

#### 禁用租户
```sql
UPDATE tenants 
SET is_active = FALSE 
WHERE id = 'tenant-id-001';
```

### 6.3 演示租户管理

#### 创建演示租户
```sql
INSERT INTO tenants (
    id, tenant_name, tenant_type, description, is_active
) VALUES (
    'demo-business-001', 
    '商务版演示租户', 
    'business', 
    '商务版功能演示租户', 
    TRUE
), (
    'demo-government-001', 
    '政务版演示租户', 
    'government', 
    '政务版功能演示租户', 
    TRUE
);
```

## 7. 监控和日志

### 7.1 服务监控

#### 查看服务状态
```bash
# Docker服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
```

#### 系统资源监控
```bash
# CPU和内存使用情况
docker stats

# 查看磁盘使用情况
df -h
```

### 7.2 应用日志管理

#### 日志路径
- **应用日志**: `/app/logs/app.log`
- **错误日志**: `/app/logs/error.log`
- **访问日志**: `/app/logs/access.log`
- **Nginx日志**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

#### 日志轮转配置
```bash
# /etc/logrotate.d/lumina
/opt/lumina/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

### 7.3 异常告警配置

#### 告警阈值设置
```yaml
# 告警配置 (alerts.yaml)
metrics:
  cpu_usage: 80      # CPU使用率超过80%
  memory_usage: 85   # 内存使用率超过85%
  response_time: 2000 # API响应时间超过2秒
  error_rate: 5      # 错误率超过5%
```

## 8. 维护操作

### 8.1 服务重启

#### 重启单个服务
```bash
docker-compose restart app
```

#### 重启所有服务
```bash
docker-compose restart
```

#### 完整重启流程
```bash
# 停止服务
docker-compose down

# 清理缓存（可选）
docker system prune -f

# 重新启动
docker-compose up -d
```

### 8.2 数据库备份

#### 完整数据库备份
```bash
# 备份整个数据库
mysqldump -u lumina -p --single-transaction --routines --triggers lumina_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份文件
gzip backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 定时备份脚本
```bash
#!/bin/bash
# 定时备份脚本

BACKUP_DIR="/opt/backups"
DB_NAME="lumina_db"
DB_USER="lumina"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p -R -T $BACKUP_DIR --single-transaction $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_backup_$DATE.sql.gz

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

### 8.3 系统升级

#### 代码更新流程
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 停止当前服务
docker-compose down

# 3. 重新构建镜像
docker-compose build --no-cache

# 4. 启动服务
docker-compose up -d

# 5. 运行数据库迁移（如果有）
docker-compose exec app npm run migrate
```

### 8.4 故障排查

#### 常见问题排查

**Q: 应用无法启动**  
A: 检查日志 `docker-compose logs app`，确认端口未被占用，依赖服务已启动

**Q: 数据库连接失败**  
A: 检查数据库服务状态，确认连接字符串正确，防火墙设置

**Q: API响应缓慢**  
A: 检查系统资源使用情况，数据库性能，API负载

**Q: 功能开关不生效**  
A: 检查功能配置表，缓存是否正确刷新，租户权限配置

#### 性能调试
```bash
# 查看API性能
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3003/api/health"

# 数据库查询性能
EXPLAIN SELECT * FROM customers WHERE tenant_id = 'demo-business-001';
```

### 8.5 安全维护

#### 定期安全检查
```bash
# 扫描Docker镜像漏洞
docker scan lumina/app:latest

# 检查系统包更新
apt-get update && apt-get upgrade
```

#### 安全配置
```bash
# 设置文件权限
chmod 600 .env
chown lumina:lumina -R /opt/lumina/
```

---

**文档版本**: v2.0  
**最后更新**: 2026-04-04  
**维护人员**: LuminaMedia 系统管理团队
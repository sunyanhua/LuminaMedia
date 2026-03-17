# LuminaMedia 部署指南

## 概述

本文档提供 LuminaMedia（灵曜智媒）内容营销平台的完整部署指南，涵盖开发环境和生产环境的部署配置。

### 部署选项

1. **快速启动（推荐）**: 使用 Docker Compose 一键部署
2. **开发环境**: 手动配置和启动各组件
3. **生产环境**: 优化配置和扩展部署

## 系统要求

### 最低配置（开发环境）
- **操作系统**: Linux/macOS/Windows (支持WSL2)
- **内存**: 4GB RAM
- **CPU**: 2核
- **磁盘**: 10GB可用空间
- **网络**: 稳定互联网连接（用于Gemini API）

### 推荐配置（生产环境）
- **操作系统**: Linux (Ubuntu 22.04/CentOS 8+)
- **内存**: 8GB RAM
- **CPU**: 4核
- **磁盘**: 50GB可用空间（SSD推荐）
- **网络**: 100Mbps+带宽，固定公网IP

## 1. Docker Compose 一键部署（推荐）

### 1.1 环境准备

#### 1.1.1 安装 Docker 和 Docker Compose

**Linux**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

# 将当前用户加入docker组（避免sudo）
sudo usermod -aG docker $USER
# 需要重新登录生效
```

**macOS**:
- 下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Windows**:
- 下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)
- 启用 WSL2 后端以获得更好性能

#### 1.1.2 验证安装
```bash
docker --version
docker-compose --version
```

### 1.2 配置环境变量

```bash
# 1. 克隆项目（如果尚未克隆）
git clone <repository-url>
cd LuminaMedia

# 2. 复制环境变量模板
cp .env.example .env

# 3. 编辑 .env 文件，配置必要的环境变量
nano .env  # 或使用其他编辑器
```

**关键环境变量配置**:
```env
# 数据库配置（使用Docker Compose的默认值，无需修改）
DB_HOST=db-lumina
DB_PORT=3306
DB_USERNAME=lumina_user
DB_PASSWORD=lumina_password
DB_DATABASE=lumina_media

# 应用配置
APP_PORT=3002
NODE_ENV=production

# Gemini API 配置（可选，但推荐）
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=2048
GEMINI_TOP_P=0.95
GEMINI_TOP_K=40

# TypeORM 配置
TYPEORM_SYNCHRONIZE=false  # 生产环境必须为false
TYPEORM_LOGGING=false      # 生产环境可设为false减少日志
```

### 1.3 启动服务

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f      # 查看所有服务日志
docker-compose logs app     # 仅查看应用日志
docker-compose logs db-lumina  # 仅查看数据库日志
```

### 1.4 验证部署

#### 检查服务健康状态
```bash
# 检查应用健康状态
curl http://localhost:3002/health

# 检查前端访问
curl -I http://localhost:5173

# 检查数据库连接
docker-compose exec db-lumina mysql -u lumina_user -plumina_password lumina_media -e "SHOW TABLES;"
```

**预期响应**:
- 应用健康检查: `{"status":"running","version":"2.0.0",...}`
- 前端: HTTP 200 OK
- 数据库: 显示已创建的数据表列表

### 1.5 停止和清理

```bash
# 停止所有服务（保留数据）
docker-compose stop

# 停止并删除容器（保留数据卷）
docker-compose down

# 停止并删除容器和数据卷（完全清理）
docker-compose down -v

# 重启服务
docker-compose restart

# 重新构建镜像（代码更新后）
docker-compose up -d --build
```

## 2. 手动部署（开发环境）

### 2.1 数据库部署

#### 选项A: 使用 Docker 运行 MySQL
```bash
# 启动MySQL容器
docker run -d \
  --name lumina-mysql \
  -p 3307:3306 \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=lumina_media \
  -e MYSQL_USER=lumina_user \
  -e MYSQL_PASSWORD=lumina_password \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# 验证数据库运行
docker exec -it lumina-mysql mysql -u lumina_user -plumina_password lumina_media
```

#### 选项B: 使用本地 MySQL 安装
1. 安装 MySQL 8.0+
2. 创建数据库和用户:
```sql
CREATE DATABASE lumina_media CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lumina_user'@'%' IDENTIFIED BY 'lumina_password';
GRANT ALL PRIVILEGES ON lumina_media.* TO 'lumina_user'@'%';
FLUSH PRIVILEGES;
```

### 2.2 初始化数据库

```bash
# 执行数据库迁移脚本
mysql -u lumina_user -plumina_password -h localhost -P 3307 lumina_media < scripts/01-init.sql
mysql -u lumina_user -plumina_password -h localhost -P 3307 lumina_media < scripts/02-analytics-migration.sql
mysql -u lumina_user -plumina_password -h localhost -P 3307 lumina_media < scripts/03-content-generation-migration.sql
mysql -u lumina_user -plumina_password -h localhost -P 3307 lumina_media < scripts/04-customer-data-migration.sql
```

### 2.3 后端应用部署

```bash
# 1. 安装 Node.js 18+ 和 npm
# 参考: https://nodejs.org/

# 2. 安装项目依赖
npm install

# 3. 配置环境变量（编辑 .env 文件）

# 4. 构建应用
npm run build

# 5. 启动应用
# 开发模式（热重载）
npm run start:dev

# 生产模式
npm run start:prod

# 或者直接运行构建后的代码
node dist/main.js
```

### 2.4 前端应用部署

```bash
# 进入前端目录
cd dashboard-web

# 安装依赖
npm install

# 配置环境变量
# 创建 .env 文件，配置 VITE_API_BASE_URL
echo "VITE_API_BASE_URL=http://localhost:3002/api" > .env

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 2.5 配置 Nginx 反向代理（生产环境）

```nginx
# /etc/nginx/sites-available/lumina-media
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/dashboard-web/dist;
        try_files $uri $uri/ /index.html;

        # 缓存策略
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/lumina-media /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl reload nginx
```

## 3. 生产环境部署

### 3.1 安全配置

#### 数据库安全
```sql
-- 限制数据库用户权限
REVOKE ALL PRIVILEGES ON lumina_media.* FROM 'lumina_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON lumina_media.* TO 'lumina_user'@'%';
FLUSH PRIVILEGES;

-- 启用SSL连接（如果支持）
ALTER USER 'lumina_user'@'%' REQUIRE SSL;
```

#### 应用安全配置
```env
# .env 生产环境配置
NODE_ENV=production
APP_ENV=production
TYPEORM_SYNCHRONIZE=false  # 必须关闭，使用迁移
TYPEORM_LOGGING=false      # 生产环境可减少日志量

# 会话安全
SESSION_SECRET=your_strong_secret_key_here
COOKIE_SECURE=true         # HTTPS only
COOKIE_HTTPONLY=true

# CORS 配置（限制域名）
CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true
```

#### 防火墙配置
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# 限制数据库端口仅内网访问
sudo ufw allow from 192.168.1.0/24 to any port 3306
```

### 3.2 性能优化

#### 数据库优化
```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_user_behavior_user_id ON user_behaviors(user_id);
CREATE INDEX idx_marketing_campaign_user_id ON marketing_campaigns(user_id);
CREATE INDEX idx_customer_profile_user_id ON customer_profiles(user_id);

-- 定期优化表
OPTIMIZE TABLE user_behaviors;
OPTIMIZE TABLE marketing_campaigns;
```

#### 应用优化
```typescript
// 启用集群模式（如果多核CPU）
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // 启动应用
  app.listen(3002);
}
```

#### Nginx 优化
```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript;

# 连接池
upstream backend {
    least_conn;
    server localhost:3002 max_fails=3 fail_timeout=30s;
    server localhost:3003 max_fails=3 fail_timeout=30s;
}
```

### 3.3 监控和日志

#### 应用日志配置
```typescript
// src/main.ts
import { Logger } from '@nestjs/common';

const logger = new Logger('Application');

// 生产环境日志级别
const logLevel = process.env.LOG_LEVEL || 'warn';

// 使用Winston或其他日志库
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
});

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  transports: [transport],
});
```

#### 健康检查端点
```http
GET /health
```

**响应**:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-16T12:00:00.000Z",
  "version": "2.0.0",
  "services": {
    "database": "connected",
    "geminiApi": "available",
    "memoryUsage": "45.2%",
    "uptime": "5d 12h 30m"
  }
}
```

#### 监控指标
```bash
# 安装监控工具
# Prometheus + Grafana
# 或使用商业监控服务

# 应用指标端点（可选）
GET /metrics
```

### 3.4 备份和恢复

#### 数据库备份
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
DB_NAME="lumina_media"

# 创建备份
docker-compose exec db-lumina mysqldump -u lumina_user -plumina_password \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/backup_$DATE.sql

# 保留最近7天备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

# 上传到云存储（可选）
# aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-bucket/backups/
```

#### 文件上传备份
```bash
#!/bin/bash
# backup-uploads.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/uploads"

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /app/uploads

# 保留最近30天备份
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete
```

#### 恢复数据库
```bash
# 解压备份文件
gzip -d backup_20260316_120000.sql.gz

# 恢复数据库
mysql -u lumina_user -plumina_password lumina_media < backup_20260316_120000.sql

# 或使用Docker
docker exec -i lumina-mysql mysql -u lumina_user -plumina_password lumina_media < backup_20260316_120000.sql
```

### 3.5 自动扩展

#### Docker Swarm 配置（高级）
```yaml
# docker-stack.yml
version: '3.8'

services:
  app:
    image: lumina-media-app:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - lumina-network
    environment:
      - DB_HOST=db-lumina
      - DB_PORT=3306

  db-lumina:
    image: mysql:8.0
    deploy:
      placement:
        constraints: [node.role == manager]
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - lumina-network
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=lumina_media
      - MYSQL_USER=lumina_user
      - MYSQL_PASSWORD=lumina_password

networks:
  lumina-network:
    driver: overlay

volumes:
  mysql_data:
```

部署到 Swarm:
```bash
docker stack deploy -c docker-stack.yml lumina
```

## 4. 故障排除

### 4.1 常见问题

#### 问题1: 端口冲突
**症状**: `docker-compose up -d` 失败，提示端口已被占用
**解决方案**:
```bash
# 检查端口占用
netstat -ano | findstr :3002  # Windows
lsof -i :3002                 # Linux/macOS
ss -tlnp | grep :3002         # Linux

# 停止占用端口的进程
# 或修改 docker-compose.yml 中的端口映射
```

#### 问题2: 数据库连接失败
**症状**: 应用无法连接MySQL，日志显示连接超时
**解决方案**:
```bash
# 检查MySQL容器状态
docker-compose ps db-lumina

# 查看MySQL日志
docker-compose logs db-lumina

# 测试数据库连接
docker-compose exec db-lumina mysql -u lumina_user -plumina_password lumina_media -e "SHOW TABLES;"

# 检查网络连接
docker-compose exec app ping db-lumina
```

#### 问题3: Gemini API 密钥无效
**症状**: AI内容生成失败，返回API错误
**解决方案**:
1. 检查 `.env` 文件中的 `GEMINI_API_KEY` 配置
2. 验证API密钥是否有效且未过期
3. 检查网络连接是否可以访问 `generativelanguage.googleapis.com`
4. 系统支持优雅降级，无API密钥时使用模拟模板

#### 问题4: 内存不足
**症状**: 容器频繁重启，应用运行缓慢
**解决方案**:
```bash
# 查看内存使用
docker stats

# 增加Docker内存限制（Docker Desktop）
# 设置 → Resources → Memory

# 优化应用内存使用
# 调整Node.js内存限制
NODE_OPTIONS="--max-old-space-size=4096"
```

### 4.2 调试日志

#### 启用详细日志
```env
# .env 文件
LOG_LEVEL=debug
TYPEORM_LOGGING=true
NEST_LOG_LEVEL=verbose
```

#### 查看实时日志
```bash
# 查看所有服务日志
docker-compose logs -f --tail=100

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f db-lumina

# 查看应用内部日志
docker-compose exec app tail -f /app/logs/application.log
```

#### 性能分析
```bash
# 查看容器资源使用
docker stats

# 查看应用性能
docker-compose exec app node --inspect=0.0.0.0:9229 dist/main.js

# 使用Chrome DevTools连接
# chrome://inspect → Configure → Add localhost:9229
```

### 4.3 健康检查

#### 手动健康检查
```bash
# 应用健康检查
curl http://localhost:3002/health

# 数据库健康检查
docker-compose exec db-lumina mysqladmin ping -h localhost -plumina_password

# 前端健康检查
curl -I http://localhost:5173

# API端点测试
curl http://localhost:3002/api/v1/analytics/content-generation/status
```

#### 自动化监控脚本
```bash
#!/bin/bash
# health-check.sh

# 检查应用
if ! curl -f http://localhost:3002/health > /dev/null 2>&1; then
  echo "应用服务异常"
  # 重启服务
  docker-compose restart app
fi

# 检查数据库
if ! docker-compose exec db-lumina mysqladmin ping -h localhost -plumina_password > /dev/null 2>&1; then
  echo "数据库服务异常"
  # 重启数据库
  docker-compose restart db-lumina
fi

# 检查磁盘空间
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
  echo "磁盘使用率过高: $DISK_USAGE%"
  # 清理旧日志和备份
fi
```

## 5. 更新和升级

### 5.1 应用更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 更新依赖
npm install

# 3. 检查数据库迁移
# 查看是否有新的迁移脚本
ls scripts/*-migration.sql

# 4. 重建Docker镜像
docker-compose build --no-cache

# 5. 执行数据库迁移（如果有）
# 先备份数据库
./backup.sh

# 执行新迁移脚本
mysql -u lumina_user -plumina_password lumina_media < scripts/new-migration.sql

# 6. 重启服务
docker-compose up -d --force-recreate
```

### 5.2 数据库迁移

#### 创建新的迁移脚本
```sql
-- scripts/05-new-feature-migration.sql

-- 添加新表
CREATE TABLE IF NOT EXISTS new_feature_table (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 修改现有表
ALTER TABLE marketing_strategies ADD COLUMN new_column VARCHAR(255);

-- 添加索引
CREATE INDEX idx_new_feature_name ON new_feature_table(name);
```

#### 安全执行迁移
```bash
#!/bin/bash
# migrate.sh

set -e  # 遇到错误立即退出

echo "开始数据库迁移..."
echo "1. 备份当前数据库..."

BACKUP_FILE="backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql"
docker-compose exec db-lumina mysqldump -u lumina_user -plumina_password \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  lumina_media > $BACKUP_FILE

echo "备份完成: $BACKUP_FILE"

echo "2. 执行迁移脚本..."
for script in scripts/*-migration.sql; do
  echo "执行: $script"
  mysql -u lumina_user -plumina_password lumina_media < $script
done

echo "3. 验证迁移结果..."
mysql -u lumina_user -plumina_password lumina_media -e "SHOW TABLES;"

echo "迁移完成！"
```

## 6. 环境变量参考

### 必需环境变量
| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| `DB_HOST` | `db-lumina` | 数据库主机地址 |
| `DB_PORT` | `3306` | 数据库端口 |
| `DB_USERNAME` | `lumina_user` | 数据库用户名 |
| `DB_PASSWORD` | `lumina_password` | 数据库密码 |
| `DB_DATABASE` | `lumina_media` | 数据库名称 |
| `APP_PORT` | `3002` | 应用监听端口 |
| `NODE_ENV` | `production` | Node.js环境 |

### 可选环境变量
| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| `GEMINI_API_KEY` | `(空)` | Gemini API密钥 |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini模型名称 |
| `GEMINI_TEMPERATURE` | `0.7` | 生成温度参数 |
| `GEMINI_MAX_TOKENS` | `2048` | 最大token数 |
| `TYPEORM_SYNCHRONIZE` | `false` | 是否自动同步数据库架构 |
| `TYPEORM_LOGGING` | `false` | 是否启用TypeORM日志 |
| `LOG_LEVEL` | `warn` | 应用日志级别 |
| `UPLOAD_DIR` | `/app/uploads` | 文件上传目录 |
| `CORS_ORIGIN` | `*` | CORS允许的源 |

### 生产环境推荐配置
```env
# 安全配置
NODE_ENV=production
APP_ENV=production
TYPEORM_SYNCHRONIZE=false
COOKIE_SECURE=true
COOKIE_HTTPONLY=true

# 性能配置
NODE_OPTIONS="--max-old-space-size=4096"
UV_THREADPOOL_SIZE=16

# 监控配置
LOG_LEVEL=info
METRICS_ENABLED=true
HEALTH_CHECK_ENABLED=true
```

## 7. 联系和支持

### 获取帮助
1. **文档**: 查看 [DEMO_GUIDE.md](./DEMO_GUIDE.md) 和 [API_REFERENCE.md](./API_REFERENCE.md)
2. **问题排查**: 参考本文档的"故障排除"章节
3. **日志分析**: 查看应用日志获取详细错误信息

### 报告问题
当遇到问题时，请提供以下信息：
1. 部署环境（Docker版本、操作系统）
2. 错误日志或截图
3. 复现步骤
4. 环境变量配置（隐藏敏感信息）

### 紧急恢复
```bash
# 1. 停止服务
docker-compose down

# 2. 恢复数据库备份
mysql -u lumina_user -plumina_password lumina_media < latest_backup.sql

# 3. 使用上一个稳定版本的代码
git checkout v1.2.3

# 4. 重新部署
docker-compose up -d
```

---

**版本信息**:
- 文档版本: 1.0.0
- 最后更新: 2026-03-16
- 适用版本: LuminaMedia v2.0+

**注意**: 生产环境部署前请进行充分测试，并确保有完整的备份和恢复方案。
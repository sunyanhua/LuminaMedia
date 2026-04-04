#!/bin/bash

# LuminaMedia 2.0 演示环境部署脚本
# 适用于 Linux/macOS 环境

set -e  # 遇到错误时退出

echo "🚀 开始部署 LuminaMedia 2.0 演示环境..."

# 检查必要工具
echo "🔍 检查必要工具..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 和 Docker Compose 已安装"

# 创建部署目录结构
echo "📁 创建部署目录结构..."
mkdir -p lumina-demo/{logs,data/{mysql,redis},config,certs}

# 复制配置文件
echo "⚙️ 复制配置文件..."
cat > lumina-demo/.env << 'EOF'
# LuminaMedia 2.0 演示环境配置
NODE_ENV=production
PORT=3003
DATABASE_URL=mysql://lumina:password@mysql:3306/lumina_demo
REDIS_URL=redis://redis:6379
JWT_SECRET=demo_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=24h
GEMINI_API_KEY=your_gemini_api_key_here
QWEN_API_KEY=your_qwen_api_key_here

# 演示环境特殊配置
DEMO_MODE=true
MAX_AI_CALLS_PER_DAY=5
MAX_PUBLISHES_PER_DAY=10
MAX_IMPORTS_PER_DAY=3

# CORS 配置
CORS_ORIGINS=http://localhost:3000,https://demo.lumina.com
EOF

# 创建 Docker Compose 文件
echo "🐳 创建 Docker Compose 配置..."
cat > lumina-demo/docker-compose.yml << 'EOF'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: lumina-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: lumina_demo
      MYSQL_USER: lumina
      MYSQL_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - ./data/mysql:/var/lib/mysql
      - ./init:/docker-entrypoint-initdb.d
    networks:
      - lumina-network

  redis:
    image: redis:alpine
    container_name: lumina-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - ./data/redis:/data
    networks:
      - lumina-network

  app:
    build:
      context: ../
      dockerfile: Dockerfile.backend
    container_name: lumina-app
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - NODE_ENV=production
    ports:
      - "3003:3003"
    depends_on:
      - mysql
      - redis
    volumes:
      - ./logs:/app/logs
    networks:
      - lumina-network

  dashboard:
    build:
      context: ../dashboard-web
      dockerfile: Dockerfile.frontend
    container_name: lumina-dashboard
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - app
    networks:
      - lumina-network

  nginx:
    image: nginx:alpine
    container_name: lumina-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/ssl/certs
    depends_on:
      - app
      - dashboard
    networks:
      - lumina-network

networks:
  lumina-network:
    driver: bridge
EOF

# 创建 Nginx 配置
echo "🌐 创建 Nginx 配置..."
mkdir -p lumina-demo/config
cat > lumina-demo/config/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # 基本设置
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss;

    # 商务版演示站点
    server {
        listen 80;
        server_name demo-business.lumina.com;

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

    # 政务版演示站点
    server {
        listen 80;
        server_name demo-government.lumina.com;

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

    # 主站点
    server {
        listen 80;
        server_name localhost;

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
}
EOF

# 创建数据库初始化脚本
echo "💾 创建数据库初始化脚本..."
mkdir -p lumina-demo/init
cat > lumina-demo/init/init.sql << 'EOF'
-- LuminaMedia 2.0 演示环境数据库初始化脚本

-- 创建功能配置表
CREATE TABLE IF NOT EXISTS feature_configs (
  id VARCHAR(36) PRIMARY KEY,
  feature_key VARCHAR(100) UNIQUE NOT NULL,
  feature_name VARCHAR(200) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT FALSE,
  tenant_type ENUM('all', 'business', 'government') DEFAULT 'all',
  config_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_feature_key (feature_key),
  INDEX idx_tenant_type (tenant_type)
);

-- 创建租户功能开关表
CREATE TABLE IF NOT EXISTS tenant_feature_toggles (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  feature_key VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  quota_config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_feature (tenant_id, feature_key),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_feature_key (feature_key)
);

-- 创建租户配额表
CREATE TABLE IF NOT EXISTS tenant_quotas (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  feature_key VARCHAR(100) NOT NULL,
  used_count INT DEFAULT 0,
  max_count INT DEFAULT 100,
  quota_period ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily',
  reset_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_feature_quota (tenant_id, feature_key),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_feature_key (feature_key),
  INDEX idx_reset_time (reset_time)
);

-- 插入默认功能配置
INSERT INTO feature_configs (id, feature_key, feature_name, description, is_enabled, tenant_type) VALUES
  ('fc-001', 'customer-analytics', '客户数据分析', '客户画像分析和行为洞察功能', TRUE, 'business'),
  ('fc-002', 'ai-strategy', 'AI智策工厂', 'AI驱动的营销策略生成功能', TRUE, 'all'),
  ('fc-003', 'matrix-publish', '矩阵分发中心', '多平台内容发布功能', TRUE, 'all'),
  ('fc-004', 'government-publish', '政府内容发布', '面向政府用户的公文发布功能', TRUE, 'government'),
  ('fc-005', 'sentiment-analysis', '舆情监测', '情感分析和舆情监控功能', FALSE, 'government'),
  ('fc-006', 'geo-analysis', 'GEO分析', '地理分析功能', FALSE, 'government');

-- 创建演示租户
INSERT INTO tenants (id, tenant_name, tenant_type, description, is_active, created_at, updated_at) VALUES
  ('demo-business-001', '商务版演示租户', 'business', '商务版功能演示租户', TRUE, NOW(), NOW()),
  ('demo-government-001', '政务版演示租户', 'government', '政务版功能演示租户', TRUE, NOW(), NOW());

-- 创建演示用户
INSERT INTO users (id, username, email, password, tenant_id, created_at, updated_at) VALUES
  ('user-demo-business', 'demo-business', 'admin@demo.lumina.com', '$2a$10$8K1TKywLz50ps7y30Si7j.JB9.TtDwH9lZqLzK1T5vz5J5R9k', 'demo-business-001', NOW(), NOW()),
  ('user-demo-government', 'demo-government', 'gov-admin@demo.lumina.com', '$2a$10$8K1TKywLz50ps7y30Si7j.JB9.TtDwH9lZqLzK1T5vz5J5R9k', 'demo-government-001', NOW(), NOW());

-- 设置租户功能开关
INSERT INTO tenant_feature_toggles (id, tenant_id, feature_key, is_enabled) VALUES
  ('tft-001', 'demo-business-001', 'customer-analytics', TRUE),
  ('tft-002', 'demo-business-001', 'ai-strategy', TRUE),
  ('tft-003', 'demo-business-001', 'matrix-publish', TRUE),
  ('tft-004', 'demo-government-001', 'government-publish', TRUE),
  ('tft-005', 'demo-government-001', 'sentiment-analysis', FALSE),
  ('tft-006', 'demo-government-001', 'geo-analysis', FALSE);

-- 设置演示租户配额
INSERT INTO tenant_quotas (id, tenant_id, feature_key, max_count) VALUES
  ('tq-001', 'demo-business-001', 'customer-analytics', 5),
  ('tq-002', 'demo-business-001', 'ai-strategy', 5),
  ('tq-003', 'demo-business-001', 'matrix-publish', 10),
  ('tq-004', 'demo-government-001', 'government-publish', 10),
  ('tq-005', 'demo-government-001', 'sentiment-analysis', 5);
EOF

echo "✅ 部署配置文件创建完成"

echo ""
echo "🎉 部署准备就绪!"
echo ""
echo "部署步骤:"
echo "1. cd lumina-demo"
echo "2. docker-compose up -d --build"
echo "3. 访问 http://localhost (主站点) 或 http://localhost:3003 (API)"
echo ""
echo "演示账号:"
echo "- 商务版: admin@demo.lumina.com / demo123"
echo "- 政务版: gov-admin / gov123"
echo ""
echo "API文档: http://localhost:3003/api/docs"
echo ""

# 创建部署说明文档
cat > lumina-demo/DEPLOYMENT_GUIDE.md << 'EOF'
# LuminaMedia 2.0 演示环境部署指南

## 部署前准备

1. 确保系统已安装 Docker 和 Docker Compose
2. 确保至少 4GB 可用内存
3. 确保有足够的磁盘空间

## 部署步骤

### 1. 启动服务

```bash
cd lumina-demo
docker-compose up -d --build
```

### 2. 验证部署

```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 初始化数据

首次启动后，需要运行数据库迁移脚本（如果有的话）。

## 访问地址

- 主站点: http://localhost:3000
- API服务: http://localhost:3003
- API文档: http://localhost:3003/api/docs
- 商务版: http://demo-business.lumina.com (需配置hosts)
- 政务版: http://demo-government.lumina.com (需配置hosts)

## 演示账号

### 商务版
- 用户名: admin@demo.lumina.com
- 密码: demo123

### 政务版
- 用户名: gov-admin@demo.lumina.com
- 密码: gov123

## 管理后台

- 管理员账号: admin / admin123
- 管理界面: http://localhost:3000/admin

## 日志管理

- 应用日志: ./logs/app.log
- Nginx访问日志: ./logs/nginx_access.log
- Nginx错误日志: ./logs/nginx_error.log

## 常见问题

### 1. 端口被占用
检查是否有其他服务占用 3003 端口，如 Node.js 或其他应用。

### 2. 内存不足
确保系统至少有 4GB 可用内存。

### 3. 数据库连接失败
等待 MySQL 完全启动后（约30-60秒）再访问应用。

## 停止服务

```bash
docker-compose down
```

## 清理数据

```bash
docker-compose down -v  # 清理持久化数据
```

## 更新版本

```bash
docker-compose down
git pull origin main
docker-compose up -d --build
```

EOF

echo "📄 部署指南已生成: lumina-demo/DEPLOYMENT_GUIDE.md"
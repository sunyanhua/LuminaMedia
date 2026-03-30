# DEMO部署指南

## 概述

本文档提供LuminaMedia DEMO环境的完整部署指南，包括商务版DEMO和政务版DEMO的部署、配置、运行和维护。

## 部署架构

### 系统架构图
```
┌─────────────────────────────────────────────────────────┐
│                     DEMO前端 (5175)                      │
│                    http://localhost:5175                 │
└─────────────────┬─────────────────┬─────────────────────┘
                  │                 │
    ┌─────────────▼─────┐   ┌───────▼─────────────┐
    │ 商务版API (3004)   │   │ 政务版API (3005)     │
    │ demo-business     │   │ demo-government     │
    └─────────┬─────────┘   └─────────┬───────────┘
              │                       │
    ┌─────────▼─────────┐   ┌─────────▼───────────┐
    │ 商务版DB (3308)    │   │ 政务版DB (3309)     │
    │ lumina_demo       │   │ lumina_gov         │
    └───────────────────┘   └─────────────────────┘
```

### 服务端口说明
| 服务 | 容器名称 | 主机端口 | 容器端口 | 用途 |
|------|----------|----------|----------|------|
| 商务版API | demo-business | 3004 | 3003 | 商务版DEMO后端API |
| 政务版API | demo-government | 3005 | 3003 | 政务版DEMO后端API |
| 商务版数据库 | db-demo | 3308 | 3306 | 商务版DEMO数据存储 |
| 政务版数据库 | db-gov | 3309 | 3306 | 政务版DEMO数据存储 |
| DEMO前端 | demo-frontend | 5175 | 5174 | DEMO用户界面 |

## 环境要求

### 硬件要求
- **内存**: 最低8GB，推荐16GB
- **存储**: 最低20GB可用空间
- **CPU**: 最低4核，推荐8核

### 软件要求
- **操作系统**: Linux/macOS/Windows (WSL2)
- **Docker**: 版本20.10+
- **Docker Compose**: 版本2.0+
- **Git**: 版本2.0+

### 网络要求
- 互联网连接（用于下载Docker镜像和AI服务调用）
- 端口3004、3005、3308、3309、5175未被占用

## 快速部署

### 一键部署脚本（推荐）
```bash
# 1. 克隆代码库
git clone https://github.com/your-org/LuminaMedia.git
cd LuminaMedia

# 2. 运行部署脚本
chmod +x scripts/demo/deploy-demo.sh
./scripts/demo/deploy-demo.sh
```

部署脚本会自动完成以下步骤：
1. 检查系统依赖
2. 配置环境变量
3. 创建必要目录
4. 构建Docker镜像
5. 启动所有服务
6. 运行健康检查
7. 初始化DEMO数据

### 手动部署步骤

#### 步骤1: 准备环境
```bash
# 克隆代码
git clone https://github.com/your-org/LuminaMedia.git
cd LuminaMedia

# 创建环境变量文件
cp .env.demo.example .env.demo

# 编辑环境变量
# 至少需要设置 GEMINI_API_KEY 和 DASHSCOPE_API_KEY
vim .env.demo
```

#### 步骤2: 启动服务
```bash
# 构建和启动DEMO服务
docker-compose -f docker-compose.demo.yml up -d --build

# 查看服务状态
docker-compose -f docker-compose.demo.yml ps

# 查看服务日志
docker-compose -f docker-compose.demo.yml logs -f
```

#### 步骤3: 验证部署
```bash
# 运行快速测试
./scripts/demo/quick-test.sh

# 或手动验证
curl http://localhost:3004/health
curl http://localhost:3005/health
curl http://localhost:5175
```

## 详细配置

### 环境变量配置

#### 必需配置
在 `.env.demo` 文件中必须配置以下变量：

```bash
# AI服务配置
GEMINI_API_KEY=your_actual_gemini_api_key
DASHSCOPE_API_KEY=your_actual_dashscope_api_key

# 政务版社交媒体账号（可选）
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
```

#### 可选配置
```bash
# 数据库配置（可使用默认值）
DB_DEMO_PASSWORD=your_demo_db_password
DB_GOV_PASSWORD=your_gov_db_password

# 安全配置
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_byte_encryption_key

# 代理配置（如需要）
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080
```

### 数据库配置

#### 商务版数据库
- **数据库名**: `lumina_demo`
- **用户名**: `demo_user`
- **密码**: 在 `.env.demo` 中设置 `DB_DEMO_PASSWORD`
- **端口**: `3308`

#### 政务版数据库
- **数据库名**: `lumina_gov`
- **用户名**: `gov_user`
- **密码**: 在 `.env.demo` 中设置 `DB_GOV_PASSWORD`
- **端口**: `3309`

### 网络配置

#### 容器网络
所有DEMO服务运行在独立的 `demo-network` 网络中，与生产环境隔离。

#### 端口映射
如果默认端口被占用，可以修改 `docker-compose.demo.yml` 中的端口映射：
```yaml
services:
  demo-business:
    ports:
      - "3006:3003"  # 修改主机端口
```

#### 防火墙配置
确保以下端口在防火墙中开放：
- `3004`, `3005` - API服务
- `5175` - 前端服务
- `3308`, `3309` - 数据库（仅本地访问）

## 数据管理

### 初始化数据

#### 商务版DEMO数据
```bash
# 手动初始化商务版数据
docker-compose -f docker-compose.demo.yml exec demo-business npm run demo:init

# 或通过脚本
./scripts/demo/init-business-data.sh
```

商务版DEMO初始化内容包括：
1. 10,000条模拟客户数据
2. 50,000条消费记录
3. 100个营销活动模板
4. 20个预置分析报告

#### 政务版DEMO数据
政务版DEMO数据在数据库初始化时自动创建，包括：
1. 政府公文模板
2. 防诈骗宣传案例
3. 政策解读示例
4. 应急响应预案

### 数据重置

#### 重置商务版数据
```bash
# 重置所有商务版数据
docker-compose -f docker-compose.demo.yml exec demo-business npm run demo:reset

# 或使用重置工具
node tools/demo-reset/reset-demo-data.js
```

#### 重置政务版数据
```bash
# 重置政务版数据库
docker-compose -f docker-compose.demo.yml exec db-gov mysql -u root -p$DB_GOV_PASSWORD -e "DROP DATABASE IF EXISTS lumina_gov; CREATE DATABASE lumina_gov;"

# 重新初始化
docker-compose -f docker-compose.demo.yml restart demo-government
```

### 数据备份

#### 备份商务版数据
```bash
# 备份数据库
docker-compose -f docker-compose.demo.yml exec db-demo mysqldump -u demo_user -pdemo_password lumina_demo > backup/demo-business-$(date +%Y%m%d).sql

# 备份上传数据
tar -czf backup/demo-business-data-$(date +%Y%m%d).tar.gz demo/business/data/
```

#### 备份政务版数据
```bash
# 备份数据库
docker-compose -f docker-compose.demo.yml exec db-gov mysqldump -u gov_user -pgov_password lumina_gov > backup/demo-gov-$(date +%Y%m%d).sql

# 备份配置和凭证
tar -czf backup/demo-gov-config-$(date +%Y%m%d).tar.gz demo/government/
```

## 运维管理

### 服务监控

#### 健康检查
```bash
# 检查所有服务健康状态
./scripts/demo/check-health.sh

# 或手动检查
curl http://localhost:3004/health
curl http://localhost:3005/health
curl http://localhost:3004/health/db
curl http://localhost:3005/health/ai
```

#### 日志查看
```bash
# 查看所有服务日志
docker-compose -f docker-compose.demo.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.demo.yml logs -f demo-business
docker-compose -f docker-compose.demo.yml logs -f demo-frontend

# 查看实时日志
docker-compose -f docker-compose.demo.yml logs --tail=100 -f
```

#### 资源监控
```bash
# 查看容器资源使用
docker stats

# 查看服务状态
docker-compose -f docker-compose.demo.yml ps

# 查看服务详情
docker-compose -f docker-compose.demo.yml top
```

### 故障处理

#### 服务启动失败
```bash
# 查看启动失败原因
docker-compose -f docker-compose.demo.yml logs --tail=50

# 重建服务
docker-compose -f docker-compose.demo.yml up -d --build --force-recreate demo-business

# 检查端口占用
netstat -ano | findstr :3004  # Windows
lsof -i :3004  # Linux/macOS
```

#### 数据库连接问题
```bash
# 检查数据库服务状态
docker-compose -f docker-compose.demo.yml ps db-demo
docker-compose -f docker-compose.demo.yml logs db-demo

# 测试数据库连接
docker-compose -f docker-compose.demo.yml exec db-demo mysql -u demo_user -pdemo_password -e "SELECT 1;"

# 重启数据库
docker-compose -f docker-compose.demo.yml restart db-demo
```

#### 前端访问问题
```bash
# 检查前端服务
docker-compose -f docker-compose.demo.yml ps demo-frontend
docker-compose -f docker-compose.demo.yml logs demo-frontend

# 检查前端编译
docker-compose -f docker-compose.demo.yml exec demo-frontend npm run build

# 重启前端
docker-compose -f docker-compose.demo.yml restart demo-frontend
```

### 性能优化

#### 资源限制调整
在 `docker-compose.demo.yml` 中调整资源限制：
```yaml
services:
  demo-business:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

#### 缓存配置
```bash
# 启用Redis缓存（修改docker-compose.demo.yml）
# 添加Redis服务配置
```

#### 数据库优化
```bash
# 创建数据库索引优化脚本
./scripts/demo/optimize-database.sh
```

## 安全配置

### 访问控制

#### 修改默认密码
```bash
# 修改数据库密码
# 1. 更新 .env.demo 中的数据库密码
# 2. 重新创建数据库容器
docker-compose -f docker-compose.demo.yml down db-demo db-gov
docker-compose -f docker-compose.demo.yml up -d db-demo db-gov

# 修改应用密码
# 更新 .env.demo 中的 JWT_SECRET 和 ENCRYPTION_KEY
```

#### 配置防火墙
```bash
# Linux防火墙配置示例
sudo ufw allow 5175/tcp comment 'LuminaMedia DEMO Frontend'
sudo ufw allow 3004/tcp comment 'LuminaMedia Business API'
sudo ufw allow 3005/tcp comment 'LuminaMedia Government API'
```

### 数据安全

#### 敏感数据加密
```bash
# 检查凭证加密状态
docker-compose -f docker-compose.demo.yml exec demo-government npm run demo:check-encryption

# 重新加密凭证
docker-compose -f docker-compose.demo.yml exec demo-government npm run demo:re-encrypt
```

#### 审计日志
```bash
# 查看审计日志
docker-compose -f docker-compose.demo.yml exec demo-business cat /app/logs/audit.log
docker-compose -f docker-compose.demo.yml exec demo-government cat /app/logs/audit.log
```

## 扩展配置

### 自定义演示数据

#### 添加商务版演示数据
```bash
# 1. 准备数据文件
# 格式: CSV或JSON，参考 tools/demo-data-generator/src/schemas/

# 2. 导入数据
docker-compose -f docker-compose.demo.yml exec demo-business npm run demo:import -- --file /app/demo-data/your-data.csv

# 3. 验证数据
docker-compose -f docker-compose.demo.yml exec demo-business npm run demo:verify-data
```

#### 添加政务版演示数据
```bash
# 1. 准备政府内容模板
# 格式: JSON，参考 src/modules/publish/interfaces/government-content.interface.ts

# 2. 导入模板
docker-compose -f docker-compose.demo.yml exec demo-government npm run gov:import-template -- --file /app/config/templates/your-template.json

# 3. 验证模板
docker-compose -f docker-compose.demo.yml exec demo-government npm run gov:verify-templates
```

### 集成外部系统

#### API集成
```bash
# 启用API文档
# 访问 http://localhost:3004/api/docs (商务版)
# 访问 http://localhost:3005/api/docs (政务版)

# 获取API密钥
docker-compose -f docker-compose.demo.yml exec demo-business npm run demo:generate-api-key
```

#### Webhook配置
```bash
# 配置Webhook接收端
# 修改 demo/business/config/webhook.config.json
# 修改 demo/government/config/webhook.config.json
```

## 卸载与清理

### 完全卸载
```bash
# 停止并删除所有DEMO资源
docker-compose -f docker-compose.demo.yml down -v

# 删除数据卷
docker volume rm $(docker volume ls -q | grep demo) 2>/dev/null || true

# 删除镜像
docker rmi $(docker images lumina-* -q) 2>/dev/null || true

# 清理本地文件
rm -rf demo/business/data/*
rm -rf demo/government/config/*
rm -rf demo/logs/*
```

### 部分清理
```bash
# 仅清理数据，保留配置
./scripts/demo/clean-data.sh

# 仅清理日志
./scripts/demo/clean-logs.sh

# 仅清理镜像缓存
docker system prune -f
```

## 常见问题

### Q: 部署脚本执行失败
**A**: 检查以下问题：
1. Docker服务是否运行: `docker ps`
2. 端口是否被占用: `netstat -ano | findstr :3004`
3. 环境变量是否配置: 检查 `.env.demo` 文件
4. 磁盘空间是否充足: `df -h`

### Q: DEMO访问缓慢
**A**: 尝试以下优化：
1. 增加Docker资源分配
2. 检查网络连接
3. 清理Docker缓存: `docker system prune`
4. 重启Docker服务

### Q: AI功能不可用
**A**: 验证以下配置：
1. AI API密钥是否正确
2. 网络是否能访问AI服务
3. API密钥是否有足够额度
4. 检查AI服务日志

### Q: 数据库连接失败
**A**: 执行以下检查：
1. 数据库容器是否运行
2. 数据库密码是否正确
3. 端口是否被占用
4. 查看数据库日志

## 获取帮助

### 文档资源
- [商务版DEMO使用指南](./business-demo-guide.md)
- [政务版DEMO使用指南](./government-demo-guide.md)
- [DEMO演示脚本手册](./demo-scripts.md)

### 技术支持
- **商务版支持**: business-support@lumina-media.com
- **政务版支持**: gov-support@lumina-media.com
- **紧急问题**: +86-XXX-XXXX-XXXX

### 社区支持
- GitHub Issues: https://github.com/your-org/LuminaMedia/issues
- 技术论坛: https://forum.lumina-media.com
- 知识库: https://docs.lumina-media.com

---

**文档版本**: 1.0
**最后更新**: 2026-03-31
**部署脚本版本**: 1.0
**兼容性**: Docker 20.10+, Docker Compose 2.0+
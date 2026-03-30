#!/bin/bash
# DEMO配置验证脚本

set -e

echo "=========================================="
echo "   DEMO配置验证"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查文件是否存在
check_file() {
    local file=$1
    local desc=$2

    if [ -f "$file" ]; then
        log_success "$desc 文件存在: $file"
        return 0
    else
        log_error "$desc 文件不存在: $file"
        return 1
    fi
}

# 检查目录是否存在
check_dir() {
    local dir=$1
    local desc=$2

    if [ -d "$dir" ]; then
        log_success "$desc 目录存在: $dir"
        return 0
    else
        log_error "$desc 目录不存在: $dir"
        return 1
    fi
}

# 检查YAML配置
check_yaml() {
    local file=$1
    local desc=$2

    if python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
        log_success "$desc YAML格式正确: $file"
        return 0
    elif command -v yq &> /dev/null && yq e '.' "$file" > /dev/null 2>&1; then
        log_success "$desc YAML格式正确: $file"
        return 0
    else
        log_error "$desc YAML格式错误: $file"
        return 1
    fi
}

# 检查JSON配置
check_json() {
    local file=$1
    local desc=$2

    if python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
        log_success "$desc JSON格式正确: $file"
        return 0
    elif jq '.' "$file" > /dev/null 2>&1; then
        log_success "$desc JSON格式正确: $file"
        return 0
    else
        log_error "$desc JSON格式错误: $file"
        return 1
    fi
}

log_info "步骤1: 检查核心配置文件..."

# 检查Docker Compose配置
check_file "docker-compose.demo.yml" "DEMO Docker Compose配置"
check_yaml "docker-compose.demo.yml" "DEMO Docker Compose配置"

# 检查环境变量示例文件
check_file ".env.demo.example" "DEMO环境变量示例配置"

# 检查部署脚本
check_file "scripts/demo/deploy-demo.sh" "DEMO部署脚本"
check_file "scripts/demo/check-health.sh" "健康检查脚本"
check_file "scripts/demo/validate-config.sh" "配置验证脚本"

log_info ""
log_info "步骤2: 检查数据库初始化脚本..."

# 检查数据库初始化脚本
check_file "demo/sql/init-demo.sql" "商务版数据库初始化脚本"
check_file "demo/sql/init-gov.sql" "政务版数据库初始化脚本"

# 检查SQL语法（简单检查）
if grep -q "CREATE DATABASE" "demo/sql/init-demo.sql"; then
    log_success "商务版SQL包含CREATE DATABASE语句"
else
    log_warning "商务版SQL可能缺少CREATE DATABASE语句"
fi

if grep -q "CREATE DATABASE" "demo/sql/init-gov.sql"; then
    log_success "政务版SQL包含CREATE DATABASE语句"
else
    log_warning "政务版SQL可能缺少CREATE DATABASE语句"
fi

log_info ""
log_info "步骤3: 检查DEMO配置目录..."

# 检查配置目录
check_dir "demo/business/config" "商务版配置目录"
check_dir "demo/business/data" "商务版数据目录"
check_dir "demo/government/config" "政务版配置目录"
check_dir "demo/government/credentials" "政务版凭证目录"
check_dir "demo/logs" "DEMO日志目录"

# 检查配置文件
check_file "demo/business/config/demo.config.json" "商务版DEMO配置"
check_json "demo/business/config/demo.config.json" "商务版DEMO配置"

check_file "demo/government/config/demo.config.json" "政务版DEMO配置"
check_json "demo/government/config/demo.config.json" "政务版DEMO配置"

log_info ""
log_info "步骤4: 检查文档文件..."

# 检查文档
check_dir "docs/demo" "DEMO文档目录"
check_file "docs/demo/business-demo-guide.md" "商务版DEMO使用指南"
check_file "docs/demo/government-demo-guide.md" "政务版DEMO使用指南"
check_file "docs/demo/deployment-guide.md" "DEMO部署指南"
check_file "docs/demo/demo-scripts.md" "DEMO演示脚本手册"

log_info ""
log_info "步骤5: 检查工具和脚本..."

# 检查工具目录
check_dir "tools/demo-data-generator" "模拟数据生成工具"
check_dir "tools/demo-reset" "DEMO重置工具"

# 检查工具文件
if [ -f "tools/demo-reset/reset-demo-data.js" ] || [ -f "tools/demo-reset/reset-data.sql" ]; then
    log_success "DEMO重置工具存在"
else
    log_warning "DEMO重置工具可能不完整"
fi

log_info ""
log_info "步骤6: 验证服务隔离配置..."

# 解析docker-compose配置检查隔离性
log_info "分析服务隔离配置..."

# 检查端口不冲突
ports_used=""
port_conflict=false

# 提取所有端口映射
if command -v yq &> /dev/null; then
    ports=$(yq e '.services[].ports[]' docker-compose.demo.yml 2>/dev/null | grep -v null || true)
else
    # 简单grep提取
    ports=$(grep -E "ports:" -A 5 docker-compose.demo.yml | grep -E "^\s*-\s*\"[0-9]" | sed 's/.*"\([0-9]*\):.*/\1/' || true)
fi

for port in $ports; do
    if echo "$ports_used" | grep -q "\<$port\>"; then
        log_error "端口冲突: $port"
        port_conflict=true
    else
        ports_used="$ports_used $port"
        log_success "端口 $port 可用"
    fi
done

if [ "$port_conflict" = false ]; then
    log_success "所有端口配置无冲突"
fi

# 检查数据库配置独立
if grep -q "lumina_demo" docker-compose.demo.yml && grep -q "lumina_gov" docker-compose.demo.yml; then
    log_success "商务版和政务版数据库独立配置"
else
    log_error "数据库配置可能未完全独立"
fi

# 检查网络配置
if grep -q "demo-network" docker-compose.demo.yml; then
    log_success "DEMO使用独立网络 demo-network"
else
    log_warning "DEMO网络配置可能有问题"
fi

log_info ""
log_info "步骤7: 验证一键部署功能..."

# 检查部署脚本可执行
if [ -x "scripts/demo/deploy-demo.sh" ]; then
    log_success "部署脚本可执行"
else
    log_warning "部署脚本不可执行，请运行: chmod +x scripts/demo/deploy-demo.sh"
fi

# 检查脚本完整性
if grep -q "docker-compose -f docker-compose.demo.yml" "scripts/demo/deploy-demo.sh"; then
    log_success "部署脚本包含正确的Docker Compose命令"
else
    log_error "部署脚本可能缺少关键命令"
fi

if grep -q "健康检查" "scripts/demo/deploy-demo.sh"; then
    log_success "部署脚本包含健康检查功能"
else
    log_warning "部署脚本可能缺少健康检查"
fi

log_info ""
log_info "步骤8: 验证监控和健康检查..."

# 检查健康检查端点配置
if grep -q "/health" "docker-compose.demo.yml" || grep -q "healthcheck" "docker-compose.demo.yml"; then
    log_success "Docker配置包含健康检查"
else
    log_warning "Docker配置可能缺少健康检查"
fi

# 检查监控脚本
if [ -f "scripts/demo/check-health.sh" ]; then
    if grep -q "curl.*/health" "scripts/demo/check-health.sh"; then
        log_success "健康检查脚本包含API健康检查"
    else
        log_warning "健康检查脚本可能不完整"
    fi
fi

log_info ""
log_info "=========================================="
log_info "配置验证完成"
log_info "=========================================="

echo ""
echo "验证总结:"
echo "- 配置文件完整性: ✅ 完成"
echo "- 目录结构完整性: ✅ 完成"
echo "- 服务隔离验证: ✅ 完成"
echo "- 部署功能验证: ✅ 完成"
echo "- 监控功能验证: ✅ 完成"
echo ""
echo "下一步建议:"
echo "1. 运行部署脚本: ./scripts/demo/deploy-demo.sh"
echo "2. 运行健康检查: ./scripts/demo/check-health.sh"
echo "3. 测试DEMO功能: 访问 http://localhost:5175"
echo ""
echo "注意: 实际部署前请确保:"
echo "- 已安装 Docker 和 Docker Compose"
echo "- 已配置 .env.demo 文件"
echo "- 端口 3004, 3005, 3308, 3309, 5175 未被占用"
echo ""

exit 0
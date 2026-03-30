#!/bin/bash
# DEMO环境健康检查脚本

set -e

echo "=========================================="
echo "   DEMO环境健康检查"
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

check_status() {
    local service=$1
    local port=$2
    local url=$3

    if curl -s -f "$url" > /dev/null; then
        log_success "$service 服务正常 (端口: $port)"
        return 0
    else
        log_error "$service 服务异常 (端口: $port)"
        return 1
    fi
}

check_container() {
    local container=$1

    if docker ps --filter "name=$container" --format "{{.Status}}" | grep -q "Up"; then
        log_success "容器 $container 运行正常"
        return 0
    else
        log_error "容器 $container 未运行"
        return 1
    fi
}

check_database() {
    local container=$1
    local user=$2
    local pass=$3
    local db=$4

    if docker exec "$container" mysql -u "$user" -p"$pass" -e "SELECT 1;" "$db" > /dev/null 2>&1; then
        log_success "数据库 $db 连接正常"
        return 0
    else
        log_error "数据库 $db 连接失败"
        return 1
    fi
}

# 检查容器状态
log_info "检查容器运行状态..."

containers=("lumina-demo-business" "lumina-demo-government" "lumina-demo-db" "lumina-gov-db" "lumina-demo-frontend")

all_containers_up=true
for container in "${containers[@]}"; do
    if ! check_container "$container"; then
        all_containers_up=false
    fi
done

if [ "$all_containers_up" = true ]; then
    log_success "所有容器运行正常"
else
    log_warning "部分容器运行异常"
fi

# 检查服务健康
log_info ""
log_info "检查服务健康状态..."

check_status "商务版API" 3004 "http://localhost:3004/health"
check_status "政务版API" 3005 "http://localhost:3005/health"
check_status "前端服务" 5175 "http://localhost:5175"

# 检查数据库
log_info ""
log_info "检查数据库连接..."

check_database "lumina-demo-db" "demo_user" "demo_password" "lumina_demo"
check_database "lumina-gov-db" "gov_user" "gov_password" "lumina_gov"

# 检查详细健康端点
log_info ""
log_info "检查详细健康信息..."

echo "商务版详细健康检查:"
curl -s http://localhost:3004/health/db | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3004/health/db
echo ""

echo "政务版详细健康检查:"
curl -s http://localhost:3005/health/db | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3005/health/db
echo ""

# 检查网络连通性
log_info ""
log_info "检查容器间网络连通性..."

if docker exec lumina-demo-business ping -c 1 db-demo > /dev/null 2>&1; then
    log_success "商务版API到数据库网络正常"
else
    log_error "商务版API到数据库网络异常"
fi

if docker exec lumina-demo-government ping -c 1 db-gov > /dev/null 2>&1; then
    log_success "政务版API到数据库网络正常"
else
    log_error "政务版API到数据库网络异常"
fi

if docker exec lumina-demo-frontend ping -c 1 demo-business > /dev/null 2>&1; then
    log_success "前端到商务版API网络正常"
else
    log_error "前端到商务版API网络异常"
fi

# 总结报告
log_info ""
log_info "=========================================="
log_info "健康检查完成"
log_info "=========================================="

echo "访问地址:"
echo "- 前端: http://localhost:5175"
echo "- 商务版API文档: http://localhost:3004/api/docs"
echo "- 政务版API文档: http://localhost:3005/api/docs"
echo ""
echo "管理命令:"
echo "- 查看日志: docker-compose -f docker-compose.demo.yml logs -f"
echo "- 重启服务: docker-compose -f docker-compose.demo.yml restart"
echo "- 停止服务: docker-compose -f docker-compose.demo.yml down"
echo ""

exit 0
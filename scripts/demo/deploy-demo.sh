#!/bin/bash
# LuminaMedia DEMO环境部署脚本
# 版本: 1.0
# 描述: 一键部署商务版和政务版DEMO环境

set -e

echo "=========================================="
echo "   LuminaMedia DEMO环境部署脚本"
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

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 步骤1: 检查依赖
log_info "步骤1: 检查系统依赖..."
check_command docker
check_command docker-compose

log_success "Docker 和 Docker Compose 已安装"

# 步骤2: 检查环境变量文件
log_info "步骤2: 检查环境变量配置..."

if [ ! -f .env.demo ]; then
    log_warning "未找到 .env.demo 文件，正在从示例文件创建..."
    if [ -f .env.demo.example ]; then
        cp .env.demo.example .env.demo
        log_warning "请编辑 .env.demo 文件配置DEMO环境变量"
        log_warning "编辑完成后重新运行此脚本"
        exit 1
    else
        log_error "未找到 .env.demo.example 文件"
        exit 1
    fi
else
    log_success "找到 .env.demo 文件"
fi

# 步骤3: 加载环境变量
log_info "步骤3: 加载DEMO环境变量..."
set -a
source .env.demo
set +a

# 步骤4: 检查必要的环境变量
log_info "步骤4: 验证环境变量..."
required_vars=("GEMINI_API_KEY" "DASHSCOPE_API_KEY")

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    log_warning "以下环境变量未设置: ${missing_vars[*]}"
    log_warning "请在 .env.demo 文件中设置这些变量"
    exit 1
fi

log_success "环境变量验证通过"

# 步骤5: 创建必要的目录
log_info "步骤5: 创建DEMO数据目录..."
mkdir -p demo/business/data
mkdir -p demo/business/config
mkdir -p demo/government/config
mkdir -p demo/government/credentials
mkdir -p demo/logs

log_success "DEMO目录创建完成"

# 步骤6: 停止现有DEMO服务（如果存在）
log_info "步骤6: 停止现有DEMO服务..."
docker-compose -f docker-compose.demo.yml down --remove-orphans 2>/dev/null || true
log_success "现有DEMO服务已停止"

# 步骤7: 构建和启动DEMO服务
log_info "步骤7: 构建DEMO服务镜像..."
docker-compose -f docker-compose.demo.yml build --no-cache
log_success "DEMO服务镜像构建完成"

log_info "步骤8: 启动DEMO服务..."
docker-compose -f docker-compose.demo.yml up -d
log_success "DEMO服务启动命令已执行"

# 步骤8: 等待服务就绪
log_info "步骤9: 等待服务就绪..."
echo "等待30秒让服务完全启动..."
sleep 30

# 步骤9: 运行健康检查
log_info "步骤10: 运行健康检查..."

check_service_health() {
    local service_name=$1
    local port=$2

    if curl -s -f "http://localhost:$port/health" > /dev/null; then
        log_success "$service_name 服务健康检查通过 (端口: $port)"
        return 0
    else
        log_error "$service_name 服务健康检查失败 (端口: $port)"
        return 1
    fi
}

# 检查商务版服务
if check_service_health "商务版DEMO" 3004; then
    # 初始化商务版DEMO数据
    log_info "初始化商务版DEMO数据..."
    docker-compose -f docker-compose.demo.yml exec -T demo-business npm run demo:init 2>/dev/null || true
    log_success "商务版DEMO数据初始化完成"
else
    log_warning "商务版DEMO服务未就绪，跳过数据初始化"
fi

# 检查政务版服务
if check_service_health "政务版DEMO" 3005; then
    log_success "政务版DEMO服务健康检查通过"
else
    log_warning "政务版DEMO服务未就绪"
fi

# 检查前端服务
log_info "检查前端服务..."
if curl -s -f "http://localhost:5175" > /dev/null; then
    log_success "前端服务健康检查通过 (端口: 5175)"
else
    log_warning "前端服务健康检查失败，可能仍在启动中"
fi

# 步骤10: 显示部署结果
echo ""
echo "=========================================="
echo "   DEMO环境部署完成!"
echo "=========================================="
echo ""
echo "访问地址:"
echo "- DEMO前端:      http://localhost:5175"
echo "- 商务版DEMO:    http://localhost:5175/business"
echo "- 政务版DEMO:    http://localhost:5175/government"
echo "- 商务版API文档: http://localhost:3004/api/docs"
echo "- 政务版API文档: http://localhost:3005/api/docs"
echo ""
echo "数据库访问:"
echo "- 商务版数据库: localhost:3308 (用户名: demo_user, 密码: demo_password)"
echo "- 政务版数据库: localhost:3309 (用户名: gov_user, 密码: gov_password)"
echo ""
echo "管理命令:"
echo "- 查看日志: docker-compose -f docker-compose.demo.yml logs -f"
echo "- 停止服务: docker-compose -f docker-compose.demo.yml down"
echo "- 重启服务: docker-compose -f docker-compose.demo.yml restart"
echo "- 重置数据: docker-compose -f docker-compose.demo.yml exec demo-business npm run demo:reset"
echo ""
echo "注意:"
echo "1. 首次访问可能需要等待前端完全编译"
echo "2. 确保防火墙允许上述端口访问"
echo "3. 政务版DEMO需要有效的API密钥才能使用真实AI服务"
echo ""

# 步骤11: 创建快速测试脚本
log_info "创建快速测试脚本..."
cat > scripts/demo/quick-test.sh << 'EOF'
#!/bin/bash
echo "运行DEMO快速测试..."
echo "1. 测试商务版API..."
curl -s http://localhost:3004/health | grep -q "status.*OK" && echo "✓ 商务版API正常" || echo "✗ 商务版API异常"
echo "2. 测试政务版API..."
curl -s http://localhost:3005/health | grep -q "status.*OK" && echo "✓ 政务版API正常" || echo "✗ 政务版API异常"
echo "3. 测试前端服务..."
curl -s http://localhost:5175 | grep -q "<html" && echo "✓ 前端服务正常" || echo "✗ 前端服务异常"
echo "测试完成!"
EOF

chmod +x scripts/demo/quick-test.sh
log_success "快速测试脚本创建完成"

log_success "DEMO环境部署脚本执行完成!"
echo ""
echo "提示: 运行 scripts/demo/quick-test.sh 进行快速测试"
echo "=========================================="
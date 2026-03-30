#!/bin/bash
# DEMO环境监控脚本
# 定期检查DEMO服务状态，发现问题时发送告警

set -e

# 配置
CHECK_INTERVAL=${CHECK_INTERVAL:-60}  # 检查间隔（秒）
MAX_FAILURES=${MAX_FAILURES:-3}       # 最大连续失败次数
ALERT_EMAIL=${ALERT_EMAIL:-}          # 告警邮箱
LOG_FILE=${LOG_FILE:-/tmp/demo-monitor.log}  # 日志文件

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        INFO) color=$BLUE ;;
        SUCCESS) color=$GREEN ;;
        WARNING) color=$YELLOW ;;
        ERROR) color=$RED ;;
        *) color=$NC ;;
    esac

    echo -e "${color}[$timestamp] [$level]${NC} $message" | tee -a "$LOG_FILE"
}

# 检查服务
check_service() {
    local name=$1
    local url=$2

    if curl -s -f --max-time 10 "$url" > /dev/null; then
        log SUCCESS "$name 服务正常: $url"
        return 0
    else
        log ERROR "$name 服务异常: $url"
        return 1
    fi
}

# 检查容器
check_container() {
    local name=$1

    if docker ps --filter "name=$name" --format "{{.Status}}" | grep -q "Up"; then
        log SUCCESS "容器 $name 运行正常"
        return 0
    else
        log ERROR "容器 $name 未运行"
        return 1
    fi
}

# 检查资源使用
check_resources() {
    local name=$1

    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" "$name" 2>/dev/null | tail -n +2 || true
}

# 发送告警
send_alert() {
    local service=$1
    local issue=$2

    log ERROR "发送告警: $service - $issue"

    # 邮件告警
    if [ -n "$ALERT_EMAIL" ]; then
        echo "DEMO服务告警: $service - $issue" | mail -s "[DEMO告警] $service 异常" "$ALERT_EMAIL" 2>/dev/null || true
    fi

    # 这里可以添加其他告警方式，如Slack、Webhook等
    # curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"DEMO服务告警: $service - $issue\"}" $SLACK_WEBHOOK 2>/dev/null || true
}

# 主监控循环
monitor_loop() {
    log INFO "开始DEMO环境监控，检查间隔: ${CHECK_INTERVAL}秒"

    # 服务列表
    services=(
        "商务版API:http://localhost:3004/health"
        "政务版API:http://localhost:3005/health"
        "前端服务:http://localhost:5175"
    )

    # 容器列表
    containers=(
        "lumina-demo-business"
        "lumina-demo-government"
        "lumina-demo-db"
        "lumina-gov-db"
        "lumina-demo-frontend"
    )

    # 失败计数
    declare -A failure_count

    while true; do
        log INFO "开始新一轮监控检查..."

        # 检查服务
        for service in "${services[@]}"; do
            name="${service%%:*}"
            url="${service#*:}"

            if ! check_service "$name" "$url"; then
                failure_count["$name"]=$((failure_count["$name"] + 1))

                if [ "${failure_count["$name"]}" -ge "$MAX_FAILURES" ]; then
                    send_alert "$name" "连续${MAX_FAILURES}次检查失败"
                    failure_count["$name"]=0  # 重置计数，避免重复告警
                fi
            else
                failure_count["$name"]=0
            fi
        done

        # 检查容器
        for container in "${containers[@]}"; do
            if ! check_container "$container"; then
                failure_count["$container"]=$((failure_count["$container"] + 1))

                if [ "${failure_count["$container"]}" -ge "$MAX_FAILURES" ]; then
                    send_alert "$container" "容器未运行"
                    failure_count["$container"]=0
                fi
            else
                failure_count["$container"]=0
            fi
        done

        # 定期资源检查（每小时一次）
        if [ $(( $(date +%M) % 60 )) -eq 0 ]; then
            log INFO "执行资源使用检查..."
            for container in "${containers[@]}"; do
                resources=$(check_resources "$container")
                if [ -n "$resources" ]; then
                    log INFO "容器资源使用 - $container:\n$resources"
                fi
            done
        fi

        # 日志轮转（每天一次）
        if [ "$(date +%H%M)" = "0000" ]; then
            log INFO "执行日志轮转..."
            if [ -f "$LOG_FILE" ]; then
                mv "$LOG_FILE" "${LOG_FILE}.$(date +%Y%m%d)"
            fi
        fi

        log INFO "监控检查完成，等待 ${CHECK_INTERVAL} 秒后继续..."
        sleep "$CHECK_INTERVAL"
    done
}

# 启动监控
case "${1:-}" in
    start)
        log INFO "启动DEMO监控服务..."
        monitor_loop
        ;;
    status)
        log INFO "检查DEMO服务状态..."
        check_service "商务版API" "http://localhost:3004/health"
        check_service "政务版API" "http://localhost:3005/health"
        check_service "前端服务" "http://localhost:5175"

        for container in "lumina-demo-business" "lumina-demo-government" "lumina-demo-db" "lumina-gov-db" "lumina-demo-frontend"; do
            check_container "$container"
        done
        ;;
    once)
        log INFO "执行单次DEMO健康检查..."
        ./scripts/demo/check-health.sh
        ;;
    resources)
        log INFO "检查容器资源使用..."
        for container in "lumina-demo-business" "lumina-demo-government" "lumina-demo-db" "lumina-gov-db" "lumina-demo-frontend"; do
            echo "=== $container ==="
            check_resources "$container"
            echo ""
        done
        ;;
    help|*)
        echo "DEMO环境监控脚本"
        echo "用法: $0 {start|status|once|resources|help}"
        echo ""
        echo "命令:"
        echo "  start    启动持续监控服务"
        echo "  status   检查服务状态"
        echo "  once     执行单次健康检查"
        echo "  resources 检查容器资源使用"
        echo "  help     显示此帮助信息"
        echo ""
        echo "环境变量:"
        echo "  CHECK_INTERVAL  检查间隔（秒，默认: 60）"
        echo "  MAX_FAILURES    最大连续失败次数（默认: 3）"
        echo "  ALERT_EMAIL     告警邮箱"
        echo "  LOG_FILE        日志文件（默认: /tmp/demo-monitor.log）"
        ;;
esac
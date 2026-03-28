#!/bin/bash
# 测试修复后的营销策略生成API，检查wechatFullPlan字段是否生成

echo "测试营销策略生成API（增强提示词版本）..."
echo "========================================"

# 使用正确的端点
ENDPOINT="http://localhost:3003/api/v1/analytics/strategies/generate"
CAMPAIGN_ENDPOINT="http://localhost:3003/api/v1/analytics/campaigns"

# 使用现有的活动ID
CAMPAIGN_ID="c22b3f59-11e5-4068-b580-69dc6486055a"
echo "1. 使用现有活动ID: $CAMPAIGN_ID"

echo "使用活动ID: $CAMPAIGN_ID"
echo "========================================"

# 生成营销策略
echo "2. 生成营销策略（使用Qwen）..."
STRATEGY_RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"campaignId\": \"$CAMPAIGN_ID\",
    \"strategyType\": \"CONTENT\",
    \"useGemini\": true
  }")

echo "策略生成响应状态: $(echo "$STRATEGY_RESPONSE" | jq -r '.success' 2>/dev/null || echo '无法解析JSON')"

# 检查响应中是否包含wechatFullPlan字段
if echo "$STRATEGY_RESPONSE" | jq -e '.data.wechatFullPlan' >/dev/null 2>&1; then
  echo "✅ 成功：响应中包含 wechatFullPlan 字段"

  # 提取并显示wechatFullPlan内容摘要
  WECHAT_PLAN=$(echo "$STRATEGY_RESPONSE" | jq -r '.data.wechatFullPlan' 2>/dev/null)
  if [ "$WECHAT_PLAN" != "null" ] && [ -n "$WECHAT_PLAN" ]; then
    echo "wechatFullPlan 字段存在，检查子字段..."

    # 检查子字段
    HAS_ARTICLE_SERIES=$(echo "$STRATEGY_RESPONSE" | jq -e '.data.wechatFullPlan.articleSeries' >/dev/null 2>&1 && echo "✅" || echo "❌")
    HAS_OFFLINE_DECORATION=$(echo "$STRATEGY_RESPONSE" | jq -e '.data.wechatFullPlan.offlineDecoration' >/dev/null 2>&1 && echo "✅" || echo "❌")
    HAS_MEMBERSHIP_BENEFITS=$(echo "$STRATEGY_RESPONSE" | jq -e '.data.wechatFullPlan.membershipBenefits' >/dev/null 2>&1 && echo "✅" || echo "❌")

    echo "  - articleSeries: $HAS_ARTICLE_SERIES"
    echo "  - offlineDecoration: $HAS_OFFLINE_DECORATION"
    echo "  - membershipBenefits: $HAS_MEMBERSHIP_BENEFITS"

    # 显示articleSeries数量
    ARTICLE_COUNT=$(echo "$STRATEGY_RESPONSE" | jq -r '.data.wechatFullPlan.articleSeries | length' 2>/dev/null || echo "0")
    echo "  - articleSeries文章数量: $ARTICLE_COUNT"

    if [ "$ARTICLE_COUNT" -gt 0 ]; then
      echo "  - 前3篇文章标题:"
      for i in $(seq 0 $(($ARTICLE_COUNT-1))); do
        if [ $i -lt 3 ]; then
          TITLE=$(echo "$STRATEGY_RESPONSE" | jq -r ".data.wechatFullPlan.articleSeries[$i].title // \"无标题\"" 2>/dev/null)
          echo "    $((i+1)). $TITLE"
        fi
      done
    fi
  else
    echo "❌ wechatFullPlan字段值为null或空"
  fi
else
  echo "❌ 失败：响应中不包含 wechatFullPlan 字段"
  echo "检查AI原始响应..."
  AI_RAW=$(echo "$STRATEGY_RESPONSE" | jq -r '.data.aiResponseRaw' 2>/dev/null)
  if [ "$AI_RAW" != "null" ] && [ -n "$AI_RAW" ]; then
    echo "AI原始响应前500字符:"
    echo "$AI_RAW" | head -c 500
    echo ""
  fi
fi

echo "========================================"
echo "测试完成"
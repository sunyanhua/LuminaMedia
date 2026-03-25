#!/bin/bash
# 测试营销策略生成API，检查wechatFullPlan字段

echo "测试营销策略生成API..."
echo "======================================"

# 首先获取一个活动ID
echo "1. 获取可用活动列表..."
ACTIVITIES_RESPONSE=$(curl -s -X GET "http://localhost:3003/api/marketing-campaigns" \
  -H "Content-Type: application/json")

echo "响应: $ACTIVITIES_RESPONSE"

# 提取第一个活动ID
CAMPAIGN_ID=$(echo "$ACTIVITIES_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CAMPAIGN_ID" ]; then
  echo "没有找到活动，创建测试活动..."
  # 创建一个测试活动
  CREATE_CAMPAIGN_RESPONSE=$(curl -s -X POST "http://localhost:3003/api/marketing-campaigns" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "测试微信全案生成",
      "campaignType": "PROMOTIONAL",
      "targetAudience": {"description": "测试用户群体"},
      "budget": 50000,
      "userId": "test-user-001"
    }')

  echo "创建活动响应: $CREATE_CAMPAIGN_RESPONSE"
  CAMPAIGN_ID=$(echo "$CREATE_CAMPAIGN_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [ -z "$CAMPAIGN_ID" ]; then
  echo "错误：无法获取或创建活动ID"
  exit 1
fi

echo "使用活动ID: $CAMPAIGN_ID"
echo "======================================"

# 生成营销策略
echo "2. 生成营销策略..."
STRATEGY_RESPONSE=$(curl -s -X POST "http://localhost:3003/api/marketing-strategies/generate" \
  -H "Content-Type: application/json" \
  -d "{
    \"campaignId\": \"$CAMPAIGN_ID\",
    \"strategyType\": \"CONTENT\",
    \"useGemini\": true
  }")

echo "策略生成响应: $STRATEGY_RESPONSE"
echo "======================================"

# 检查响应中是否包含wechatFullPlan字段
if echo "$STRATEGY_RESPONSE" | grep -q "wechatFullPlan"; then
  echo "✅ 成功：响应中包含 wechatFullPlan 字段"

  # 提取并显示wechatFullPlan内容
  WECHAT_PLAN=$(echo "$STRATEGY_RESPONSE" | grep -o '"wechatFullPlan":{[^}]*}' || echo "无法提取完整字段")
  if [ "$WECHAT_PLAN" != "无法提取完整字段" ]; then
    echo "wechatFullPlan 内容: $WECHAT_PLAN"
  else
    # 尝试用更宽松的方式提取
    WECHAT_PLAN=$(echo "$STRATEGY_RESPONSE" | grep -o '"wechatFullPlan":"[^"]*"' || echo "无法提取字段值")
    echo "wechatFullPlan 内容: $WECHAT_PLAN"
  fi
else
  echo "❌ 失败：响应中不包含 wechatFullPlan 字段"
  echo "完整响应:"
  echo "$STRATEGY_RESPONSE"
fi

echo "======================================"
echo "测试完成"
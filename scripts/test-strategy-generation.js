#!/usr/bin/env node

/**
 * Google Gemini 营销策略生成测试
 * 测试完整的营销策略生成流程
 */

const dotenv = require('dotenv');
const path = require('path');

// 动态加载 undici（代理支持）
let setGlobalDispatcher, ProxyAgent;
try {
  const undici = require('undici');
  setGlobalDispatcher = undici.setGlobalDispatcher;
  ProxyAgent = undici.ProxyAgent;
  console.log('✓ undici 代理支持已加载');
} catch (error) {
  console.warn('⚠️  undici 未安装，代理功能将不可用');
  setGlobalDispatcher = () => {};
  ProxyAgent = class {};
}

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function testStrategyGeneration() {
  console.log('🎯 Google Gemini 营销策略生成测试\n');
  console.log(`环境变量文件: ${envPath}`);

  // 配置全局 HTTP 代理（如果设置了 HTTPS_PROXY 环境变量）
  const proxyUrl = process.env.HTTPS_PROXY;
  if (proxyUrl && ProxyAgent.name !== '') {
    try {
      const proxyAgent = new ProxyAgent(proxyUrl);
      setGlobalDispatcher(proxyAgent);
      console.log(`✓ 已设置全局 HTTP 代理: ${proxyUrl}`);
    } catch (proxyError) {
      console.warn(`⚠️  设置代理失败: ${proxyError.message}`);
    }
  } else if (proxyUrl) {
    console.warn(`⚠️  检测到代理配置但 undici 未安装，代理功能不可用`);
  } else {
    console.log('ℹ️  未设置 HTTPS_PROXY 环境变量，使用直连网络');
  }
  console.log('');

  // 检查 API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ 错误: GEMINI_API_KEY 环境变量未设置');
    process.exit(1);
  }

  if (apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️  警告: 使用默认的 API Key 值，请替换为实际的 Gemini API Key');
  }

  console.log(`✓ API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);

  // 检查模型配置
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7');
  const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '2048');
  const topP = parseFloat(process.env.GEMINI_TOP_P || '0.95');
  const topK = parseInt(process.env.GEMINI_TOP_K || '40');

  console.log(`✓ 模型: ${model}`);
  console.log(`✓ 温度: ${temperature}`);
  console.log(`✓ 最大令牌数: ${maxTokens}`);
  console.log(`✓ Top-P: ${topP}`);
  console.log(`✓ Top-K: ${topK}`);

  // 构建营销活动摘要（模拟数据）
  const campaignSummary = {
    name: '春季美妆新品推广活动',
    campaignType: '产品推广',
    targetAudience: {
      description: '20-35岁女性，关注美妆护肤，活跃于小红书',
      demographics: ['20-35岁', '女性', '一线城市'],
      interests: ['美妆', '护肤', '时尚', '生活方式'],
      purchaseBehavior: '注重成分和口碑，愿意为高品质产品付费'
    },
    budget: 50000,
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-06-30'),
    insights: {
      totalStrategies: 3,
      averageConfidenceScore: 82.5,
      strategyTypeDistribution: { CONTENT: 2, CHANNEL: 1 },
      estimatedTotalROI: 150,
      completionRate: 60
    }
  };

  const strategyType = 'CONTENT';

  // 构建提示词（与 gemini.service.ts 中的逻辑一致）
  const prompt = `你是一位经验丰富的灵曜智媒首席营销专家。请基于以下营销活动摘要，生成一份详细的营销策略方案。

活动信息：
- 活动名称：${campaignSummary.name}
- 活动类型：${campaignSummary.campaignType}
- 目标受众：${JSON.stringify(campaignSummary.targetAudience, null, 2)}
- 预算：${campaignSummary.budget} 元
- 时间范围：${campaignSummary.startDate.toISOString().split('T')[0]} 至 ${campaignSummary.endDate.toISOString().split('T')[0]}
- 策略类型：${strategyType}

活动洞察：
- 已生成策略数量：${campaignSummary.insights.totalStrategies}
- 平均置信度分数：${campaignSummary.insights.averageConfidenceScore.toFixed(1)}
- 策略类型分布：${JSON.stringify(campaignSummary.insights.strategyTypeDistribution)}
- 预估总 ROI：${campaignSummary.insights.estimatedTotalROI.toFixed(2)}%
- 完成率：${campaignSummary.insights.completionRate}%

请生成一份包含以下内容的 JSON 方案：
1. 活动名称（campaignName）：基于原活动名称的优化版本
2. 目标人群分析（targetAudienceAnalysis）：详细描述目标人群特征、痛点、兴趣点，包含 demographics、interests、painPoints、preferredChannels 字段
3. 核心创意（coreIdea）：活动的核心创意概念和独特卖点，100-200字
4. 小红书文案（xhsContent）：适合小红书平台的完整文案，包含 title、content、hashtags、suggestedImages 字段
5. 建议执行时间（recommendedExecutionTime）：具体的时间安排和执行计划，包含 timeline、bestPostingTimes、seasonalConsiderations 字段
6. 预期效果指标（expectedPerformanceMetrics）：包括 engagementRate（互动率 0-100）、conversionRate（转化率 0-100）、expectedReach（预期覆盖人数）、estimatedROI（预估投资回报率）等量化指标
7. 执行步骤计划（executionSteps）：详细的执行步骤、时间节点和负责人，每个步骤包含 step、description、responsible、deadline 字段
8. 风险评估（riskAssessment）：可能遇到的风险点和相应的应对措施，每个风险包含 risk、probability（低/中/高）、impact（低/中/高）、mitigationStrategy 字段
9. 预算分配方案（budgetAllocation）：详细的预算分配建议，包含 category、amount、percentage、justification 字段

请以严格的 JSON 格式返回，确保字段名称与上述要求一致，不要包含任何额外的文本或解释。`;

  try {
    console.log('\n🔄 正在生成营销策略...');
    console.log(`📊 活动名称: ${campaignSummary.name}`);
    console.log(`💰 预算: ${campaignSummary.budget} 元`);
    console.log(`🎯 策略类型: ${strategyType}`);

    // 使用 REST API 调用 Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature,
        topP,
        topK,
        maxOutputTokens: maxTokens
      }
    };

    console.log(`\n📨 发送请求到: ${apiUrl}`);
    console.log(`📝 请求长度: ${prompt.length} 字符`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API 请求失败: HTTP ${response.status} ${response.statusText}`);
      console.error(`错误响应: ${errorText.substring(0, 500)}`);
      process.exit(1);
    }

    const data = await response.json();

    // 提取生成的文本
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      console.error('❌ 未收到生成的文本');
      console.error('响应数据:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log(`\n✅ 营销策略生成成功！`);
    console.log(`📄 响应长度: ${generatedText.length} 字符`);

    // 尝试解析 JSON
    try {
      // 尝试提取 JSON 部分
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || generatedText.match(/{[\s\S]*}/);
      const jsonText = jsonMatch ? jsonMatch[0].replace(/```json\n|\n```/g, '') : generatedText;

      const parsed = JSON.parse(jsonText);

      console.log('\n📊 生成的营销策略摘要:');
      console.log(`   活动名称: ${parsed.campaignName}`);
      console.log(`   核心创意: ${parsed.coreIdea.substring(0, 100)}...`);
      console.log(`   小红书标题: ${parsed.xhsContent?.title || 'N/A'}`);
      console.log(`   预期 ROI: ${parsed.expectedPerformanceMetrics?.estimatedROI || 'N/A'}%`);
      console.log(`   执行步骤数: ${parsed.executionSteps?.length || 0}`);
      console.log(`   风险评估数: ${parsed.riskAssessment?.length || 0}`);

      // 验证必需字段
      const requiredFields = [
        'campaignName',
        'targetAudienceAnalysis',
        'coreIdea',
        'xhsContent',
        'recommendedExecutionTime',
        'expectedPerformanceMetrics',
        'executionSteps',
        'riskAssessment',
        'budgetAllocation'
      ];

      let missingFields = [];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        console.warn(`⚠️  缺少必需字段: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ 所有必需字段完整');
      }

      // 显示部分内容
      console.log('\n📝 小红书文案预览:');
      if (parsed.xhsContent) {
        console.log(`   标题: ${parsed.xhsContent.title}`);
        console.log(`   内容: ${parsed.xhsContent.content.substring(0, 150)}...`);
        console.log(`   话题标签: ${parsed.xhsContent.hashtags?.join(', ') || '无'}`);
      }

      console.log('\n💰 预算分配预览:');
      if (parsed.budgetAllocation && parsed.budgetAllocation.length > 0) {
        parsed.budgetAllocation.slice(0, 3).forEach(item => {
          console.log(`   ${item.category}: ${item.amount}元 (${item.percentage}%)`);
        });
      }

      console.log('\n✅ 测试通过！AI 能够输出真实的营销策划方案。');

    } catch (parseError) {
      console.error('❌ 解析 JSON 响应失败:', parseError.message);
      console.log('📄 原始响应文本:');
      console.log(generatedText.substring(0, 1000) + '...');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ 营销策略生成失败:');
    console.error(`   错误类型: ${error.name}`);
    console.error(`   错误信息: ${error.message}`);

    if (error.message.includes('fetch') || error.message.includes('network')) {
      console.error('\n💡 网络连接问题，请检查代理设置');
      console.error(`   当前代理: ${proxyUrl || '未设置'}`);
    }

    process.exit(1);
  }
}

// 运行测试
testStrategyGeneration().catch((error) => {
  console.error('测试脚本执行失败:', error);
  process.exit(1);
});
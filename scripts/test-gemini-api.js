#!/usr/bin/env node

/**
 * Google Gemini API 测试脚本
 * 用于验证 GEMINI_API_KEY 环境变量和 API 连接
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function testGeminiAPI() {
  console.log('🔍 Google Gemini API 连接测试\n');
  console.log(`环境变量文件: ${envPath}`);

  // 检查 API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ 错误: GEMINI_API_KEY 环境变量未设置');
    console.log('\n请在 .env 文件中添加以下配置:');
    console.log('GEMINI_API_KEY=your_gemini_api_key_here');
    console.log('GEMINI_MODEL=gemini-1.5-flash');
    console.log('GEMINI_TEMPERATURE=0.7');
    console.log('GEMINI_MAX_TOKENS=2048');
    console.log('GEMINI_TOP_P=0.95');
    console.log('GEMINI_TOP_K=40');
    process.exit(1);
  }

  if (apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️  警告: 使用默认的 API Key 值，请替换为实际的 Gemini API Key');
    console.log('获取 API Key: https://makersuite.google.com/app/apikey');
  }

  console.log(`✓ API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);

  // 检查其他配置
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7');
  const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '2048');
  const topP = parseFloat(process.env.GEMINI_TOP_P || '0.95');
  const topK = parseInt(process.env.GEMINI_TOP_K || '40');

  console.log(`✓ 模型: ${model}`);
  console.log(`✓ 温度: ${temperature}`);
  console.log(`✓ 最大令牌数: ${maxTokens}`);
  console.log(`✓ Top-P: ${topP}`);
  console.log(`✓ Top-K: ${topK}`);

  try {
    console.log('\n🔄 正在连接 Gemini API...');

    // 初始化 Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        topP,
        topK,
        maxOutputTokens: maxTokens,
      },
    });

    // 测试请求
    const testPrompt = '请用中文回复"Gemini API 连接成功！"';
    console.log(`\n📨 发送测试请求: "${testPrompt}"`);

    const result = await geminiModel.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();

    console.log(`\n✅ Gemini API 连接成功！`);
    console.log(`📝 响应: ${text}`);
    console.log('\n✅ 所有测试通过！Gemini API 集成配置正确。');

    // 显示使用示例
    console.log('\n📋 使用示例:');
    console.log('1. 启动应用: npm run start:dev');
    console.log('2. 生成营销策略:');
    console.log('   POST /api/v1/analytics/strategies/generate');
    console.log('   Body: { "campaignId": "your-campaign-id", "useGemini": true }');
    console.log('\n📚 故障排除:');
    console.log('• 确保 API Key 有足够的配额');
    console.log('• 检查网络连接（可能需要科学上网）');
    console.log('• 验证 API Key 在 Google AI Studio 中有效');

    return true;
  } catch (error) {
    console.error('\n❌ Gemini API 连接失败:');
    console.error(`   错误类型: ${error.name}`);
    console.error(`   错误信息: ${error.message}`);

    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n💡 建议:');
      console.error('• 检查 API Key 是否正确');
      console.error('• 确保 API Key 未过期或被禁用');
      console.error('• 在 Google AI Studio 中验证 API Key 有效性');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.error('\n💡 建议:');
      console.error('• 检查 API 配额使用情况');
      console.error('• 升级到付费计划或等待配额重置');
    } else if (error.message.includes('NETWORK')) {
      console.error('\n💡 建议:');
      console.error('• 检查网络连接');
      console.error('• 确保可以访问 Google API 服务');
      console.error('• 可能需要配置代理');
    } else if (error.message.includes('SAFETY')) {
      console.error('\n💡 建议:');
      console.error('• 测试提示词触发了安全过滤器');
      console.error('• 尝试调整提示词内容');
    } else {
      console.error('\n💡 建议:');
      console.error('• 查看完整错误堆栈:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// 运行测试
testGeminiAPI().catch((error) => {
  console.error('测试脚本执行失败:', error);
  process.exit(1);
});
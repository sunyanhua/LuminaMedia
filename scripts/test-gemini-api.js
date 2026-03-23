#!/usr/bin/env node

/**
 * Google Gemini API 测试脚本
 * 用于验证 GEMINI_API_KEY 环境变量和 API 连接
 * 支持多 Key 轮询测试
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

/**
 * 解析逗号分隔的 API Key 字符串为数组
 */
function parseApiKeys(apiKeyString) {
  if (!apiKeyString || apiKeyString.trim() === '') {
    return [];
  }
  return apiKeyString
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0 && key !== 'your_gemini_api_key_here');
}

/**
 * 测试单个 API Key
 */
async function testSingleKey(apiKey, keyIndex = 0) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7');
  const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '2048');
  const topP = parseFloat(process.env.GEMINI_TOP_P || '0.95');
  const topK = parseInt(process.env.GEMINI_TOP_K || '40');

  console.log('>>> [DEPLOY CHECK] API Version: v1 | Model: gemini-2.5-flash');
  const genAI = new GoogleGenerativeAI({ apiKey, apiVersion: 'v1' });
  const geminiModel = genAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature,
      topP,
      topK,
      maxOutputTokens: maxTokens,
    },
  }, { apiVersion: 'v1' });

  const testPrompt = '请用中文回复"Gemini API 连接成功！"';
  const result = await geminiModel.generateContent(testPrompt);
  const response = await result.response;
  return response.text();
}

/**
 * 多 Key 轮询测试
 */
async function testKeyRotation() {
  console.log('🔍 Google Gemini API 多 Key 轮询测试\n');
  console.log(`环境变量文件: ${envPath}`);

  // 检查 API Key
  const apiKeyString = process.env.GEMINI_API_KEY || '';
  const apiKeys = parseApiKeys(apiKeyString);

  if (apiKeys.length === 0) {
    console.error('❌ 错误: 未找到有效的 Gemini API Key');
    console.log('\n请在 .env 文件中添加以下配置:');
    console.log('GEMINI_API_KEY=your_gemini_api_key_here');
    console.log('或多个 Key 用逗号分隔:');
    console.log('GEMINI_API_KEY=key1,key2,key3');
    process.exit(1);
  }

  console.log(`✓ 共解析到 ${apiKeys.length} 个 API Key`);
  apiKeys.forEach((key, index) => {
    console.log(`  Key ${index}: ${key.substring(0, 8)}...${key.substring(key.length - 4)}`);
  });

  // 检查其他配置
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7');
  const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '2048');
  const topP = parseFloat(process.env.GEMINI_TOP_P || '0.95');
  const topK = parseInt(process.env.GEMINI_TOP_K || '40');

  console.log(`\n⚙️  模型配置:`);
  console.log(`  ✓ 模型: ${model}`);
  console.log(`  ✓ 温度: ${temperature}`);
  console.log(`  ✓ 最大令牌数: ${maxTokens}`);
  console.log(`  ✓ Top-P: ${topP}`);
  console.log(`  ✓ Top-K: ${topK}`);

  console.log('\n🔄 开始多 Key 轮询测试（连续 5 次请求）\n');

  let currentKeyIndex = 0;
  const totalRequests = 5;
  const results = [];

  for (let i = 0; i < totalRequests; i++) {
    // 顺序轮询选择 Key
    const keyIndex = currentKeyIndex % apiKeys.length;
    const apiKey = apiKeys[keyIndex];
    currentKeyIndex++;

    console.log(`📨 请求 ${i + 1}/${totalRequests}:`);
    console.log(`  使用 Key 索引: ${keyIndex}`);
    console.log(`  Key 前10位: ${apiKey.substring(0, 10)}...`);

    try {
      const startTime = Date.now();
      const responseText = await testSingleKey(apiKey, keyIndex);
      const elapsedTime = Date.now() - startTime;

      console.log(`  ✅ 请求成功`);
      console.log(`     响应: ${responseText}`);
      console.log(`     耗时: ${elapsedTime}ms`);

      results.push({
        request: i + 1,
        keyIndex,
        keyPreview: apiKey.substring(0, 6),
        success: true,
        response: responseText,
        time: elapsedTime
      });
    } catch (error) {
      console.log(`  ❌ 请求失败`);
      console.log(`     错误类型: ${error.name}`);
      console.log(`     错误信息: ${error.message}`);

      results.push({
        request: i + 1,
        keyIndex,
        keyPreview: apiKey.substring(0, 6),
        success: false,
        error: error.message,
        time: null
      });
    }
    console.log();
  }

  // 统计结果
  const successfulRequests = results.filter(r => r.success).length;
  console.log('📊 测试结果统计:');
  console.log(`  ✅ 成功请求: ${successfulRequests}/${totalRequests}`);
  console.log(`  ❌ 失败请求: ${totalRequests - successfulRequests}/${totalRequests}`);

  if (successfulRequests === 0) {
    console.error('\n❌ 所有 API Key 测试均失败，请检查配置和网络连接');
    console.log('\n💡 建议:');
    console.log('• 检查 API Key 是否正确且未过期');
    console.log('• 确保有足够的 API 配额');
    console.log('• 检查网络连接（可能需要科学上网）');
    console.log('• 验证 API Key 在 Google AI Studio 中有效');
    process.exit(1);
  } else if (successfulRequests < totalRequests) {
    console.warn('\n⚠️  部分请求失败，可能是个别 API Key 无效或配额不足');
  } else {
    console.log('\n✅ 所有请求成功！多 Key 轮询逻辑测试通过。');
  }

  // 显示 Key 使用情况
  console.log('\n🔑 Key 使用情况统计:');
  const keyUsage = {};
  results.forEach(result => {
    const key = `索引 ${result.keyIndex} (${result.keyPreview}...)`;
    keyUsage[key] = (keyUsage[key] || 0) + 1;
  });

  Object.entries(keyUsage).forEach(([key, count]) => {
    console.log(`  ${key}: 使用 ${count} 次`);
  });

  return results;
}

// 运行测试
testKeyRotation().catch((error) => {
  console.error('测试脚本执行失败:', error);
  process.exit(1);
});
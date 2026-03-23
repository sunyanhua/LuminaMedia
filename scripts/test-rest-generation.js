#!/usr/bin/env node

/**
 * 测试直接REST API调用Gemini生成内容
 */

const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function testRestGeneration() {
  const apiKey = process.env.GEMINI_API_KEY?.split(',')[0]?.trim();
  if (!apiKey) {
    console.error('未找到API Key');
    return;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;

  const prompt = '请用中文回复"REST API 测试成功！"';

  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 100
    }
  };

  console.log(`测试REST API生成内容...`);
  console.log(`模型: ${model}`);
  console.log(`URL: ${url}`);
  console.log(`API Key前6位: ${apiKey.substring(0, 6)}...`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const elapsedTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ REST API 调用成功！耗时: ${elapsedTime}ms`);
    console.log(`响应结构:`, Object.keys(data));

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      console.log(`生成内容: ${text}`);
    } else {
      console.log(`完整响应:`, JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error(`REST API 调用失败: ${error.message}`);
    console.error(error.stack);
  }
}

// 检查fetch是否可用（Node 18+）
if (typeof fetch !== 'function') {
  console.error('当前Node版本不支持全局fetch，请使用Node 18+');
  process.exit(1);
}

testRestGeneration();
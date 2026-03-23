#!/usr/bin/env node

/**
 * Google Gemini 模型列表脚本
 * 用于列出当前 API Key 可用的所有模型名称
 * 使用 REST API 直接调用，避免 SDK 兼容性问题
 * 支持 HTTP/HTTPS 代理配置
 */

const dotenv = require('dotenv');
const path = require('path');

// 动态加载 undici（可选依赖）
let setGlobalDispatcher, ProxyAgent;
try {
  const undici = require('undici');
  setGlobalDispatcher = undici.setGlobalDispatcher;
  ProxyAgent = undici.ProxyAgent;
  console.log('✓ undici 代理支持已加载');
} catch (error) {
  console.warn('⚠️  undici 未安装，代理功能将不可用');
  console.warn('   如需代理支持，请运行: npm install undici');
  setGlobalDispatcher = () => {};
  ProxyAgent = class {};
}

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath, override: true });

async function listGeminiModels() {
  console.log('🔍 Google Gemini 可用模型列表 (使用 REST API)\n');
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
    console.warn(`   代理 URL: ${proxyUrl}`);
    console.warn('   如需代理支持，请运行: npm install undici');
  } else {
    console.log('ℹ️  未设置 HTTPS_PROXY 环境变量，使用直连网络');
  }
  console.log('');

  // 检查 API Key
  const rawKeys = process.env.GEMINI_API_KEY || '';
  const apiKeys = rawKeys.split(',')
    .map(k => k.replace(/['" ]/g, '').trim()) // 强制移除引号、空格
    .filter(k => k.startsWith('AIza'));    // 只保留以 AIza 开头的合法 Key

  if (apiKeys.length === 0) {
    console.error('❌ 错误: 未找到有效的Gemini API Key');
    console.log('\n请在 .env 文件中添加以下配置:');
    console.log('GEMINI_API_KEY=your_gemini_api_key_here');
    console.log('可以配置多个Key，用逗号分隔');
    process.exit(1);
  }

  // 使用第一个有效的Key
  const apiKey = apiKeys[0];

  if (apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️  警告: 使用默认的 API Key 值，请替换为实际的 Gemini API Key');
    console.log('获取 API Key: https://makersuite.google.com/app/apikey');
  }

  console.log(`✓ 找到 ${apiKeys.length} 个API Key，使用第一个`);
  console.log(`✓ API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);

  // 检查当前配置的模型
  const configuredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  console.log(`✓ 当前配置模型: ${configuredModel}`);
  console.log(`✓ API 版本: v1\n`);

  try {
    console.log('🔄 正在连接 Gemini API 获取模型列表...\n');

    // 使用 REST API 调用 Gemini 模型列表端点
    const apiUrl = 'https://generativelanguage.googleapis.com/v1/models';
    console.log(`📡 API 端点: ${apiUrl}`);
    console.log('📋 正在获取可用模型...\n');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API 请求失败: HTTP ${response.status} ${response.statusText}`);
      console.error(`错误响应: ${errorText.substring(0, 500)}`);

      if (response.status === 404) {
        console.error('\n💡 可能的原因:');
        console.error('• API 版本不正确 - 尝试使用 v1');
        console.error('• 端点 URL 错误');
        console.error('• API Key 权限不足');
      } else if (response.status === 403) {
        console.error('\n💡 可能的原因:');
        console.error('• API Key 无效或已过期');
        console.error('• API Key 权限不足');
        console.error('• 需要启用 Generative Language API');
      } else if (response.status === 429) {
        console.error('\n💡 可能的原因:');
        console.error('• API 配额超限');
        console.error('• 请求频率过高');
      } else if (response.status === 0 || response.status >= 500) {
        console.error('\n💡 可能的原因:');
        console.error('• 网络连接问题，无法访问 Google API');
        console.error('• 代理服务器可能未启动或配置错误');
        console.error(`• 当前代理配置: ${proxyUrl || '未设置'}`);
        console.error('• 请检查代理端口 7897 是否开启');
        console.error('• 尝试在浏览器中访问 https://generativelanguage.googleapis.com/v1/models');
      }

      process.exit(1);
    }

    const data = await response.json();

    if (!data || !data.models || data.models.length === 0) {
      console.log('❌ 未找到可用模型');
      console.log('💡 可能的原因:');
      console.log('   • API Key 权限不足');
      console.log('   • API Key 已过期或被禁用');
      console.log('   • 网络连接问题');
      process.exit(1);
    }

    console.log(`✅ 找到 ${data.models.length} 个可用模型:\n`);

    // 打印所有模型信息
    data.models.forEach((model, index) => {
      const modelName = model.name || '未知模型';
      const displayName = model.displayName || '未命名';
      const description = model.description || '暂无描述';
      const supportedMethods = model.supportedGenerationMethods || [];
      const version = model.version || '未知版本';

      console.log(`#${index + 1}: ${modelName}`);
      console.log(`   显示名称: ${displayName}`);
      console.log(`   描述: ${description}`);
      console.log(`   版本: ${version}`);
      console.log(`   支持的方法: ${supportedMethods.join(', ') || '无'}`);

      // 检查是否为当前配置的模型
      if (modelName.includes(configuredModel)) {
        console.log(`   ✅ 匹配当前配置模型: ${configuredModel}`);
      }

      // 特别标记常见的 Gemini 模型
      if (modelName.includes('gemini-2.5-flash')) {
        console.log(`   ✨ Gemini 2.5 Flash 模型`);
      } else if (modelName.includes('gemini-1.5-flash')) {
        console.log(`   ✨ Gemini 1.5 Flash 模型`);
      } else if (modelName.includes('gemini-1.5-pro')) {
        console.log(`   ✨ Gemini 1.5 Pro 模型`);
      } else if (modelName.includes('gemini-2.0')) {
        console.log(`   ✨ Gemini 2.0 模型`);
      }

      console.log('');
    });

    // 分析并推荐模型
    console.log('📊 模型分析:');
    const geminiFlashModels = data.models.filter(m =>
      m.name && m.name.includes('gemini-1.5-flash')
    );
    const geminiProModels = data.models.filter(m =>
      m.name && m.name.includes('gemini-1.5-pro')
    );
    const gemini25FlashModels = data.models.filter(m =>
      m.name && m.name.includes('gemini-2.5-flash')
    );

    if (gemini25FlashModels.length > 0) {
      console.log(`   • 找到 ${gemini25FlashModels.length} 个 Gemini 2.5 Flash 模型`);
      gemini25FlashModels.forEach(model => {
        console.log(`     - ${model.name}`);
      });
    }

    if (geminiFlashModels.length > 0) {
      console.log(`   • 找到 ${geminiFlashModels.length} 个 Gemini 1.5 Flash 模型`);
      geminiFlashModels.forEach(model => {
        console.log(`     - ${model.name}`);
      });
    }

    if (geminiProModels.length > 0) {
      console.log(`   • 找到 ${geminiProModels.length} 个 Gemini 1.5 Pro 模型`);
      geminiProModels.forEach(model => {
        console.log(`     - ${model.name}`);
      });
    }

    // 检查当前配置模型是否存在
    const exactModel = data.models.find(m =>
      m.name && m.name === `models/${configuredModel}`
    );

    if (exactModel) {
      console.log(`\n✅ 当前配置模型 "${configuredModel}" 在可用模型中存在！`);
      console.log(`   模型名称: ${exactModel.name}`);
    } else {
      console.log(`\n⚠️  当前配置模型 "${configuredModel}" 在可用模型中未找到！`);
      console.log('💡 建议:');

      // 寻找最接近的模型
      const similarModels = data.models.filter(m =>
        m.name && m.name.includes('gemini')
      );

      if (similarModels.length > 0) {
        console.log('   可用的 Gemini 模型:');
        similarModels.forEach(model => {
          console.log(`   • ${model.name.replace('models/', '')}`);
        });

        // 推荐使用 gemini-2.5-flash 或 gemini-1.5-flash-001 或类似模型
        let recommended = similarModels.find(m =>
          m.name.includes('gemini-2.5-flash')
        );
        if (!recommended) {
          recommended = similarModels.find(m =>
            m.name.includes('gemini-1.5-flash')
          );
        }

        if (recommended) {
          const recommendedName = recommended.name.replace('models/', '');
          console.log(`\n   推荐使用: ${recommendedName}`);
          console.log(`   修改 .env 文件中的 GEMINI_MODEL=${recommendedName}`);
        }
      }
    }

    console.log('\n✅ 模型列表获取完成！');

  } catch (error) {
    console.error('\n❌ 获取模型列表失败:');
    console.error(`   错误类型: ${error.name}`);
    console.error(`   错误信息: ${error.message}`);

    if (error.message.includes('fetch')) {
      console.error('\n💡 建议:');
      console.error('• Node.js 版本需要 18+ 以支持 fetch API');
      console.error('• 或者安装 node-fetch 包');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('EAI_AGAIN') || error.message.includes('network') || error.message.includes('timeout')) {
      console.error('\n💡 建议:');
      console.error('• 网络连接问题，无法访问 Google API');
      console.error('• 检查网络连接');
      console.error(`• 当前代理配置: ${proxyUrl || '未设置'}`);
      console.error('• [Lumina AI] 无法连接到 Google API，请检查代理端口 7897 是否开启');
      console.error('• 尝试在浏览器中访问 https://generativelanguage.googleapis.com/v1/models');
      console.error('• 确认代理服务正在运行 (端口 7897)');
    } else {
      console.error('\n💡 建议:');
      console.error('• 查看完整错误堆栈:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// 运行脚本
listGeminiModels().catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
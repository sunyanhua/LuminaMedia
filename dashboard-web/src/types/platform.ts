/**
 * 社交媒体平台枚举
 * 与后端保持同步
 */
export enum Platform {
  XHS = 'XHS', // 小红书
  WECHAT_MP = 'WECHAT_MP', // 微信公众号
  DOUYIN = 'DOUYIN', // 抖音
  BILIBILI = 'BILIBILI', // B站
}

/**
 * 平台显示名称映射
 */
export const PlatformDisplayName: Record<Platform, string> = {
  [Platform.XHS]: '小红书',
  [Platform.WECHAT_MP]: '微信公众号',
  [Platform.DOUYIN]: '抖音',
  [Platform.BILIBILI]: 'B站',
};

/**
 * 平台图标映射（使用Lucide React图标名称）
 */
export const PlatformIconName: Record<Platform, string> = {
  [Platform.XHS]: 'Instagram', // 小红书使用Instagram图标
  [Platform.WECHAT_MP]: 'Facebook', // 微信公众号使用Facebook图标
  [Platform.DOUYIN]: 'Globe', // 抖音使用Globe图标
  [Platform.BILIBILI]: 'Globe', // B站使用Globe图标
};

/**
 * 平台颜色映射（Tailwind CSS类名）
 */
export const PlatformColorClass: Record<Platform, { text: string; bg: string }> = {
  [Platform.XHS]: {
    text: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  [Platform.WECHAT_MP]: {
    text: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  [Platform.DOUYIN]: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  [Platform.BILIBILI]: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
};

/**
 * 平台ID到Platform枚举的映射
 * MatrixWall组件中的平台ID与后端Platform枚举的映射
 */
export const PlatformIdToEnum: Record<string, Platform> = {
  'xhs': Platform.XHS,
  'wechat': Platform.WECHAT_MP,
  'douyin': Platform.DOUYIN,
  'bilibili': Platform.BILIBILI,
};

/**
 * Platform枚举到平台ID的映射
 */
export const PlatformEnumToId: Record<Platform, string> = {
  [Platform.XHS]: 'xhs',
  [Platform.WECHAT_MP]: 'wechat',
  [Platform.DOUYIN]: 'douyin',
  [Platform.BILIBILI]: 'bilibili',
};

/**
 * 检查平台是否支持内容生成
 * 目前只有部分平台支持AI内容生成
 */
export const isPlatformSupportedForContentGeneration = (platform: Platform): boolean => {
  const supportedPlatforms = [Platform.XHS, Platform.WECHAT_MP];
  return supportedPlatforms.includes(platform);
};

/**
 * 获取平台内容生成提示模板
 */
export const getPlatformPromptTemplate = (platform: Platform): string => {
  const templates: Record<Platform, string> = {
    [Platform.XHS]: '请为小红书平台生成一段吸引人的文案，要求：\n1. 使用亲切、真实的语气\n2. 包含Emoji和话题标签\n3. 突出产品或服务的核心卖点\n4. 提供使用场景建议',
    [Platform.WECHAT_MP]: '请为微信公众号生成一篇专业的文章，要求：\n1. 结构清晰，有引言、正文、结论\n2. 提供有价值的深度内容\n3. 使用专业但易懂的语言\n4. 包含数据或案例支持',
    [Platform.DOUYIN]: '请为抖音平台生成一段短视频文案，要求：\n1. 简洁有力，吸引眼球\n2. 适合15-60秒视频\n3. 包含热门话题和标签\n4. 鼓励用户互动',
    [Platform.BILIBILI]: '请为B站生成一段视频或文章内容，要求：\n1. 深入专业，有知识性\n2. 适合年轻用户群体\n3. 包含趣味性和互动性\n4. 结构清晰，易于理解',
  };

  return templates[platform] || '请为该平台生成一段合适的内容';
};
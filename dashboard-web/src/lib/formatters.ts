export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toLocaleString('zh-CN');
};

export const formatCurrency = (num: number): string => {
  if (num >= 10000) {
    return `¥${(num / 10000).toFixed(1)}万`;
  }
  return `¥${num.toLocaleString('zh-CN')}`;
};

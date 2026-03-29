import wx from 'weixin-js-sdk';
import apiClient from './apiClient';

/**
 * 微信JSSDK配置接口
 */
export interface WeChatConfig {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
}

/**
 * 分享配置接口
 */
export interface ShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

/**
 * 微信服务类
 * 提供微信JSSDK初始化、分享、登录、支付等功能
 */
class WeChatService {
  private initialized = false;
  private config: WeChatConfig | null = null;

  /**
   * 初始化微信JSSDK
   * @param debug 是否开启调试模式
   * @returns Promise<boolean> 初始化是否成功
   */
  async init(debug = false): Promise<boolean> {
    try {
      // 从后端获取微信配置
      const config = await this.fetchWeChatConfig();

      wx.config({
        debug,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: config.jsApiList,
      });

      this.config = config;

      return new Promise((resolve) => {
        wx.ready(() => {
          this.initialized = true;
          console.log('微信JSSDK初始化成功');
          resolve(true);
        });

        wx.error((error: any) => {
          console.error('微信JSSDK初始化失败:', error);
          this.initialized = false;
          resolve(false);
        });
      });
    } catch (error) {
      console.error('获取微信配置失败:', error);
      return false;
    }
  }

  /**
   * 从后端获取微信JSSDK配置
   */
  private async fetchWeChatConfig(): Promise<WeChatConfig> {
    // 这里调用后端API获取微信配置
    // 后端需要实现签名算法等
    const response = await apiClient.get<WeChatConfig>('/api/wechat/config');
    return response;
  }

  /**
   * 配置微信分享
   * @param shareConfig 分享配置
   */
  setupShare(shareConfig: ShareConfig): void {
    if (!this.initialized) {
      console.warn('微信JSSDK未初始化，请先调用init()方法');
      return;
    }

    wx.ready(() => {
      // 分享给朋友
      wx.updateAppMessageShareData({
        title: shareConfig.title,
        desc: shareConfig.desc,
        link: shareConfig.link,
        imgUrl: shareConfig.imgUrl,
        success: () => {
          console.log('分享给朋友配置成功');
        },
      });

      // 分享到朋友圈
      wx.updateTimelineShareData({
        title: shareConfig.title,
        link: shareConfig.link,
        imgUrl: shareConfig.imgUrl,
        success: () => {
          console.log('分享到朋友圈配置成功');
        },
      });

      // 分享到微博
      wx.onMenuShareWeibo({
        title: shareConfig.title,
        desc: shareConfig.desc,
        link: shareConfig.link,
        imgUrl: shareConfig.imgUrl,
        success: () => {
          console.log('分享到微博配置成功');
        },
      });
    });
  }

  /**
   * 微信登录
   * @param redirectUri 登录后重定向的URI
   * @returns 登录URL
   */
  getLoginUrl(redirectUri: string): string {
    if (!this.config?.appId) {
      throw new Error('微信JSSDK未初始化或缺少appId');
    }

    const encodedUri = encodeURIComponent(redirectUri);
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.config.appId}&redirect_uri=${encodedUri}&response_type=code&scope=snsapi_userinfo&state=wechat_login#wechat_redirect`;
  }

  /**
   * 处理微信登录回调
   * @param code 微信返回的code
   * @returns 用户信息
   */
  async handleLoginCallback(code: string): Promise<any> {
    try {
      const response = await apiClient.post('/api/wechat/login-callback', { code });
      return response;
    } catch (error) {
      console.error('微信登录回调处理失败:', error);
      throw error;
    }
  }

  /**
   * 选择图片（微信内置）
   * @param count 最多选择图片数量
   * @param sourceType 图片来源 ['album', 'camera']
   * @returns 选择的图片本地ID列表
   */
  chooseImage(count = 1, sourceType: ('album' | 'camera')[] = ['album', 'camera']): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error('微信JSSDK未初始化'));
        return;
      }

      wx.chooseImage({
        count,
        sourceType,
        success: (res: any) => {
          resolve(res.localIds);
        },
        fail: (error: any) => {
          reject(error);
        },
      });
    });
  }

  /**
   * 预览图片
   * @param current 当前显示图片的URL
   * @param urls 需要预览的图片URL列表
   */
  previewImage(current: string, urls: string[]): void {
    if (!this.initialized) return;

    wx.previewImage({
      current,
      urls,
    });
  }

  /**
   * 获取网络状态
   * @returns Promise<string> 网络类型
   */
  getNetworkType(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error('微信JSSDK未初始化'));
        return;
      }

      wx.getNetworkType({
        success: (res: any) => {
          resolve(res.networkType);
        },
        fail: reject,
      });
    });
  }

  /**
   * 隐藏微信右上角菜单
   */
  hideOptionMenu(): void {
    if (!this.initialized) return;

    wx.hideOptionMenu();
  }

  /**
   * 显示微信右上角菜单
   */
  showOptionMenu(): void {
    if (!this.initialized) return;

    wx.showOptionMenu();
  }

  /**
   * 检查是否在微信浏览器中
   */
  static isInWeChatBrowser(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('micromessenger');
  }

  /**
   * 获取微信浏览器版本
   */
  static getWeChatVersion(): string | null {
    const ua = navigator.userAgent.toLowerCase();
    const match = ua.match(/micromessenger\/([\d.]+)/i);
    return match ? match[1] : null;
  }
}

// 创建单例实例
export const weChatService = new WeChatService();

// 导出工具函数
export const isInWeChatBrowser = WeChatService.isInWeChatBrowser;
export const getWeChatVersion = WeChatService.getWeChatVersion;
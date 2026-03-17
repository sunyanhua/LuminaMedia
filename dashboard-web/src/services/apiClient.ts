import axios from 'axios';

// 从环境变量获取API基础URL，默认为开发环境
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token等
apiClient.interceptors.request.use(
  (config) => {
    // 这里可以添加认证token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;

    // 统一错误处理
    if (response) {
      // 服务器返回错误状态码
      const { status, data } = response;
      let message = data?.message || '服务器错误';

      switch (status) {
        case 400:
          message = data?.message || '请求参数错误';
          break;
        case 401:
          message = '未授权，请重新登录';
          // 可以在这里跳转到登录页
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = `请求失败: ${status}`;
      }

      console.error(`API Error [${status}]:`, message);
      return Promise.reject({ status, message, data });
    } else if (error.request) {
      // 请求已发出但没有响应
      console.error('Network Error:', error.message);
      return Promise.reject({ status: 0, message: '网络错误，请检查网络连接' });
    } else {
      // 请求配置出错
      console.error('Request Error:', error.message);
      return Promise.reject({ status: -1, message: '请求配置错误' });
    }
  }
);

export default apiClient;
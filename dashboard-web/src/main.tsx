import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';
import { MobileConfigProvider } from './components/mobile/MobileConfigProvider';
import { initWebVitals } from './lib/web-vitals';
// 导入Ant Design Mobile全局样式
import 'antd-mobile/es/global';
import './index.css';

// 初始化Web Vitals性能监控
initWebVitals();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileConfigProvider>
      <RouterProvider router={router} />
    </MobileConfigProvider>
  </StrictMode>
);

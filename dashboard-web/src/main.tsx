import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';
import { MobileConfigProvider } from './components/mobile/MobileConfigProvider';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
// 导入Ant Design Mobile全局样式
import 'antd-mobile/es/global';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MobileConfigProvider>
        <RouterProvider router={router} />
        <Toaster />
      </MobileConfigProvider>
    </AuthProvider>
  </StrictMode>,
);

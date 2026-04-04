# 3.0 DEMO版 - 第四阶段：前端适配 (预计3天)

**阶段目标**: 改造登录页，添加演示环境标识和配额显示

**预计工期**: 3个工作日  
**开始时间**: 待定  
**完成时间**: 待定  
**当前状态**: ⏳ 未开始

---

## 任务清单

### 任务1：登录页改造
- [ ] 更新 `dashboard-web/src/pages/Auth/Login.tsx`
  - 添加商务版/政务版选择界面
  - 显示两个版本选择按钮：
    - "商务版演示" - 对应 `demo@business.com`
    - "政务版演示" - 对应 `demo@government.com`
  - 自动填充对应演示账号
  - 保留密码输入框（统一密码：LuminaDemo2026）
- [ ] 创建版本选择组件 `dashboard-web/src/components/VersionSelector/index.tsx`
  - 美观的版本选择卡片
  - 版本特点展示（图标、描述）
  - 点击切换版本逻辑
- [ ] 更新登录逻辑 `dashboard-web/src/hooks/useAuth.ts`
  - 支持版本参数传递
  - 自动识别租户类型
- [ ] 添加登录页样式 `dashboard-web/src/pages/Auth/Login.less`
  - 响应式布局
  - Mobile-First设计
  - 版本选择卡片样式

### 任务2：演示环境标识组件
- [ ] 创建演示环境横幅组件 `dashboard-web/src/components/DemoBanner/index.tsx`
  - 顶部固定蓝色横幅
  - 显示文本："当前为演示环境"
  - 显示当前租户类型（商务版/政务版）
  - 显示环境标识图标
- [ ] 创建配额显示组件 `dashboard-web/src/components/QuotaDisplay/index.tsx`
  - 显示AI调用次数：5/5（每日重置）
  - 显示内容发布次数：10/10（每日重置）
  - 显示数据导入次数：3/3（每日重置）
  - 进度条可视化
  - 配额用尽警告样式
- [ ] 更新主布局 `dashboard-web/src/layouts/MainLayout.tsx`
  - 在顶部添加 DemoBanner 组件
  - 在导航栏添加 QuotaDisplay 组件
  - 响应式布局适配

### 任务3：演示数据重置功能
- [ ] 创建重置演示对话框组件 `dashboard-web/src/components/DemoResetModal/index.tsx`
  - 警告确认对话框
  - 重置范围说明（仅清空动态数据）
  - 确认/取消按钮
  - 加载状态显示
- [ ] 添加重置演示按钮 `dashboard-web/src/components/DemoResetButton/index.tsx`
  - 按钮样式（红色警告样式）
  - 位置：导航栏或个人中心
  - 点击触发重置对话框
- [ ] 实现重置逻辑 `dashboard-web/src/hooks/useDemoReset.ts`
  - 调用 DELETE /api/analytics/demo/reset
  - 处理成功/失败响应
  - 显示提示消息
- [ ] 更新相关页面集成重置按钮
  - 首页
  - 个人中心
  - 数据管理页

### 任务4：功能菜单动态加载
- [ ] 更新菜单配置 `dashboard-web/src/config/menu.config.ts`
  - 支持动态菜单配置
  - 根据租户类型过滤菜单
- [ ] 创建菜单权限服务 `dashboard-web/src/services/permission.service.ts`
  - 获取当前租户功能配置
  - 动态生成菜单树
  - 缓存菜单配置
- [ ] 更新导航组件 `dashboard-web/src/components/Navigation/SideNav.tsx`
  - 支持动态菜单渲染
  - 根据功能配置显示/隐藏菜单项
- [ ] 更新顶部导航 `dashboard-web/src/components/Navigation/TopNav.tsx`
  - 支持动态菜单渲染

### 任务5：功能配置管理界面
- [ ] 创建功能配置列表页 `dashboard-web/src/pages/Admin/FeatureConfigList.tsx`
  - 表格展示所有功能配置
  - 搜索和过滤功能
  - 启用/禁用切换按钮
  - 编辑和删除操作
- [ ] 创建功能配置编辑页 `dashboard-web/src/pages/Admin/FeatureConfigEdit.tsx`
  - 表单编辑功能配置
  - 字段验证
  - 保存和取消按钮
- [ ] 创建租户功能管理页 `dashboard-web/src/pages/Admin/TenantFeatureList.tsx`
  - 表格展示租户功能状态
  - 批量启用/禁用操作
  - 租户筛选功能
- [ ] 更新路由配置 `dashboard-web/src/router/routes.ts`
  - 添加功能配置管理路由
  - 添加租户功能管理路由
  - 配置权限路由守卫

### 任务6：配额管理界面
- [ ] 创建配额使用情况页 `dashboard-web/src/pages/Dashboard/QuotaOverview.tsx`
  - 配额使用统计图表
  - 配额历史记录表格
  - 重置配额操作按钮
- [ ] 创建配额配置页（管理员） `dashboard-web/src/pages/Admin/QuotaConfig.tsx`
  - 配额配置表单
  - 重置周期设置
  - 配额预警阈值设置
- [ ] 更新个人中心 `dashboard-web/src/pages/User/Profile.tsx`
  - 添加配额使用情况展示
  - 添加配额历史记录

### 任务7：用户体验优化
- [ ] 添加配额用尽提示
  - 创建配额警告组件 `dashboard-web/src/components/QuotaWarning/index.tsx`
  - AI调用配额用尽时显示
  - 提供重置建议
- [ ] 添加演示环境使用指南
  - 创建使用指南弹窗 `dashboard-web/src/components/DemoGuideModal/index.tsx`
  - 首次登录自动显示
  - 可手动关闭
- [ ] 添加操作提示
  - 创建操作提示服务 `dashboard-web/src/services/notification.service.ts`
  - 演示数据重置成功提示
  - 配额即将用尽提示
- [ ] 优化加载状态
  - 统一加载指示器
  - 骨架屏优化

### 任务8：响应式适配和测试
- [ ] 确保所有页面在移动端正常显示
- [ ] 测试不同屏幕尺寸（375px, 768px, 1024px, 1920px）
- [ ] 优化触摸操作体验
- [ ] 测试横竖屏切换

### 任务9：前端测试
- [ ] 单元测试（Jest + React Testing Library）
- [ ] E2E测试（Cypress）
- [ ] 跨浏览器测试（Chrome, Firefox, Safari）
- [ ] 移动端测试（iOS, Android）

---

## 验收标准

### 功能验收
- ✅ 登录页版本选择功能完成
- ✅ 演示环境标识组件完成
- ✅ 配额显示组件完成
- ✅ 演示数据重置功能完成
- ✅ 功能菜单动态加载完成
- ✅ 功能配置管理界面完成
- ✅ 配额管理界面完成
- ✅ 用户体验优化完成

### 界面验收
- ✅ 界面符合Ant Design Mobile规范
- ✅ 颜色方案统一（演示环境蓝色标识）
- ✅ 字体和间距一致
- ✅ 图标使用统一
- ✅ 无布局错乱问题

### 体验验收
- ✅ 页面加载速度≤3秒
- ✅ 交互响应时间≤300ms
- ✅ 无明显卡顿
- ✅ 无障碍访问支持
- ✅ 错误提示友好

### 兼容性验收
- ✅ 支持Chrome、Firefox、Safari最新版
- ✅ 支持iOS Safari、Android Chrome
- ✅ 支持不同屏幕尺寸（375px - 1920px）
- ✅ 支持横竖屏切换

---

## 输出物

1. ✅ **登录页改造完成**
   - 版本选择界面
   - 演示账号自动填充
   - 响应式布局

2. ✅ **演示环境标识组件**
   - 顶部蓝色横幅
   - 配额显示组件
   - 警告提示样式

3. ✅ **演示数据重置功能**
   - 重置对话框
   - 重置按钮
   - 重置逻辑实现

4. ✅ **功能菜单动态加载**
   - 菜单配置服务
   - 动态菜单渲染
   - 租户类型过滤

5. ✅ **功能配置管理界面**
   - 功能配置列表页
   - 功能配置编辑页
   - 租户功能管理页

6. ✅ **配额管理界面**
   - 配额使用情况页
   - 配额配置页
   - 配额历史记录

7. ✅ **用户体验优化**
   - 配额用尽提示
   - 使用指南
   - 操作提示
   - 加载状态优化

8. ✅ **测试报告**
   - 单元测试报告
   - E2E测试报告
   - 跨浏览器测试报告

---

## 风险评估

### 高风险
- **样式冲突**：新组件样式与现有样式冲突
  - **应对策略**：使用CSS Modules，避免全局样式污染

- **路由冲突**：新路由与现有路由冲突
  - **应对策略**：路由冲突检查，统一命名规范

### 中风险
- **性能问题**：动态菜单加载影响性能
  - **应对策略**：菜单缓存，懒加载优化

- **兼容性问题**：移动端显示异常
  - **应对策略**：多设备测试，响应式设计优化

### 低风险
- **用户体验不佳**：配额提示过于频繁
  - **应对策略**：用户设置，频率控制

---

## 任务状态跟踪

- [ ] **任务1：登录页改造** - ⏳ 未开始
- [ ] **任务2：演示环境标识组件** - ⏳ 未开始
- [ ] **任务3：演示数据重置功能** - ⏳ 未开始
- [ ] **任务4：功能菜单动态加载** - ⏳ 未开始
- [ ] **任务5：功能配置管理界面** - ⏳ 未开始
- [ ] **任务6：配额管理界面** - ⏳ 未开始
- [ ] **任务7：用户体验优化** - ⏳ 未开始
- [ ] **任务8：响应式适配和测试** - ⏳ 未开始
- [ ] **任务9：前端测试** - ⏳ 未开始

---

**文档版本**: v1.0  
**创建日期**: 2026-04-03  
**阶段状态**: ⏳ 未开始  
**预计完成**: 3个工作日

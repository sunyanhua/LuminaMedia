# LuminaMedia 项目文档目录

本文档目录包含 LuminaMedia 3.1 DEMO细节推进版 的所有项目文档，按功能分类组织。

## 文档索引

### 项目总览文档
| 文档 | 说明 |
|------|------|
| [Project_Completion_Report.md](./Project_Completion_Report.md) | 项目完成报告 - 项目执行历程、核心成就、系统架构 |
| [Project_Summary_Report.md](./Project_Summary_Report.md) | 项目总结报告 - 实施回顾、技术亮点、经验教训 |

### 实施方案文档
| 文档 | 说明 |
|------|------|
| [Demonstration_Upgrade_Summary.md](./Demonstration_Upgrade_Summary.md) | 演示版升级完整方案 - 环境架构、功能配置、演示数据 |
| [Feature_Config_Detail_Plan.md](./Feature_Config_Detail_Plan.md) | 功能配置细化方案 - RBAC扩展、FeatureGuard实现 |
| [Demo_Data_Preparation_Plan.md](./Demo_Data_Preparation_Plan.md) | 演示数据准备方案 - 数据类型、初始化脚本、重置方案 |
| [Demonstration_Scheme_Discussion_Notes.md](./Demonstration_Scheme_Discussion_Notes.md) | 演示方案讨论记录 |

### 用户与运维文档
| 文档 | 说明 |
|------|------|
| [User_Manual.md](./User_Manual.md) | 用户操作手册 - 登录指南、功能说明、常见问题 |
| [Admin_Manual.md](./Admin_Manual.md) | 管理员配置手册 - 环境配置、功能管理、运维操作 |
| [Demo_Access_Guide.md](./Demo_Access_Guide.md) | 演示环境访问说明 - 访问地址、账号信息、使用须知 |

### 验收报告
| 文档 | 说明 |
|------|------|
| [Deployment_Acceptance_Report.md](./Deployment_Acceptance_Report.md) | 部署验收报告 |
| [Design_Style_Acceptance_Report.md](./Design_Style_Acceptance_Report.md) | 设计风格验收报告 |

### 子目录文档

#### architecture/ - 架构文档
- [modular-monolith.md](./architecture/modular-monolith.md) - 模块化单体架构设计

#### database/ - 数据库文档
- [tenant-isolation.md](./database/tenant-isolation.md) - 多租户数据隔离方案

#### deployment/ - 部署文档
- [cloud-provider.md](./deployment/cloud-provider.md) - 云服务抽象设计
- [full-guide.md](./deployment/full-guide.md) - 完整部署指南

#### demo/ - 演示指南
- [business-demo-guide.md](./demo/business-demo-guide.md) - 商务版演示指南
- [government-demo-guide.md](./demo/government-demo-guide.md) - 政务版演示指南
- [deployment-guide.md](./demo/deployment-guide.md) - 演示环境部署指南
- [demo-scripts.md](./demo/demo-scripts.md) - 演示脚本

#### features/ - 功能模块文档
- [smart-data-engine.md](./features/smart-data-engine.md) - 智能数据引擎
- [ai-agent-workflow.md](./features/ai-agent-workflow.md) - AI Agent工作流
- [matrix-distribution.md](./features/matrix-distribution.md) - 矩阵分发中心
- [data-engine-api.md](./features/data-engine-api.md) - 数据引擎API
- [demo-guide.md](./features/demo-guide.md) - 演示功能指南

#### frontend/ - 前端文档
- [mobile-first-guide.md](./frontend/mobile-first-guide.md) - Mobile-First开发指南

#### compliance/ - 合规文档
- [data-collection-compliance.md](./compliance/data-collection-compliance.md) - 数据采集合规说明

#### tasks/ - 实施任务清单（按版本组织）
- [tasks/3.1-demo/](./tasks/3.1-demo/) - 3.1 DEMO细节推进版六阶段任务清单
- [tasks/3.0-demo/](./tasks/3.0-demo/) - 3.0 DEMO版六阶段任务清单（已归档）
- [tasks/archive/](./tasks/archive/) - 历史版本归档

#### archive/ - 归档文档
- [PROGRESS_3.0_Archive.md](./archive/PROGRESS_3.0_Archive.md) - 3.0 DEMO版完整实施历程归档

#### archive/deprecated/ - 过时文档（已弃用）
此目录包含已过时或已被取代的历史文档，仅供参考。

---

## 文档版本

**当前版本**: v3.1 DEMO细节推进版 (规划中)  
**上一版本**: v3.0 DEMO版 (已归档)  
**最后更新**: 2026-04-05  
**状态**: 3.1任务清单已制定，等待执行

## 快速导航

- **开发指南**: 参见 [../CLAUDE.md](../CLAUDE.md)
- **项目进度**: 参见 [../PROGRESS.md](../PROGRESS.md)
- **任务清单**: 参见 [./tasks/](./tasks/)（按版本分目录：3.1-demo/、3.0-demo/、archive/）
- **3.1实施规划**: 参见 [./archive/shiny-giggling-diffie.md](./archive/shiny-giggling-diffie.md)
- **质检报告**: 参见 [../Audit_Report/](../Audit_Report/)
- **文档管理规范**: 参见 [./Document_Management_Policy.md](./Document_Management_Policy.md)
- **测试文件规范**: 参见 [./Test_File_Management_Policy.md](./Test_File_Management_Policy.md)

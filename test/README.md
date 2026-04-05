# 测试文件目录

本目录存放 LuminaMedia 项目的所有测试文件。

## 目录结构

```
test/
├── README.md                    # 本文件
├── modules/                     # 单元测试（与 src/modules/ 结构对应）
│   ├── ai-engine/
│   │   └── agents/
│   │       ├── analysis/
│   │       ├── copywriting/
│   │       ├── strategy/
│   │       └── workflow/
│   ├── data-engine/
│   ├── publish/
│   ├── workflow/
│   └── ...
├── shared/                      # shared层测试
├── integration/                 # 集成测试
├── e2e/                         # E2E测试
├── fixtures/                    # 测试夹具
├── scripts/                     # 测试脚本
├── archive/                     # 归档测试文件
│   └── backup_test_files/       # 历史备份测试文件
└── jest-e2e.json                # Jest E2E配置
```

## 测试文件命名规范

| 测试类型 | 命名规范 | 示例 |
|----------|----------|------|
| 单元测试 | `*.spec.ts` | `auth.service.spec.ts` |
| 集成测试 | `*.integration.spec.ts` | `database.integration.spec.ts` |
| E2E测试 | `*.e2e-spec.ts` | `login.e2e-spec.ts` |

## 测试执行命令

```bash
# 运行全部单元测试
npm test

# 生成覆盖率报告
npm run test:cov

# 运行E2E测试
npm run test:e2e
```

## 重要规范

1. **测试文件位置**: 所有测试文件必须存放在 `test/` 目录下
2. **禁止在src目录创建测试文件**: `.spec.ts` 和 `.test.ts` 文件严禁放在 `src/` 目录
3. **目录结构对应**: `test/modules/` 下的目录结构与 `src/modules/` 保持一致
4. **临时文件**: 临时测试脚本放在 `test/temp/`，使用期限7天

## 测试文件迁移记录

**2026-04-05**: 将以下测试文件从 `src/` 迁移至 `test/`
- `src/modules/ai-engine/agents/analysis/services/analysis-agent.service.spec.ts`
- `src/modules/ai-engine/agents/copywriting/services/copywriting-agent.service.spec.ts`
- `src/modules/ai-engine/agents/strategy/services/strategy-agent.service.spec.ts`
- `src/modules/ai-engine/agents/workflow/services/agent-workflow.service.spec.ts`
- `src/modules/data-engine/data-quality-monitor/data-quality-monitor.service.spec.ts`
- `src/modules/data-engine/user-profile/user-profile.service.spec.ts`
- `src/modules/publish/adapters/platform-adapter.factory.spec.ts`
- `src/modules/publish/services/publish.service.spec.ts`
- `src/modules/workflow/services/workflow.service.spec.ts`

---

**最后更新**: 2026-04-05

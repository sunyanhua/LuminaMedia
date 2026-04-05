# LuminaMedia 测试文件管理制度

**版本**: v1.0  
**生效日期**: 2026-04-05  
**适用范围**: LuminaMedia项目所有测试代码和数据文件

---

## 1. 总则

### 1.1 目的
规范测试文件的存储位置、命名和管理，确保测试代码与生产代码分离，保持项目结构整洁。

### 1.2 核心原则
- **唯一合法位置**: 所有测试文件必须存放在 `test/` 目录下
- **严禁混放**: 严禁在 `src/` 或根目录创建测试文件
- **结构对应**: `test/` 目录结构与 `src/` 保持对应
- **及时清理**: 临时测试文件7天内必须清理或归档

---

## 2. 测试文件存放位置（强制）

### 2.1 目录结构
```
LuminaMedia/
├── test/                          # 唯一合法的测试目录
│   ├── README.md                  # 测试文件说明
│   ├── modules/                   # 单元测试（与 src/modules/ 结构对应）
│   │   ├── ai-engine/
│   │   ├── data-engine/
│   │   ├── publish/
│   │   └── ...
│   ├── shared/                    # shared层测试
│   ├── integration/               # 集成测试
│   ├── e2e/                       # E2E测试
│   ├── fixtures/                  # 测试夹具（测试数据）
│   ├── scripts/                   # 测试脚本
│   ├── archive/                   # 归档测试文件
│   └── temp/                      # 临时测试文件（7天清理）
└── ...
```

### 2.2 禁止存放位置
❌ **严禁**在以下位置创建测试文件：
- `src/` 目录及其子目录下
- 项目根目录下
- `dashboard-web/` 以外的其他目录

---

## 3. 测试文件命名规范

| 测试类型 | 命名规范 | 存放位置 | 示例 |
|----------|----------|----------|------|
| 单元测试 | `*.spec.ts` | `test/modules/<module>/...` | `auth.service.spec.ts` |
| 集成测试 | `*.integration.spec.ts` | `test/integration/` | `database.integration.spec.ts` |
| E2E测试 | `*.e2e-spec.ts` | `test/e2e/` | `login.e2e-spec.ts` |
| 测试夹具 | `*.fixture.ts` | `test/fixtures/` | `users.fixture.ts` |
| 临时文件 | `temp-*.ts` | `test/temp/` | `temp-debug-script.ts` |

---

## 4. 测试数据管理

### 4.1 测试夹具（Fixtures）
- 测试数据统一存放在 `test/fixtures/` 目录
- 夹具文件命名：`{entity}.fixture.ts`
- 大型测试数据（>100KB）使用JSON文件存放在 `test/fixtures/data/`

### 4.2 测试数据规范
- 敏感数据（密码、密钥）使用占位符，禁止提交真实凭证
- 个人数据使用脱敏数据或虚构数据
- 测试数据文件大小超过1MB需经过审批

---

## 5. 临时测试文件管理

### 5.1 临时文件定义
- 临时性测试代码、调试脚本、实验数据
- 用于验证特定问题的快速测试脚本
- 尚未完成的测试用例草稿

### 5.2 临时文件存放
- 必须存放在 `test/temp/` 目录
- 文件命名必须加 `temp-` 前缀
- 文件头部必须包含创建日期和过期日期注释：
  ```typescript
  /**
   * 临时测试文件
   * 创建日期: 2026-04-05
   * 过期日期: 2026-04-12
   * 用途: 验证XXX功能
   */
  ```

### 5.3 临时文件清理
- 使用期限：**7天**
- 到期后如无保留价值，**必须删除**
- 如有参考价值，迁移到正式目录或归档到 `test/archive/`

---

## 6. 归档管理

### 6.1 归档条件
- 历史版本测试文件不再使用
- 备份的测试文件（如 `backup_test_files/`）
- 已废弃但具有参考价值的测试

### 6.2 归档位置
- `test/archive/` 目录
- 归档文件保持原有目录结构

### 6.3 归档示例
```
test/archive/
└── backup_test_files/           # 历史备份测试文件
    ├── auth.service.spec.ts
    ├── user.controller.spec.ts
    └── ...
```

---

## 7. 迁移流程

### 7.1 从src目录迁移测试文件
如果 `src/` 目录下发现测试文件，按以下流程迁移：

1. **确定目标位置**
   - 根据源文件路径确定对应的 `test/` 目录位置
   - 如 `src/modules/auth/services/auth.service.spec.ts` → `test/modules/auth/services/`

2. **创建目录结构**
   ```bash
   mkdir -p test/modules/auth/services
   ```

3. **移动文件**
   ```bash
   mv src/modules/auth/services/auth.service.spec.ts test/modules/auth/services/
   ```

4. **更新导入路径**
   - 检查并更新测试文件中的相对导入路径
   - 使用路径别名（`@src/`、`@test/`）替代相对路径

5. **验证测试**
   ```bash
   npm test -- test/modules/auth/services/auth.service.spec.ts
   ```

### 7.2 迁移记录
迁移后需在 `test/README.md` 中记录：
```markdown
## 测试文件迁移记录
- **2026-04-05**: 将以下测试文件从 `src/` 迁移至 `test/`
  - `src/modules/auth/services/auth.service.spec.ts`
  - ...
```

---

## 8. 执行检查命令

### 8.1 检查src目录是否有测试文件
```bash
# 查找src目录下的所有测试文件
find src -name "*.spec.ts" -o -name "*.test.ts" 2>/dev/null

# 检查结果应为空（数量=0）
find src -name "*.spec.ts" -o -name "*.test.ts" 2>/dev/null | wc -l
```

### 8.2 检查根目录是否有测试文件
```bash
ls *.spec.ts *.test.ts 2>/dev/null || echo "No test files in root"
```

### 8.3 运行测试
```bash
# 运行全部测试
npm test

# 生成覆盖率报告
npm run test:cov

# 运行特定测试文件
npm test -- test/modules/auth/services/auth.service.spec.ts
```

---

## 9. 违规处理

### 9.1 违规情形
- 在 `src/` 目录下创建 `.spec.ts` 或 `.test.ts` 文件
- 临时文件超过7天未清理
- 敏感数据提交到测试文件

### 9.2 处理措施
1. **立即迁移**: 违规测试文件必须立即迁移到 `test/` 目录
2. **清理**: 临时文件超期立即删除
3. **整改**: 敏感数据提交需立即删除并修改提交历史

---

## 10. 附则

### 10.1 制度执行
- 本制度自发布之日起执行
- 所有开发人员必须遵守
- Code Review时需检查测试文件位置

### 10.2 制度更新
- 本制度根据项目实际情况适时更新
- 更新需经过团队讨论确认

### 10.3 相关文档
- [测试目录说明](../test/README.md)
- [文档管理制度](./Document_Management_Policy.md)
- [CLAUDE.md](../CLAUDE.md) - 执行规范

---

**制度版本**: v1.0  
**制定日期**: 2026-04-05  
**制定人**: LuminaMedia Team  
**审核状态**: 已发布

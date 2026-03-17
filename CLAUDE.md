# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

LuminaMedia (智媒) is an AI-powered content marketing platform DEMO project. The platform enables businesses to import customer data, analyze with AI to generate user profiles and insights, and create marketing strategies with generated content.

### Project Structure
```
LuminaMedia/
├── src/                      # NestJS backend
│   ├── modules/              # Feature modules
│   │   ├── analytics/       # Data analysis module
│   │   ├── content/         # Content generation module
│   │   ├── customer/        # Customer data module
│   │   ├── demo/            # Demo control module
│   │   └── matrix/          # Matrix wall display module
│   ├── shared/              # Shared utilities
│   │   ├── database/        # Database connections
│   │   ├── decorators/      # Custom decorators
│   │   ├── filters/         # Exception filters
│   │   ├── interceptors/    # Interceptors
│   │   └── transformers/     # Response transformers
│   └── main.ts              # Application entry point
├── dashboard-web/           # React frontend (data visualization)
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
└── CLAUDE.md               # This file
```

### Core Technologies
- **Backend**: NestJS (Node.js), TypeScript, TypeORM
- **Frontend**: React, TypeScript, ECharts, Ant Design
- **Database**: MySQL
- **AI Services**: Gemini API (Google)
- **Containerization**: Docker, Docker Compose

---

## Development Rules

### ⚠️ Important: Progress Documentation

**After completing ANY task, you MUST update PROGRESS.md:**

1. Add a new section or update existing section with:
   - Task description
   - Completion status (✅ Done / 🔄 In Progress)
   - Completion timestamp
   - Key changes or findings

2. Update the "Current Status" section at the top of PROGRESS.md

3. Format example:
```markdown
### 任务名称完成 (2026-03-16)

#### 完成内容
- 具体完成项1
- 具体完成项2

#### 验证结果
- ✅ 功能验证通过
- ✅ API 测试正常

**完成时间**: 2026-03-16 HH:MM:SS
```

### Code Quality Standards
- Use TypeScript strict mode
- Follow NestJS module conventions
- Add JSDoc comments for public APIs
- Run linting before commit: `npm run lint`

### Git Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test-related changes

---

## Development Environment

### Starting Development Environment
```bash
# Backend
npm run start:dev

# Frontend (dashboard-web)
cd dashboard-web
npm run dev
```

### Docker Development
```bash
docker-compose up -d
docker-compose logs -f
```

### API Documentation
- Swagger UI: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health

---

## Configuration

### Environment Variables
See `.env.example` for required variables:
- `DATABASE_URL` - MySQL connection
- `GEMINI_API_KEY` - Google Gemini API key
- `PORT` - Server port (default: 3000)

---

## Current Project Status

**Latest completed tasks (2026-03-16):**
- ✅ 一键演示串联测试前后端联调
- ✅ 数据可视化完善增加图表类型
- ✅ 一键重置功能 /demo/reset 接口
- ✅ Docker部署配置 docker-compose 更新
- ✅ DEMO文档编写

**Current focus:** DEMO功能完善与部署

---

## Notes

- Always update PROGRESS.md after completing tasks
- Use Docker for consistent development environment
- Test API changes with Swagger UI before committing

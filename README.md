# Agent Analytics Dashboard

一个用于分析 Coding Agent 执行效果的全栈应用，参考 Cursor Analytics 功能设计实现。

## 功能特性

### 📊 AI 代码输出指标
- **AI 代码占比** - 展示代码变更中由 AI 生成的百分比
- **Agent 编辑数量及接受率** - 追踪 AI 编辑的采纳情况
- **Tab 自动补全统计** - 补全建议次数和接受率
- **消息统计** - 按模式（Chat/Agent/Composer）和模型分类

### 👥 使用活跃度指标
- **活跃用户数** - 日/周期维度统计
- **每日使用趋势** - 可视化过去365天的使用趋势
- **使用排行榜** - Top 10 用户及其常用模型

### 🤖 Agent 特定指标
- **会话统计** - 创建的 Agent 会话数量
- **PR 追踪** - 拉取请求开启和合并数
- **AI 代码贡献** - 由 Agent 编写并合并的代码行数

### 📁 Repository 和会话洞察
- **各仓库的 AI 代码占比统计**
- **工作类型分类** - Bug 修复、新功能、重构等

### 🔧 其他功能
- **数据筛选** - 支持按团队、用户和日期范围筛选
- **CSV 导出** - 每个图表支持独立导出，也支持一键导出全部数据
- **响应式设计** - 适配各种屏幕尺寸

## 技术栈

### 后端
- **Node.js + Express** - API 服务框架
- **TypeScript** - 类型安全
- **SQLite (better-sqlite3)** - 轻量级数据库
- **date-fns** - 日期处理

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Recharts** - 图表库
- **Lucide React** - 图标库

## 项目结构

```
AgentAnalyse/
├── backend/
│   ├── src/
│   │   ├── index.ts              # 服务入口
│   │   ├── routes/
│   │   │   └── analytics.ts      # API 路由
│   │   ├── services/
│   │   │   └── analyticsService.ts  # 业务逻辑
│   │   └── database/
│   │       ├── schema.ts         # 数据库模型
│   │       └── seed.ts           # 示例数据生成
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # 主应用组件
│   │   ├── main.tsx              # 入口文件
│   │   ├── index.css             # 全局样式
│   │   ├── components/           # UI 组件
│   │   │   ├── Header.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── RepositoryTable.tsx
│   │   │   ├── MessageStats.tsx
│   │   │   └── charts/
│   │   │       ├── TrendChart.tsx
│   │   │       ├── ModelUsageChart.tsx
│   │   │       └── WorkCategoryChart.tsx
│   │   ├── services/
│   │   │   └── api.ts            # API 调用服务
│   │   └── types/
│   │       └── index.ts          # TypeScript 类型定义
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── README.md
```

## 快速开始

### 前置要求
- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 初始化数据库（可选）

生成示例数据用于演示：

```bash
cd backend
npm run seed
```

### 启动开发服务器

```bash
# 启动后端 (端口 3001)
cd backend
npm run dev

# 新终端，启动前端 (端口 3000)
cd frontend
npm run dev
```

访问 http://localhost:3000 查看应用。

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/analytics/overview` | GET | 获取概览统计 |
| `/api/analytics/daily-trend` | GET | 获取每日趋势数据 |
| `/api/analytics/leaderboard` | GET | 获取用户排行榜 |
| `/api/analytics/repositories` | GET | 获取仓库统计 |
| `/api/analytics/work-categories` | GET | 获取工作类型分布 |
| `/api/analytics/model-usage` | GET | 获取模型使用统计 |
| `/api/analytics/teams` | GET | 获取团队列表 |
| `/api/analytics/users` | GET | 获取用户列表 |
| `/api/analytics/export/:type` | GET | 导出 CSV 数据 |

### 筛选参数

所有统计端点支持以下查询参数：
- `teamId` - 团队 ID
- `userId` - 用户 ID
- `startDate` - 开始日期 (YYYY-MM-DD)
- `endDate` - 结束日期 (YYYY-MM-DD)

## 数据库模型

### 主要表结构

- **users** - 用户信息
- **teams** - 团队信息
- **repositories** - 仓库信息
- **agent_sessions** - Agent 会话记录
- **messages** - 消息记录
- **code_edits** - 代码编辑记录
- **tab_completions** - Tab 补全记录
- **pull_requests** - PR 记录
- **daily_stats** - 每日统计汇总

## 构建生产版本

```bash
# 构建后端
cd backend
npm run build

# 构建前端
cd frontend
npm run build
```

## 许可证

MIT

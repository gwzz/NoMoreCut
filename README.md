# NoMoreCut Investment Ledger

NoMoreCut 是一个个人投资账本 MVP，用来记录资产、交易、估值快照和投资周期目标。项目基于 Next.js App Router + Supabase，前端负责看板和录入体验，后端数据由 Supabase Auth、Postgres 与 Row Level Security 承载。

当前版本更像一个“长期复盘控制台”：适合手动维护投资流水、按资产分类查看组合结构，并用快照修正仅靠成本口径带来的估值偏差。

## 功能概览

- 登录与注册：邮箱密码登录，Supabase Auth 维护会话，`/auth/callback` 处理认证回跳。
- 组合看板：展示总资产、本金、现金分红、收益、ROI、资产分类占比、核心/卫星/现金策略拆解和最近交易。
- 交易流水：支持买入、卖出、现金分红；可新增、编辑、删除交易；填写份额和单价时可自动估算金额。
- 统计分析：按年份查看月度资金流、资产分布、收益趋势和投资周期目标进度。
- 账本设置：维护资产分类、资产、目标权重、策略角色、组合估值快照和周期目标。
- 账户管理：维护显示名称，展示当前 Supabase 用户 ID，并支持退出登录。
- 示例数据：通过 `npm run db:seed` 为指定 Supabase 用户重建一套演示账本数据。

## 技术栈

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase Auth / Postgres / SSR / JS Client
- Recharts
- Zod
- ESLint

## 项目结构

```text
src/app                     App Router 页面、认证回调和 API Routes
src/components              页面组件、图表组件、布局组件和表单组件
src/lib                     Supabase 客户端、认证、格式化、校验和常量
src/services                业务服务层与组合计算逻辑
src/types                   前端和服务层共享的领域类型
supabase/schema.sql         Supabase 表结构、索引、外键、触发器和 RLS policy
scripts/seed-supabase.ts    示例数据导入脚本
public                      Logo 与 favicon
```

## 数据与架构

- Supabase Auth 负责用户注册、登录、会话刷新和退出。
- `src/proxy.ts` 会通过 `@supabase/ssr` 刷新服务端会话。
- 页面侧使用 Server Components 拉取数据，交互表单通过 API Routes 写入数据。
- 服务层集中在 `src/services`，避免页面组件直接散落 Supabase 查询。
- API Routes 会先调用 `requireApiUser()`，确保请求来自已登录用户。
- `requireUser()` 会在受保护页面中校验登录态，并在需要时初始化 `UserProfile`。
- 业务表都带有 `userId`，Supabase 端启用 RLS，用户只能访问自己的数据。
- `AssetCategory -> Asset -> Investment` 使用 `id + userId` 复合外键，降低跨用户关联风险。

核心数据表：

- `UserProfile`：用户资料。
- `AssetCategory`：资产分类，例如宽基指数、红利/低波、贵金属、现金类。
- `Asset`：具体资产，包含分类、策略角色、当前估值、目标权重和归档状态。
- `Investment`：交易流水，类型为 `BUY`、`SELL`、`DIVIDEND`。
- `PortfolioSnapshot`：组合估值快照，用来记录某日总资产、本金、收益和 ROI。
- `InvestmentGoal`：周期目标，包含起止日期和目标金额。

## 本地启动

要求：

- Node.js
- npm
- 一个可用的 Supabase 项目

安装依赖并启动开发服务器：

```bash
npm install
cp .env.example .env
npm run dev
```

打开 `http://localhost:3000`。未登录时会进入 `/login`，登录后进入组合看板。

Windows PowerShell 可以用下面的复制命令：

```powershell
Copy-Item .env.example .env
```

## 环境变量

`.env.example` 中包含运行项目所需的变量。复制为 `.env` 后，按你的 Supabase 项目替换：

```bash
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_[YOUR_KEY]"
```

如果需要导入示例数据，再补充：

```bash
SUPABASE_SERVICE_ROLE_KEY="sb_secret_[YOUR_SERVICE_ROLE_KEY]"
SEED_USER_ID="Supabase Auth 用户 UUID"
SEED_USER_EMAIL="user@example.com"
```

注意：`SUPABASE_SERVICE_ROLE_KEY` 只能用于本地脚本或可信服务器环境，不能暴露到浏览器，也不要提交到仓库。

## Supabase 初始化

1. 创建 Supabase 项目。
2. 在 Project Settings -> Data API 复制 Project URL 和 publishable key。
3. 将 URL 和 publishable key 写入 `.env`。
4. 在 Supabase SQL Editor 中执行 `supabase/schema.sql`。
5. 在 Authentication -> URL Configuration 中设置：
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
   - 部署后追加：`https://你的域名/auth/callback`
   - Vercel 预览环境可追加：`https://*.vercel.app/auth/callback`

`supabase/schema.sql` 会创建业务表、索引、复合外键、更新时间触发器和 RLS policy。

## 示例数据

先通过应用注册，或在 Supabase Authentication -> Users 中创建一个用户。拿到用户 UUID 后写入 `.env`：

```bash
SEED_USER_ID="Supabase Auth 用户 UUID"
SEED_USER_EMAIL="user@example.com"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
npm run db:seed
```

seed 脚本会：

- upsert 该用户的 `UserProfile`
- 删除并重建该用户的分类、资产、交易、快照和目标数据
- 不会清理其他用户的数据

## 常用脚本

```bash
npm run dev          # 启动本地开发服务器
npm run build        # 生产构建
npm run start        # 启动生产构建结果
npm run lint         # ESLint 检查
npm run db:seed      # 为指定 Supabase 用户写入示例数据
```

## 页面与接口

主要页面：

- `/login`：登录、注册和产品介绍页。
- `/`：组合看板。
- `/transactions`：交易录入与流水列表。
- `/analytics`：统计与周期分析。
- `/settings`：分类、资产、快照和目标管理。
- `/account`：账户资料与退出登录。

主要 API：

- `/api/dashboard/summary`
- `/api/assets`
- `/api/assets/[id]`
- `/api/categories`
- `/api/categories/[id]`
- `/api/investments`
- `/api/investments/[id]`
- `/api/snapshots`
- `/api/goals`
- `/api/goals/[id]`
- `/api/analytics/allocation`
- `/api/analytics/monthly-cashflow`
- `/api/analytics/profit-trend`
- `/api/account/profile`

## 组合计算口径

- 买入金额和手续费会增加本金。
- 卖出金额扣除手续费后会降低本金。
- 现金分红会进入分红收入，不直接计入买入本金。
- 若资产设置了 `estimatedValue`，资产分布优先使用手动估值。
- 若没有手动估值，则使用交易成本估算资产价值。
- 如果存在组合快照，看板的总资产、本金、收益和 ROI 优先取最新快照。

## Vercel 部署

1. 将仓库导入 Vercel。
2. 在 Vercel Project Settings -> Environment Variables 配置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. 首次部署前，在 Supabase SQL Editor 执行 `supabase/schema.sql`。
4. 保持仓库中的 `vercel.json`，Vercel 会执行：

```bash
npm run vercel-build
```

该命令等价于：

```bash
next build
```

5. 部署完成后，将生产域名的 `/auth/callback` 加入 Supabase Auth Redirect URLs。

## 登录与数据排查

- 登录后仍被重定向到 `/login`：检查 Supabase URL、publishable key 和 Auth Redirect URLs。
- 注册后看不到业务资料：`UserProfile` 会在用户成功登录后由应用初始化。
- 页面提示资料初始化失败：通常是还没有执行 `supabase/schema.sql`。
- 收不到确认邮件：检查 Supabase Auth 邮件配置，生产环境建议配置自有 SMTP。
- 本地可用但线上不可用：确认 Vercel 环境变量已设置并重新部署。
- seed 失败：确认 `SUPABASE_SERVICE_ROLE_KEY`、`SEED_USER_ID` 和 `NEXT_PUBLIC_SUPABASE_URL` 都已填写。

## 当前状态

这是一个 MVP 项目，已经具备完整的个人账本主流程。后续可以继续补充导入/导出、更多图表维度、交易筛选、资产归档视图、测试覆盖和更细的部署检查。

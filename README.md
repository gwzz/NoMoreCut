# NoMoreCut Investment Ledger

个人金融投资账本 MVP。项目使用 Next.js App Router、Supabase Auth、Prisma、Supabase Postgres 和 Recharts，聚焦投资记录、资产看板、周期分析和目标管理。

## 架构

- Supabase Auth 负责邮箱密码注册、登录、会话刷新和退出。
- Prisma 负责业务数据访问，数据库使用 Supabase Postgres。
- 所有业务表都有 `userId`，服务层每次查询都会按当前 Supabase 用户过滤。
- 分类-资产、资产-交易使用 `id + userId` 复合外键，避免跨用户关联。
- Vercel 构建命令使用 `npm run vercel-build`，会先 `prisma migrate deploy` 再构建 Next.js。

## 环境变量

复制 `.env.example` 为 `.env`，并填入 Supabase 项目中的值：

```bash
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_[YOUR_KEY]"
```

`DATABASE_URL` 用 Supabase pooler 连接串；`DIRECT_URL` 用 direct connection，给 Prisma 迁移使用。

## Supabase 设置

1. 创建 Supabase 项目。
2. 在 Project Settings -> Data API 复制 Project URL 和 publishable key。
3. 在 Database -> Connect 复制 connection pooler URL 和 direct connection URL。
4. 在 Authentication -> URL Configuration 设置：
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
   - 部署后再加入 `https://你的域名/auth/callback`
   - Vercel 预览环境可加入 `https://*.vercel.app/auth/callback`

## 本地启动

```bash
npm install
cp .env.example .env
npm run prisma:migrate -- --name init
npm run dev
```

打开 `http://localhost:3000`，未登录会进入 `/login`。

## 示例数据

先在 Supabase Auth 创建或注册一个用户，然后把这个用户的 UUID 写入 `.env`：

```bash
SEED_USER_ID="Supabase Auth 用户 UUID"
SEED_USER_EMAIL="user@example.com"
npm run prisma:seed
```

seed 只会清理并重建该用户的数据，不会删除其他用户的数据。

## Vercel 部署

1. 将项目导入 Vercel。
2. 在 Vercel Project Settings -> Environment Variables 配置 `.env.example` 中的所有变量。
3. 保持仓库中的 `vercel.json`，Vercel 会执行：

```bash
npm run vercel-build
```

该命令等价于：

```bash
prisma generate && prisma migrate deploy && next build
```

4. 首次部署完成后，把生产域名的 `/auth/callback` 加回 Supabase Auth Redirect URLs。

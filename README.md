# NoMoreCut Investment Ledger

个人金融投资账本 MVP。项目使用 Next.js App Router、Supabase Auth、Supabase Postgres、Supabase JS 和 Recharts，聚焦投资记录、资产看板、周期分析和目标管理。

## 架构

- Supabase Auth 负责邮箱密码注册、登录、会话刷新和退出。
- Supabase Postgres 保存所有业务数据，服务层通过 `@supabase/ssr` / `@supabase/supabase-js` 访问数据库。
- 所有业务表都带有 `userId`，数据库启用 Row Level Security，用户只能访问自己的数据。
- 分类-资产、资产-交易使用 `id + userId` 复合外键，避免跨用户关联。
- 构建命令只执行 Next.js 构建，数据库初始化在 Supabase SQL Editor 中完成。

## 环境变量

复制 `.env.example` 为 `.env`，并填入 Supabase 项目中的值：

```bash
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_[YOUR_KEY]"
```

如果要导入示例数据，再补充：

```bash
SUPABASE_SERVICE_ROLE_KEY="sb_secret_[YOUR_SERVICE_ROLE_KEY]"
SEED_USER_ID="Supabase Auth 用户 UUID"
SEED_USER_EMAIL="user@example.com"
```

`SUPABASE_SERVICE_ROLE_KEY` 只能用于本地脚本或可信服务器环境，不能暴露到浏览器。

## Supabase 设置

1. 创建 Supabase 项目。
2. 在 Project Settings -> Data API 复制 Project URL 和 publishable key。
3. 在 Supabase SQL Editor 中执行 `supabase/schema.sql`，创建业务表、索引、外键、更新时间触发器和 RLS policy。
4. 在 Authentication -> URL Configuration 设置：
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
   - 部署后再加入 `https://你的域名/auth/callback`
   - Vercel 预览环境可加入 `https://*.vercel.app/auth/callback`

## 本地启动

```bash
npm install
cp .env.example .env
npm run dev
```

打开 `http://localhost:3000`，未登录会进入 `/login`。

## 示例数据

先在 Supabase Auth 创建或注册一个用户，然后把这个用户的 UUID 写入 `.env`：

```bash
SEED_USER_ID="Supabase Auth 用户 UUID"
SEED_USER_EMAIL="user@example.com"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
npm run db:seed
```

seed 只会清理并重建该用户的业务数据，不会删除其他用户的数据。

## 登录/注册排查

- 确认 Vercel 环境变量里配置了 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`，并且重新部署过。
- 注册账户先出现在 Supabase 的 Authentication -> Users；业务表里的 `UserProfile` 只会在用户确认邮箱并成功登录后创建。
- 在 Supabase Authentication 的 URL Configuration 中，生产域名要加入 `https://你的域名/auth/callback`。
- 如果开启了邮箱确认，注册后必须先点击确认邮件才能登录；测试阶段也可以临时关闭邮箱确认。
- 如果页面提示用户资料初始化失败，通常是还没有在 Supabase SQL Editor 执行 `supabase/schema.sql`。
- 如果收不到确认邮件，检查 Supabase Auth 的邮件发送配置，或改用自己的 SMTP。

## Vercel 部署

1. 将项目导入 Vercel。
2. 在 Vercel Project Settings -> Environment Variables 配置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. 首次部署前，先在 Supabase SQL Editor 执行 `supabase/schema.sql`。
4. 保持仓库中的 `vercel.json`，Vercel 会执行：

```bash
npm run vercel-build
```

该命令等价于：

```bash
next build
```

5. 首次部署完成后，把生产域名的 `/auth/callback` 加回 Supabase Auth Redirect URLs。

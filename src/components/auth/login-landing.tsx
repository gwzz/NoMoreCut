"use client";

import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Clock3,
  DatabaseZap,
  ShieldCheck,
  Star,
  Target,
  WalletCards,
  Zap
} from "lucide-react";
import clsx from "clsx";
import { AuthForm } from "@/components/auth/auth-form";
import { LogoMark } from "@/components/brand/logo-mark";

type LoginLandingProps = {
  initialError?: string;
  initialMessage?: string;
  nextPath: string;
};

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
};

const stats = [
  { label: "资产视图", value: "360°", trend: "+18% clarity" },
  { label: "记账速度", value: "12s", trend: "fast entry" },
  { label: "目标追踪", value: "4.8x", trend: "better focus" },
  { label: "数据隔离", value: "RLS", trend: "Supabase" }
];

const features = [
  {
    title: "组合全景",
    text: "把资产分类、交易流水、估值快照放在同一套暗色控制台里。",
    icon: WalletCards,
    className: "lg:col-span-4 lg:row-span-2"
  },
  {
    title: "目标节奏",
    text: "资金进度和时间进度并排呈现，避免只看收益不看期限。",
    icon: Target,
    className: "lg:col-span-2"
  },
  {
    title: "现金流",
    text: "买入、卖出、分红按月归集，复盘更快。",
    icon: BarChart3,
    className: "lg:col-span-2"
  },
  {
    title: "安全后端",
    text: "Supabase Auth 与 RLS 让每个账户只读写自己的数据。",
    icon: ShieldCheck,
    className: "lg:col-span-2"
  },
  {
    title: "估值快照",
    text: "用手动快照校准真实市值，不被流水成本绑架。",
    icon: Clock3,
    className: "lg:col-span-2"
  },
  {
    title: "低维护",
    text: "无需 Prisma，本地和线上都连接同一套 Supabase API。",
    icon: DatabaseZap,
    className: "lg:col-span-2"
  }
];

const articles = [
  { title: "为什么投资账本需要快照", meta: "Portfolio / 8 min", tone: "cyan" },
  { title: "把交易流水变成月度现金流", meta: "Analytics / 6 min", tone: "emerald" },
  { title: "核心-卫星策略如何落地", meta: "Strategy / 11 min", tone: "violet" }
];

const steps = [
  { title: "创建账户", text: "用邮箱注册并进入自己的独立数据空间。" },
  { title: "录入资产", text: "配置资产分类、目标权重和策略角色。" },
  { title: "持续复盘", text: "记录交易、更新快照、观察收益与目标。" }
];

const benefits = [
  "交易、估值、目标集中在一个界面",
  "不用维护本地数据库或 ORM 迁移",
  "暗色界面适合长时间复盘",
  "账户数据由 Supabase RLS 隔离",
  "支持从成本口径切到快照口径"
];

const testimonials = [
  { quote: "终于不用在好几个表格之间来回找买入记录了。", name: "Rui", role: "ETF 投资者" },
  { quote: "目标进度和时间进度放在一起看，决策会冷静很多。", name: "Ming", role: "长期配置" },
  { quote: "界面很安静，数据密度刚好，适合每周复盘。", name: "Elaine", role: "家庭资产管理" },
  { quote: "Supabase 后端省掉了很多部署和数据库维护。", name: "Han", role: "独立开发者" },
  { quote: "收益曲线、现金流和分类占比在一个控制台里，够用了。", name: "Yu", role: "主动基金用户" }
];

const prices = [
  { name: "Local", price: "¥0", badge: "开发", features: ["本地启动", "连接 Supabase", "基础看板"], highlighted: false },
  { name: "Personal", price: "¥19", badge: "推荐", features: ["多资产追踪", "目标管理", "周期分析", "暗色界面"], highlighted: true },
  { name: "Pro", price: "¥49", badge: "进阶", features: ["高级复盘", "导出数据", "策略模板"], highlighted: false }
];

const faqs = [
  {
    question: "本地开发需要启动数据库吗？",
    answer: "不需要。本地 Next.js 直接连接 Supabase Auth 和 Supabase Postgres。"
  },
  {
    question: "为什么注册后业务表没有 UserProfile？",
    answer: "Auth 用户先出现在 Authentication -> Users；成功登录后应用才会初始化 UserProfile。"
  },
  {
    question: "可以用于生产数据吗？",
    answer: "可以，但建议生产环境开启邮箱确认，配置自有 SMTP，并使用独立 Supabase 项目。"
  },
  {
    question: "是否还依赖 Prisma？",
    answer: "不依赖。当前服务层全部通过 Supabase JS 访问后端数据库。"
  }
];

function SpotlightCard({ children, className }: SpotlightCardProps) {
  function updateSpotlight(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }

  return (
    <article
      className={clsx("spotlight-card rounded-lg border border-white/10 bg-white/[0.045] backdrop-blur-xl", className)}
      onMouseMove={updateSpotlight}
    >
      {children}
    </article>
  );
}

function AvatarStack() {
  const people = ["林", "Z", "M", "A"];

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-3">
        {people.map((person, index) => (
          <span
            key={person}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-950 bg-gradient-to-br from-cyan-200 via-emerald-200 to-violet-200 text-xs font-bold text-slate-950"
            style={{ zIndex: people.length - index }}
          >
            {person}
          </span>
        ))}
      </div>
      <p className="text-sm text-slate-400">被长期投资者用于周度复盘</p>
    </div>
  );
}

function ProductMock() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-[0_28px_100px_rgba(0,0,0,0.48)]">
      <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4">
        <span className="h-3 w-3 rounded-full bg-rose-400" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-300" />
        <span className="ml-3 text-xs font-medium text-slate-500">NoMoreCut.dashboard</span>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-[0.72fr_1fr]">
        <div className="space-y-3">
          {["总资产", "净投入", "收益率"].map((label, index) => (
            <div key={label} className="rounded-md border border-white/10 bg-white/[0.045] p-3">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {index === 0 ? "¥116,000" : index === 1 ? "¥86,017" : "35.28%"}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">收益曲线</p>
            <span className="rounded-full bg-emerald-300/10 px-2 py-1 text-xs text-emerald-200">live</span>
          </div>
          <div className="mock-chart" aria-hidden>
            <span style={{ height: "32%" }} />
            <span style={{ height: "46%" }} />
            <span style={{ height: "42%" }} />
            <span style={{ height: "58%" }} />
            <span style={{ height: "74%" }} />
            <span style={{ height: "66%" }} />
            <span style={{ height: "88%" }} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["CORE", "SATELLITE", "CASH"].map((item) => (
              <span key={item} className="rounded-md border border-white/10 bg-white/[0.04] py-2 text-center text-xs text-slate-300">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniViz() {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_0.72fr]">
      <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
        <div className="flex items-end gap-2">
          {[34, 52, 45, 72, 63, 82, 76, 92].map((height, index) => (
            <span
              key={`${height}-${index}`}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-400/20 to-emerald-200"
              style={{ height }}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Jan</span>
          <span>Apr</span>
          <span>Aug</span>
          <span>Dec</span>
        </div>
      </div>
      <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
        <div className="mx-auto aspect-square w-32 rounded-full bg-[conic-gradient(from_210deg,#67e8f9_0_34%,#a7f3d0_34%_62%,#c4b5fd_62%_84%,#475569_84%_100%)] p-4">
          <div className="h-full w-full rounded-full bg-slate-950" />
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">资产分类占比</p>
      </div>
    </div>
  );
}

function ArticleVisual({ tone }: { tone: string }) {
  return (
    <div className={clsx("article-visual", `article-visual-${tone}`)} aria-hidden>
      <div className="h-full rounded-lg border border-white/10 bg-slate-950/40 p-4">
        <div className="h-2 w-24 rounded-full bg-white/20" />
        <div className="mt-8 grid grid-cols-4 items-end gap-2">
          {[40, 72, 54, 88].map((height, index) => (
            <span key={`${height}-${index}`} className="rounded-sm bg-white/40" style={{ height }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoginLanding({ initialError, initialMessage, nextPath }: LoginLandingProps) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main className="dark-landing min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div className="ambient-mesh" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25" />

      <header className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/login" className="flex items-center gap-3">
          <LogoMark className="h-10 w-10 shadow-[0_0_42px_rgba(103,232,249,0.16)]" />
          <span>
            <span className="block text-sm font-semibold tracking-normal text-white">NoMoreCut</span>
            <span className="block text-xs text-slate-500">Investment Ledger</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-400 md:flex" aria-label="Landing navigation">
          <a href="#features" className="transition hover:text-white">功能</a>
          <a href="#workflow" className="transition hover:text-white">流程</a>
          <a href="#pricing" className="transition hover:text-white">价格</a>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl min-w-0 grid-cols-1 items-center gap-12 overflow-hidden px-4 pb-14 pt-8 sm:px-6 lg:min-h-[780px] lg:grid-cols-[minmax(0,1.12fr)_430px] lg:px-8">
        <div className="min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-none">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-sm font-medium text-cyan-100 shadow-[0_0_60px_rgba(103,232,249,0.14)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </span>
            Supabase 后端已经接入
          </div>

          <h1 className="mt-8 max-w-5xl text-[2.7rem] font-semibold leading-[1.05] tracking-normal text-white sm:text-6xl lg:text-7xl">
            个人投资账本，
            <span className="gradient-text block">
              <span className="block sm:inline">像专业控制台</span>
              <span className="block sm:inline">一样清晰。</span>
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            把资产、交易和目标收进一个清晰的暗色控制台。用 Supabase 托管认证与数据库，本地开发和线上部署保持同一套数据通路。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#auth-panel" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-slate-950 transition hover:scale-[1.02]">
              查看看板
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a href="#workflow" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-white">
              记录交易
              <Zap className="h-4 w-4" aria-hidden />
            </a>
          </div>

          <div className="mt-8">
            <AvatarStack />
          </div>
        </div>

        <div id="auth-panel" className="relative min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-full">
          <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-cyan-400/20 via-transparent to-violet-400/20 blur-2xl" aria-hidden />
          <AuthForm initialError={initialError} initialMessage={initialMessage} nextPath={nextPath} />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <SpotlightCard key={stat.label} className="group p-5 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_24px_90px_rgba(103,232,249,0.08)]">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="gradient-text mt-4 text-6xl font-semibold leading-none lg:text-7xl">{stat.value}</p>
              <span className="mt-5 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                {stat.trend}
              </span>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="self-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200/70">Product detail</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">每个数字都能回到一笔交易。</h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Dashboard 不只展示余额，还把成本、分红、目标、分类和策略角色放在同一套信息层级里，减少复盘时的上下文切换。
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["交易流水", "快照估值", "策略拆解", "目标进度"].map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-white/[0.035] p-4 text-sm font-semibold text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
        <ProductMock />
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200/70">Features</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">一套 bento 控制面，覆盖投资复盘主路径。</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-400">卡片会响应鼠标聚光，重要数据用高对比光线承载，保持暗色界面的精密感。</p>
        </div>

        <div className="grid auto-rows-[minmax(220px,auto)] gap-4 lg:grid-cols-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const hero = index === 0;

            return (
              <SpotlightCard key={feature.title} className={clsx("group p-5 transition hover:-translate-y-1 hover:border-cyan-300/25", feature.className)}>
                <div className="flex h-full flex-col">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{feature.text}</p>
                  {hero ? <MiniViz /> : null}
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Blog</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">复盘杂志架。</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <SpotlightCard key={article.title} className="group overflow-hidden p-3">
              <div className="overflow-hidden rounded-lg">
                <ArticleVisual tone={article.tone} />
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{article.meta}</p>
                <h3 className="mt-3 text-xl font-semibold text-white transition group-hover:text-cyan-100">{article.title}</h3>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section id="workflow" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200/70">How it works</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">三步进入复盘节奏。</h2>
        </div>
        <div className="relative mt-12 grid gap-4 md:grid-cols-3">
          <div className="absolute left-[16.6%] right-[16.6%] top-12 hidden h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent md:block" />
          {steps.map((step, index) => (
            <SpotlightCard key={step.title} className="relative p-6">
              <p className="text-7xl font-semibold leading-none text-white/10 drop-shadow-[0_0_24px_rgba(103,232,249,0.25)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-6 text-2xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{step.text}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.72fr_1fr] lg:px-8">
        <div className="lg:sticky lg:top-10 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200/70">Benefits</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">长期使用时，界面应该少打扰。</h2>
          <p className="mt-5 text-base leading-8 text-slate-300">NoMoreCut 把重复动作收短，把复盘判断放大，让每次打开都更像进入一间安静的交易日志室。</p>
        </div>
        <div className="space-y-4">
          {benefits.map((benefit) => (
            <SpotlightCard key={benefit} className="flex items-start gap-4 p-5 transition hover:border-emerald-300/30">
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-300/10 text-emerald-100">
                <Check className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-lg font-medium text-slate-100">{benefit}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Testimonials</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">来自复盘现场的声音。</h2>
        </div>
        <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
          {testimonials.map((item, index) => (
            <SpotlightCard key={item.name} className="mb-5 break-inside-avoid p-5 transition hover:-translate-y-1">
              <div className="flex gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-current" aria-hidden />
                ))}
              </div>
              <p className={clsx("mt-5 leading-7 text-slate-200", index === 1 ? "text-xl" : "text-base")}>“{item.quote}”</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-200 to-violet-200 text-sm font-bold text-slate-950">
                  {item.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200/70">Pricing</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">从个人账本开始。</h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {prices.map((tier) => (
            <SpotlightCard
              key={tier.name}
              className={clsx(
                "p-6 transition hover:-translate-y-1",
                tier.highlighted ? "border-cyan-300/35 bg-cyan-300/[0.06] shadow-[0_0_110px_rgba(103,232,249,0.14)]" : ""
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-300">{tier.badge}</span>
              </div>
              <p className="mt-8 text-6xl font-semibold text-white">{tier.price}</p>
              <p className="mt-2 text-sm text-slate-500">/ month</p>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-200" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#auth-panel"
                className={clsx(
                  "mt-8 inline-flex h-12 w-full items-center justify-center rounded-md text-sm font-bold transition",
                  tier.highlighted ? "bg-white text-slate-950 hover:scale-[1.01]" : "border border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-300/35"
                )}
              >
                开始使用
              </a>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <section id="faq" className="relative z-10 mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200/70">FAQ</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">常见问题。</h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((faq, index) => {
            const open = openFaq === index;

            return (
              <SpotlightCard key={faq.question} className="overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold text-white"
                  onClick={() => setOpenFaq(open ? -1 : index)}
                >
                  {faq.question}
                  <ChevronDown className={clsx("h-5 w-5 shrink-0 text-slate-500 transition duration-300", open ? "rotate-180 text-cyan-200" : "")} aria-hidden />
                </button>
                <div className={clsx("faq-panel px-5", open ? "max-h-32 pb-5 opacity-100" : "max-h-0 opacity-0")}>
                  <p className="text-sm leading-7 text-slate-400">{faq.answer}</p>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <LogoMark className="h-10 w-10 shadow-[0_0_42px_rgba(103,232,249,0.16)]" />
              <span className="text-lg font-semibold text-white">NoMoreCut</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">一个连接 Supabase 的个人投资账本，用暗色界面承载长期复盘。</p>
          </div>
          {[
            ["产品", "看板", "交易", "统计"],
            ["资源", "文档", "示例数据", "部署"],
            ["社交", "GitHub", "Vercel", "Supabase"]
          ].map(([title, ...links]) => (
            <div key={title}>
              <p className="text-sm font-semibold text-white">{title}</p>
              <div className="mt-4 space-y-3">
                {links.map((item) => (
                  <a key={item} href="#auth-panel" className="block text-sm text-slate-500 transition hover:text-white">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 NoMoreCut. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#faq" className="hover:text-slate-300">Privacy</a>
            <a href="#faq" className="hover:text-slate-300">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.SEED_USER_ID;
const email = process.env.SEED_USER_EMAIL ?? null;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running db:seed.");
}

if (!userId) {
  throw new Error("Set SEED_USER_ID to a Supabase auth.users id before running db:seed.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
});

function nowIso() {
  return new Date().toISOString();
}

function timestamp(date: string) {
  return new Date(date).toISOString();
}

async function run<T>(request: PromiseLike<{ data: T; error: Error | null }>) {
  const { data, error } = await request;

  if (error) {
    throw error;
  }

  return data;
}

async function main() {
  const now = nowIso();

  await run(
    supabase.from("UserProfile").upsert(
      {
        id: userId,
        email,
        displayName: "NoMoreCut Demo",
        updatedAt: now
      },
      { onConflict: "id" }
    )
  );

  await run(supabase.from("Investment").delete().eq("userId", userId));
  await run(supabase.from("PortfolioSnapshot").delete().eq("userId", userId));
  await run(supabase.from("InvestmentGoal").delete().eq("userId", userId));
  await run(supabase.from("Asset").delete().eq("userId", userId));
  await run(supabase.from("AssetCategory").delete().eq("userId", userId));

  const categories = [
    {
      id: randomUUID(),
      userId,
      name: "宽基指数",
      color: "#171717",
      description: "纳斯达克100、标普500、中证A500等长期核心配置",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      userId,
      name: "红利/低波",
      color: "#0f8f5f",
      description: "偏稳健的红利、低波、固收增强类资产",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      userId,
      name: "贵金属",
      color: "#a68145",
      description: "黄金等避险和抗通胀资产",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      userId,
      name: "现金类",
      color: "#737373",
      description: "货币基金、活期现金和待投资资金",
      createdAt: now,
      updatedAt: now
    }
  ];

  await run(supabase.from("AssetCategory").insert(categories));

  const [indexCategory, dividendCategory, metalCategory, cashCategory] = categories;
  const assets = [
    {
      id: randomUUID(),
      userId,
      name: "纳斯达克100ETF",
      symbol: "NASDAQ100",
      categoryId: indexCategory.id,
      strategyRole: "SATELLITE",
      estimatedValue: 36000,
      targetWeight: 0.25,
      note: "进取型卫星仓位，用于长期成长暴露",
      isArchived: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      userId,
      name: "中证A500ETF",
      symbol: "A500",
      categoryId: indexCategory.id,
      strategyRole: "CORE",
      estimatedValue: 32000,
      targetWeight: 0.25,
      note: null,
      isArchived: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      userId,
      name: "红利低波基金",
      symbol: "DIV-LOWVOL",
      categoryId: dividendCategory.id,
      strategyRole: "CORE",
      estimatedValue: 28000,
      targetWeight: 0.3,
      note: null,
      isArchived: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      userId,
      name: "黄金ETF",
      symbol: "GOLD",
      categoryId: metalCategory.id,
      strategyRole: "SATELLITE",
      estimatedValue: 14000,
      targetWeight: 0.15,
      note: null,
      isArchived: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      userId,
      name: "现金储备",
      symbol: "CASH",
      categoryId: cashCategory.id,
      strategyRole: "CASH",
      estimatedValue: 6000,
      targetWeight: 0.05,
      note: null,
      isArchived: false,
      createdAt: now,
      updatedAt: now
    }
  ];

  await run(supabase.from("Asset").insert(assets));

  const [nasdaq, a500, dividend, gold] = assets;
  await run(
    supabase.from("Investment").insert([
      {
        id: randomUUID(),
        userId,
        assetId: a500.id,
        type: "BUY",
        tradeDate: timestamp("2026-01-08"),
        amount: 18000,
        quantity: 18000,
        price: 1,
        fee: 3,
        note: "年度核心仓位启动",
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        userId,
        assetId: dividend.id,
        type: "BUY",
        tradeDate: timestamp("2026-01-16"),
        amount: 22000,
        quantity: 21052.631579,
        price: 1.045,
        fee: 4,
        note: "提高组合防守性",
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        userId,
        assetId: nasdaq.id,
        type: "BUY",
        tradeDate: timestamp("2026-02-12"),
        amount: 24000,
        quantity: 8000,
        price: 3,
        fee: 5,
        note: "卫星仓位分批买入",
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        userId,
        assetId: gold.id,
        type: "BUY",
        tradeDate: timestamp("2026-03-05"),
        amount: 12000,
        quantity: 2400,
        price: 5,
        fee: 2,
        note: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        userId,
        assetId: dividend.id,
        type: "DIVIDEND",
        tradeDate: timestamp("2026-03-25"),
        amount: 360,
        quantity: null,
        price: null,
        fee: null,
        note: "季度现金分红",
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        userId,
        assetId: nasdaq.id,
        type: "BUY",
        tradeDate: timestamp("2026-04-10"),
        amount: 10000,
        quantity: 3125,
        price: 3.2,
        fee: 3,
        note: null,
        createdAt: now,
        updatedAt: now
      }
    ])
  );

  await run(
    supabase.from("PortfolioSnapshot").insert([
      {
        id: randomUUID(),
        userId,
        snapshotDate: timestamp("2026-01-31"),
        totalValue: 40500,
        principal: 40007,
        profit: 493,
        roi: 0.0123,
        note: "1月组合快照",
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        userId,
        snapshotDate: timestamp("2026-02-28"),
        totalValue: 65700,
        principal: 64012,
        profit: 1688,
        roi: 0.0264,
        note: "2月组合快照",
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        userId,
        snapshotDate: timestamp("2026-03-31"),
        totalValue: 79750,
        principal: 76014,
        profit: 4096,
        roi: 0.0539,
        note: "含分红",
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        userId,
        snapshotDate: timestamp("2026-04-30"),
        totalValue: 116000,
        principal: 86017,
        profit: 30343,
        roi: 0.3528,
        note: "MVP 示例数据",
        createdAt: now,
        updatedAt: now
      }
    ])
  );

  await run(
    supabase.from("InvestmentGoal").insert({
      id: randomUUID(),
      userId,
      name: "2030 中期组合目标",
      startDate: timestamp("2026-01-01"),
      targetDate: timestamp("2030-12-31"),
      targetAmount: 500000,
      createdAt: now,
      updatedAt: now
    })
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

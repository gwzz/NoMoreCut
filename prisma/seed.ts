import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = process.env.SEED_USER_ID;
  const email = process.env.SEED_USER_EMAIL;

  if (!userId) {
    throw new Error("Set SEED_USER_ID to a Supabase auth.users id before running prisma:seed.");
  }

  await prisma.userProfile.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      displayName: "NoMoreCut Demo"
    },
    update: {
      email
    }
  });

  await prisma.investment.deleteMany({ where: { userId } });
  await prisma.portfolioSnapshot.deleteMany({ where: { userId } });
  await prisma.investmentGoal.deleteMany({ where: { userId } });
  await prisma.asset.deleteMany({ where: { userId } });
  await prisma.assetCategory.deleteMany({ where: { userId } });

  const categories = await Promise.all([
    prisma.assetCategory.create({
      data: {
        userId,
        name: "宽基指数",
        color: "#171717",
        description: "纳斯达克100、标普500、中证A500等长期核心配置"
      }
    }),
    prisma.assetCategory.create({
      data: {
        userId,
        name: "红利/低波",
        color: "#0f8f5f",
        description: "偏稳健的红利、低波、固收增强类资产"
      }
    }),
    prisma.assetCategory.create({
      data: {
        userId,
        name: "贵金属",
        color: "#a68145",
        description: "黄金等避险和抗通胀资产"
      }
    }),
    prisma.assetCategory.create({
      data: {
        userId,
        name: "现金类",
        color: "#737373",
        description: "货币基金、活期现金和待投资资金"
      }
    })
  ]);

  const [indexCategory, dividendCategory, metalCategory, cashCategory] = categories;

  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        userId,
        name: "纳斯达克100ETF",
        symbol: "NASDAQ100",
        categoryId: indexCategory.id,
        strategyRole: "SATELLITE",
        estimatedValue: new Prisma.Decimal("36000"),
        targetWeight: new Prisma.Decimal("0.25"),
        note: "进取型卫星仓位，用于长期成长暴露"
      }
    }),
    prisma.asset.create({
      data: {
        userId,
        name: "中证A500ETF",
        symbol: "A500",
        categoryId: indexCategory.id,
        strategyRole: "CORE",
        estimatedValue: new Prisma.Decimal("32000"),
        targetWeight: new Prisma.Decimal("0.25")
      }
    }),
    prisma.asset.create({
      data: {
        userId,
        name: "红利低波基金",
        symbol: "DIV-LOWVOL",
        categoryId: dividendCategory.id,
        strategyRole: "CORE",
        estimatedValue: new Prisma.Decimal("28000"),
        targetWeight: new Prisma.Decimal("0.30")
      }
    }),
    prisma.asset.create({
      data: {
        userId,
        name: "黄金ETF",
        symbol: "GOLD",
        categoryId: metalCategory.id,
        strategyRole: "SATELLITE",
        estimatedValue: new Prisma.Decimal("14000"),
        targetWeight: new Prisma.Decimal("0.15")
      }
    }),
    prisma.asset.create({
      data: {
        userId,
        name: "现金储备",
        symbol: "CASH",
        categoryId: cashCategory.id,
        strategyRole: "CASH",
        estimatedValue: new Prisma.Decimal("6000"),
        targetWeight: new Prisma.Decimal("0.05")
      }
    })
  ]);

  const [nasdaq, a500, dividend, gold] = assets;

  await prisma.investment.createMany({
    data: [
      {
        userId,
        assetId: a500.id,
        type: "BUY",
        tradeDate: new Date("2026-01-08"),
        amount: new Prisma.Decimal("18000"),
        quantity: new Prisma.Decimal("18000"),
        price: new Prisma.Decimal("1"),
        fee: new Prisma.Decimal("3"),
        note: "年度核心仓位启动"
      },
      {
        userId,
        assetId: dividend.id,
        type: "BUY",
        tradeDate: new Date("2026-01-16"),
        amount: new Prisma.Decimal("22000"),
        quantity: new Prisma.Decimal("21052.631579"),
        price: new Prisma.Decimal("1.045"),
        fee: new Prisma.Decimal("4"),
        note: "提高组合防守性"
      },
      {
        userId,
        assetId: nasdaq.id,
        type: "BUY",
        tradeDate: new Date("2026-02-12"),
        amount: new Prisma.Decimal("24000"),
        quantity: new Prisma.Decimal("8000"),
        price: new Prisma.Decimal("3"),
        fee: new Prisma.Decimal("5"),
        note: "卫星仓位分批买入"
      },
      {
        userId,
        assetId: gold.id,
        type: "BUY",
        tradeDate: new Date("2026-03-05"),
        amount: new Prisma.Decimal("12000"),
        quantity: new Prisma.Decimal("2400"),
        price: new Prisma.Decimal("5"),
        fee: new Prisma.Decimal("2")
      },
      {
        userId,
        assetId: dividend.id,
        type: "DIVIDEND",
        tradeDate: new Date("2026-03-25"),
        amount: new Prisma.Decimal("360"),
        note: "季度现金分红"
      },
      {
        userId,
        assetId: nasdaq.id,
        type: "BUY",
        tradeDate: new Date("2026-04-10"),
        amount: new Prisma.Decimal("10000"),
        quantity: new Prisma.Decimal("3125"),
        price: new Prisma.Decimal("3.2"),
        fee: new Prisma.Decimal("3")
      }
    ]
  });

  await prisma.portfolioSnapshot.createMany({
    data: [
      {
        userId,
        snapshotDate: new Date("2026-01-31"),
        totalValue: new Prisma.Decimal("40500"),
        principal: new Prisma.Decimal("40007"),
        profit: new Prisma.Decimal("493"),
        roi: new Prisma.Decimal("0.0123"),
        note: "1月组合快照"
      },
      {
        userId,
        snapshotDate: new Date("2026-02-28"),
        totalValue: new Prisma.Decimal("65700"),
        principal: new Prisma.Decimal("64012"),
        profit: new Prisma.Decimal("1688"),
        roi: new Prisma.Decimal("0.0264"),
        note: "2月组合快照"
      },
      {
        userId,
        snapshotDate: new Date("2026-03-31"),
        totalValue: new Prisma.Decimal("79750"),
        principal: new Prisma.Decimal("76014"),
        profit: new Prisma.Decimal("4096"),
        roi: new Prisma.Decimal("0.0539"),
        note: "含分红"
      },
      {
        userId,
        snapshotDate: new Date("2026-04-30"),
        totalValue: new Prisma.Decimal("116000"),
        principal: new Prisma.Decimal("86017"),
        profit: new Prisma.Decimal("30343"),
        roi: new Prisma.Decimal("0.3528"),
        note: "MVP 示例数据"
      }
    ]
  });

  await prisma.investmentGoal.create({
    data: {
      userId,
      name: "2030 中期组合目标",
      startDate: new Date("2026-01-01"),
      targetDate: new Date("2030-12-31"),
      targetAmount: new Prisma.Decimal("500000")
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString(),
    );
    const month = parseInt(
      searchParams.get("month") || (new Date().getMonth() + 1).toString(),
    );

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const trades = await prisma.trade.findMany({
      where: {
        openedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        portfolio: {
          select: { name: true },
        },
      },
      orderBy: { openedAt: "asc" },
    });

    // Group trades by day for heat-map
    const dailyMap: Record<string, { trades: number; profitLoss: number }> = {};
    trades.forEach((trade) => {
      const day = trade.openedAt.toISOString().split("T")[0];
      if (!dailyMap[day]) {
        dailyMap[day] = { trades: 0, profitLoss: 0 };
      }
      dailyMap[day].trades += 1;
      dailyMap[day].profitLoss += trade.profitLoss ?? 0;
    });

    const totalPL = trades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0);
    const totalTrades = trades.length;
    const winTrades = trades.filter((t) => (t.profitLoss ?? 0) > 0).length;
    const lossTrades = trades.filter((t) => (t.profitLoss ?? 0) < 0).length;
    const winRate =
      totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(1) : "0";

    return NextResponse.json({
      trades,
      dailyMap,
      summary: {
        totalPL: parseFloat(totalPL.toFixed(2)),
        totalTrades,
        winTrades,
        lossTrades,
        winRate: parseFloat(winRate),
      },
    });
  } catch (error) {
    console.error("Failed to fetch monthly trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly trades" },
      { status: 500 },
    );
  }
}

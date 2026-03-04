import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const portfolios = await prisma.portfolio.findMany({
      include: {
        trades: {
          select: {
            id: true,
            profitLoss: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = portfolios.map((p) => {
      const totalTrades = p.trades.length;
      const openTrades = p.trades.filter((t) => t.status === "OPEN").length;
      const totalPL = p.trades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0);
      return {
        ...p,
        totalTrades,
        openTrades,
        totalPL,
        trades: undefined,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch portfolios:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolios" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, broker, currency } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Portfolio name is required" },
        { status: 400 },
      );
    }

    const portfolio = await prisma.portfolio.create({
      data: { name, broker, currency },
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error("Failed to create portfolio:", error);
    return NextResponse.json(
      { error: "Failed to create portfolio" },
      { status: 500 },
    );
  }
}

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      portfolioId,
      pair,
      direction,
      lotSize,
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      notes,
      openedAt,
    } = body;

    if (!portfolioId || !pair || !direction || !lotSize || !entryPrice) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: portfolioId, pair, direction, lotSize, entryPrice",
        },
        { status: 400 },
      );
    }

    let profitLoss: number | null = null;
    let status: "OPEN" | "CLOSED" = "OPEN";
    let closedAt: Date | null = null;

    if (exitPrice != null) {
      const multiplier = direction === "BUY" ? 1 : -1;
      profitLoss = parseFloat(
        ((exitPrice - entryPrice) * multiplier * lotSize * 100000).toFixed(2),
      );
      status = "CLOSED";
      closedAt = new Date();
    }

    const trade = await prisma.trade.create({
      data: {
        portfolioId,
        pair: pair.toUpperCase(),
        direction,
        lotSize: parseFloat(lotSize),
        entryPrice: parseFloat(entryPrice),
        exitPrice: exitPrice != null ? parseFloat(exitPrice) : null,
        stopLoss: stopLoss != null ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit != null ? parseFloat(takeProfit) : null,
        profitLoss,
        status,
        closedAt,
        notes,
        openedAt: openedAt ? new Date(openedAt) : new Date(),
      },
    });

    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    console.error("Failed to create trade:", error);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 },
    );
  }
}

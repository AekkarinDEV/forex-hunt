import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      pair,
      direction,
      lotSize,
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      notes,
      status,
      openedAt,
    } = body;

    let profitLoss: number | null = null;
    let closedAt: Date | null = null;

    const effectiveEntry = entryPrice != null ? parseFloat(entryPrice) : null;
    const effectiveExit = exitPrice != null ? parseFloat(exitPrice) : null;
    const effectiveLot = lotSize != null ? parseFloat(lotSize) : null;
    const effectiveDirection = direction;

    if (
      effectiveExit != null &&
      effectiveEntry != null &&
      effectiveLot != null &&
      effectiveDirection
    ) {
      const multiplier = effectiveDirection === "BUY" ? 1 : -1;
      profitLoss = parseFloat(
        (
          (effectiveExit - effectiveEntry) *
          multiplier *
          effectiveLot *
          100000
        ).toFixed(2),
      );
    }

    const tradeStatus =
      status === "CANCELLED"
        ? "CANCELLED"
        : effectiveExit != null
          ? "CLOSED"
          : "OPEN";

    if (tradeStatus === "CLOSED" || tradeStatus === "CANCELLED") {
      closedAt = new Date();
    }

    const trade = await prisma.trade.update({
      where: { id },
      data: {
        ...(pair && { pair: pair.toUpperCase() }),
        ...(direction && { direction }),
        ...(effectiveLot != null && { lotSize: effectiveLot }),
        ...(effectiveEntry != null && { entryPrice: effectiveEntry }),
        exitPrice: effectiveExit,
        ...(stopLoss != null && { stopLoss: parseFloat(stopLoss) }),
        ...(takeProfit != null && { takeProfit: parseFloat(takeProfit) }),
        profitLoss,
        status: tradeStatus,
        closedAt,
        ...(notes !== undefined && { notes }),
        ...(openedAt && { openedAt: new Date(openedAt) }),
      },
    });

    return NextResponse.json(trade);
  } catch (error) {
    console.error("Failed to update trade:", error);
    return NextResponse.json(
      { error: "Failed to update trade" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.trade.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete trade:", error);
    return NextResponse.json(
      { error: "Failed to delete trade" },
      { status: 500 },
    );
  }
}

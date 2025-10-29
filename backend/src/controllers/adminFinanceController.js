const prisma = require("../db/prisma");

// Helper to map transaction status to UI status
function mapStatus(tx) {
  const s = tx.status || "pending";
  if (s === "succeeded") return "paid";
  if (s === "failed") return "failed";
  // pending/processing => pending, later we might mark overdue based on due date
  return "pending";
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isOverdue(tx) {
  if (!tx || tx.status !== "pending") return false;
  const due = addDays(tx.createdAt, 14);
  return new Date() > due;
}

function toCurrency(amountCents) {
  return Math.round((amountCents || 0)) / 100;
}

exports.getAnalytics = async (req, res) => {
  try {
    // Revenue = sum of positive transactions that succeeded
    const [revenueAgg, refundsAgg, counts] = await Promise.all([
      prisma.paymentTransaction.aggregate({
        _sum: { amountCents: true },
        where: { amountCents: { gt: 0 }, status: "succeeded" },
      }),
      prisma.paymentTransaction.aggregate({
        _sum: { amountCents: true },
        where: { amountCents: { lt: 0 }, status: "succeeded" },
      }),
      (async () => {
        const total = await prisma.paymentTransaction.count({ where: { amountCents: { gt: 0 } } });
        const paid = await prisma.paymentTransaction.count({ where: { amountCents: { gt: 0 }, status: "succeeded" } });
        const pendingList = await prisma.paymentTransaction.findMany({ where: { amountCents: { gt: 0 }, status: "pending" }, select: { createdAt: true } });
        const overdue = pendingList.filter((t) => isOverdue({ status: "pending", createdAt: t.createdAt })).length;
        const pending = pendingList.length - overdue;
        return { total, paid, pending, overdue };
      })(),
    ]);

    const totalRevenue = toCurrency(revenueAgg._sum.amountCents || 0);
    const totalRefunds = Math.abs(toCurrency(refundsAgg._sum.amountCents || 0));

    // For now payouts are not modeled; set to 0
    const totalPayouts = 0;
    const netIncome = totalRevenue - totalPayouts - totalRefunds;

    // Average invoice value among paid invoices
    const paidSum = revenueAgg._sum.amountCents || 0;
    const avgInvoice = counts.paid ? toCurrency(paidSum) / counts.paid : 0;

    // Monthly growth: compare last 30d vs previous 30d
    const now = new Date();
    const start30 = addDays(now, -30);
    const prevStart30 = addDays(now, -60);

    const [last30, prev30] = await Promise.all([
      prisma.paymentTransaction.aggregate({
        _sum: { amountCents: true },
        where: {
          amountCents: { gt: 0 },
          status: "succeeded",
          createdAt: { gte: start30 },
        },
      }),
      prisma.paymentTransaction.aggregate({
        _sum: { amountCents: true },
        where: {
          amountCents: { gt: 0 },
          status: "succeeded",
          createdAt: { gte: prevStart30, lt: start30 },
        },
      }),
    ]);

    const lastTotal = toCurrency(last30._sum.amountCents || 0);
    const prevTotal = toCurrency(prev30._sum.amountCents || 0);
    const monthlyGrowth = prevTotal > 0 ? ((lastTotal - prevTotal) / prevTotal) * 100 : null;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalPayouts,
        totalRefunds,
        netIncome,
        monthlyGrowth,
        averageInvoiceValue: avgInvoice,
        totalInvoices: counts.total,
        paidInvoices: counts.paid,
        pendingInvoices: counts.pending,
        overdueInvoices: counts.overdue,
      },
    });
  } catch (e) {
    console.error("adminFinance.getAnalytics", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { status, search, start, end } = req.query;

    // Base where clause: invoices are positive amount transactions
    const where = { amountCents: { gt: 0 } };

    if (status) {
      if (status === "paid") where.status = "succeeded";
      else if (status === "failed") where.status = "failed";
      else if (status === "pending" || status === "overdue") where.status = "pending";
    }

    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt.gte = new Date(start);
      if (end) where.createdAt.lte = new Date(end);
    }

    // Search by student name or description
    const searchFilter = search
      ? {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { student: { firstName: { contains: search, mode: "insensitive" } } },
            { student: { lastName: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const txs = await prisma.paymentTransaction.findMany({
      where: { ...where, ...searchFilter },
      include: {
        student: { select: { firstName: true, lastName: true } },
        package: { select: { subject: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = txs.map((tx) => {
      const baseStatus = mapStatus(tx);
      const overdue = baseStatus === "pending" && isOverdue(tx);
      const uiStatus = overdue ? "overdue" : baseStatus;
      const dueDate = addDays(tx.createdAt, 14);
      return {
        id: tx.id,
        studentName: `${tx.student?.firstName || ""} ${tx.student?.lastName || ""}`.trim(),
        amount: toCurrency(tx.amountCents),
        status: uiStatus,
        dueDate: dueDate.toISOString(),
        paidDate: tx.status === "succeeded" ? tx.updatedAt.toISOString() : null,
        package: tx.package?.subject || tx.description || "",
        paymentMethod: tx.stripePaymentId ? "Card" : "N/A",
      };
    });

    // If client asked for only overdue, filter here
    const finalData = status === "overdue" ? data.filter((d) => d.status === "overdue") : data;

    res.json({ success: true, data: finalData });
  } catch (e) {
    console.error("adminFinance.getInvoices", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getRefunds = async (req, res) => {
  try {
    const { start, end } = req.query;
    const where = { amountCents: { lt: 0 }, status: "succeeded" };
    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt.gte = new Date(start);
      if (end) where.createdAt.lte = new Date(end);
    }

    const rows = await prisma.paymentTransaction.findMany({
      where,
      include: { student: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    });

    const data = rows.map((r) => ({
      id: r.id,
      studentName: `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim(),
      originalAmount: Math.abs(toCurrency(r.amountCents)), // unknown original; using refund amount for display
      refundAmount: Math.abs(toCurrency(r.amountCents)),
      reason: r.description || "Refund",
      status: "completed",
      processedDate: r.updatedAt.toISOString(),
    }));

    res.json({ success: true, data });
  } catch (e) {
    console.error("adminFinance.getRefunds", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Placeholders for future expansions
exports.getPayouts = async (_req, res) => {
  res.json({ success: true, data: [] });
};

exports.getReferrals = async (_req, res) => {
  res.json({ success: true, data: [] });
};

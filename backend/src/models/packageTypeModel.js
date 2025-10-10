// ./src/models/packageTypeModel.js
const prisma = require("../db/prisma"); // if this already exports a PrismaClient instance, keep it

class PackageTypeModel {
   create(payload) {
    const priceStr = String(payload.priceDollars ?? payload.price ?? "").trim();
    const priceNum = Number(priceStr);
    if (!priceStr || Number.isNaN(priceNum)) {
      const e = new Error("Price (in dollars) is required and must be a valid number like 100.05.");
      e.status = 400;
      throw e;
    }
    if (priceNum < 0) {
      const e = new Error("Price cannot be negative.");
      e.status = 400;
      throw e;
    }

    let discountType = payload.discountType ?? null;
    if (discountType === "percentage") discountType = "percent";
    if (discountType && !["fixed", "percent"].includes(discountType)) {
      const e = new Error("discountType must be 'fixed' or 'percent'.");
      e.status = 400;
      throw e;
    }

    const tiers = Array.isArray(payload.eligibleTiers) ? payload.eligibleTiers : [];
    for (const t of tiers) {
      if (!["basic", "premium", "elite"].includes(t)) {
        const e = new Error("eligibleTiers must be any of: basic, premium, elite.");
        e.status = 400;
        throw e;
      }
    }

    const priceCents = Math.round(priceNum * 100);

    // discount fields
    let discountValueDollars = null;
    let discountValueCents = null;
    let discountPercent = null;

    if (discountType === "fixed") {
      const dvStr = String(payload.discountValueDollars ?? payload.discountValue ?? "").trim();
      if (dvStr !== "") {
        const dvNum = Number(dvStr);
        if (Number.isNaN(dvNum) || dvNum < 0) {
          const e = new Error("discountValue (in dollars) must be a non-negative number.");
          e.status = 400;
          throw e;
        }
        discountValueDollars = dvNum.toFixed(2);      // <- STRING for Decimal column
        discountValueCents = Math.round(dvNum * 100);
      }
    } else if (discountType === "percent") {
      if (payload.discountPercent != null) {
        const dp = Math.round(Number(payload.discountPercent));
        if (!Number.isInteger(dp) || dp < 0 || dp > 100) {
          const e = new Error("discountPercent must be an integer between 0 and 100.");
          e.status = 400;
          throw e;
        }
        discountPercent = dp;
      }
    }

    const data = {
      name: payload.name,
      subject: payload.subject,
      hours: Number(payload.hours),

      // Decimal columns as strings
      priceDollars: priceNum.toFixed(2),
      priceCents,

      discountType,
      discountValueDollars,   // string or null
      discountValueCents,     // int or null
      discountPercent,        // int or null

      description: payload.description ?? null,
      validityMonths: payload.validityMonths != null ? Number(payload.validityMonths) : null,
      eligibleTiers: tiers,
      refundable: !!payload.refundable,
      autoRenew: !!payload.autoRenew,
      isActive: payload.isActive !== undefined ? !!payload.isActive : true,
    };

    return prisma.packageType.create({ data });
  }

  findMany({ where = {}, orderBy = { createdAt: "desc" }, skip = 0, take = 50 } = {}) {
    return prisma.packageType.findMany({ where, orderBy, skip, take });
  }

  count(where = {}) {
    return prisma.packageType.count({ where });
  }

  findById(id) {
    return prisma.packageType.findUnique({ where: { id: Number(id) } });
  }

 update(id, payload) {
    const data = {};

    if (payload.name !== undefined) data.name = payload.name;
    if (payload.subject !== undefined) data.subject = payload.subject;
    if (payload.hours !== undefined) data.hours = Number(payload.hours);

    // price updates (accept priceDollars or price)
    if (payload.price !== undefined || payload.priceDollars !== undefined) {
      const p = String(payload.priceDollars ?? payload.price);
      const pNum = Number(p);
      if (!p || Number.isNaN(pNum)) throw new Error("price must be a valid number like 100.05");
      if (pNum < 0) throw new Error("Price cannot be negative.");
      data.priceDollars = pNum.toFixed(2);       // Decimal as string
      data.priceCents = Math.round(pNum * 100);  // keep cents in sync
    }

    // discount type normalization (optional in payload)
    if (payload.discountType !== undefined) {
      data.discountType = payload.discountType === "percentage" ? "percent" : payload.discountType;
      if (data.discountType && !["fixed", "percent"].includes(data.discountType)) {
        throw new Error("discountType must be 'fixed' or 'percent'.");
      }
    }

    // --- Type inference so you don't HAVE to send discountType ---
    // If user sends discountPercent but not type, assume 'percent'
    if (payload.discountPercent !== undefined && data.discountType === undefined && payload.discountType === undefined) {
      data.discountType = "percent";
    }
    // If user sends discountValue(Dollars) but not type, assume 'fixed'
    if ((payload.discountValue !== undefined || payload.discountValueDollars !== undefined) &&
        data.discountType === undefined && payload.discountType === undefined) {
      data.discountType = "fixed";
    }

    // Effective type after any normalization or inference
    const effectiveType = data.discountType ?? payload.discountType ?? undefined;

    // discountValue updates (both dollars & cents kept in sync)
    if (payload.discountValue !== undefined || payload.discountValueDollars !== undefined) {
      const dv = payload.discountValueDollars ?? payload.discountValue;
      if (dv == null || dv === "") {
        data.discountValueDollars = null;
        data.discountValueCents = null;
      } else {
        const dvNum = Number(dv);
        if (Number.isNaN(dvNum) || dvNum < 0) throw new Error("discountValue must be a non-negative number.");
        data.discountValueDollars = dvNum.toFixed(2);     // Decimal as string
        data.discountValueCents = Math.round(dvNum * 100);
      }
    }

    // discountPercent updates
    if (payload.discountPercent !== undefined) {
      const dp = Math.round(Number(payload.discountPercent));
      if (!Number.isInteger(dp) || dp < 0 || dp > 100) {
        throw new Error("discountPercent must be an integer between 0 and 100");
      }
      data.discountPercent = dp;
    }

    // If discountType changed, clear incompatible fields
    if (data.discountType === "percent") {
      // percent discounts shouldn't have fixed value fields
      data.discountValueDollars = null;
      data.discountValueCents = null;
    }
    if (data.discountType === "fixed") {
      // fixed discounts shouldn't have percent field
      data.discountPercent = null;
    }

    if (payload.description !== undefined) data.description = payload.description ?? null;
    if (payload.validityMonths !== undefined) data.validityMonths = Number(payload.validityMonths);
    if (payload.eligibleTiers !== undefined) data.eligibleTiers = payload.eligibleTiers || [];
    if (payload.refundable !== undefined) data.refundable = !!payload.refundable;
    if (payload.autoRenew !== undefined) data.autoRenew = !!payload.autoRenew;
    if (payload.isActive !== undefined) data.isActive = !!payload.isActive;
    if (payload.status !== undefined) data.status = payload.status;

    return prisma.packageType.update({ where: { id: Number(id) }, data });
  }

  retire(id) {
    // keep schema-consistent
    return prisma.packageType.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
  }

  remove(id) {
    return prisma.packageType.delete({ where: { id: Number(id) } });
  }
}

module.exports = new PackageTypeModel();

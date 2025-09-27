const { packageModel } = require("../models");

// Packages
exports.getPackages = async (req, res) => {
  try {
    const rows = await packageModel.listByStudent(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("billing.getPackages", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.purchasePackage = async (req, res) => {
  try {
    const { subject } = req.body || {};
    if (!subject) return res.status(400).json({ success: false, error: "subject is required" });
    const pkg = await packageModel.purchase(req.user.id, subject);
    res.status(201).json({ success: true, data: pkg, note: "Payment mocked for MVP" });
  } catch (e) {
    console.error("billing.purchasePackage", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Transactions & invoices
exports.getPayments = async (req, res) => {
  try {
    const rows = await packageModel.listTransactions(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("billing.getPayments", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const tx = await packageModel.findTransaction(req.user.id, req.params.id);
    if (!tx) return res.status(404).json({ success: false, error: "Invoice not found" });
    // MVP: return JSON "invoice"
    res.json({
      success: true,
      invoice: {
        id: tx.id,
        date: tx.createdAt,
        lineItems: [
          { description: tx.description || tx.type, amountCents: tx.amountCents }
        ],
        totalCents: tx.amountCents,
      }
    });
  } catch (e) {
    console.error("billing.getInvoice", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

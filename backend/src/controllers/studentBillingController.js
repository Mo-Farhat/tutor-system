const { packageModel } = require("../models");
const stripeService = require('../services/stripeService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
    const { subject, payment_method_id } = req.body || {};
    if (!subject) return res.status(400).json({ success: false, error: "subject is required" });
    
    // Package pricing (you may want to make this configurable)
    const packagePrice = 50000; // $500 in cents
    const description = `10-hour tutoring package for ${subject}`;
    
    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent(
      req.user.id,
      packagePrice,
      description,
      { type: 'package', subject }
    );
    
    // Create package record
    const pkg = await prisma.packagePurchase.create({
      data: {
        studentId: req.user.id,
        subject,
        hoursTotal: 10,
        hoursUsed: 0,
        discountCents: 5000, // $50 discount
        status: 'active'
      }
    });
    
    // Create transaction record
    await prisma.paymentTransaction.create({
      data: {
        studentId: req.user.id,
        packageId: pkg.id,
        type: 'package',
        amountCents: packagePrice,
        description,
        status: 'pending',
        stripePaymentId: paymentIntent.id
      }
    });
    
    res.status(201).json({ 
      success: true, 
      data: { 
        package: pkg,
        payment_intent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret
        }
      }
    });
  } catch (e) {
    console.error("billing.purchasePackage", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Create checkout session for package purchase
exports.createPackageCheckout = async (req, res) => {
  try {
    const { subject } = req.body || {};
    if (!subject) return res.status(400).json({ success: false, error: "subject is required" });
    
    const packagePrice = 50000; // $500 in cents
    const lineItems = [{
      price_data: {
        currency: 'aud',
        product_data: {
          name: `10-Hour Tutoring Package - ${subject}`,
          description: '10 hours of one-on-one tutoring with expert tutors'
        },
        unit_amount: packagePrice
      },
      quantity: 1
    }];
    
    const successUrl = `${process.env.FRONTEND_URL}/dashboard/student/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/dashboard/student/packages`;
    
    const session = await stripeService.createCheckoutSession(
      req.user.id,
      lineItems,
      successUrl,
      cancelUrl,
      { type: 'package', subject }
    );
    
    res.json({ 
      success: true, 
      data: { 
        checkout_url: session.url,
        session_id: session.id
      }
    });
  } catch (e) {
    console.error("billing.createPackageCheckout", e);
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

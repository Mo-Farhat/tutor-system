const { packageModel, packageTypeModel } = require("../models");
const stripeService = require('../services/stripeService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get available packages for purchase + student's purchased packages
exports.getPackages = async (req, res) => {
  try {
    // Get available package types for purchase
    const availablePackages = await packageTypeModel.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });

    // Get student's purchased packages with assignment and tutor info
    const purchasedPackages = await prisma.packagePurchase.findMany({
      where: { studentId: Number(req.user.id) },
      include: {
        assignment: {
          include: {
            tutor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { purchasedAt: "desc" },
    });

    // Transform available packages to match frontend expectations
    const transformedAvailable = availablePackages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      subject: pkg.subject,
      hours: pkg.hours,
      price: parseFloat(pkg.priceDollars || 0),
      discount: pkg.discountType === "fixed" 
        ? parseFloat(pkg.discountValueDollars || 0)
        : pkg.discountPercent || 0,
      discountType: pkg.discountType === "percent" ? "percentage" : pkg.discountType || "fixed",
      description: pkg.description,
      validityMonths: pkg.validityMonths,
      refundable: pkg.refundable,
      type: 'available'
    }));

    // Transform purchased packages
    const transformedPurchased = purchasedPackages.map(pkg => ({
      id: pkg.id,
      subject: pkg.subject,
      hoursTotal: pkg.hoursTotal,
      hoursUsed: pkg.hoursUsed,
      status: pkg.status,
      purchasedAt: pkg.purchasedAt,
      type: 'purchased',
      tutorName: pkg.assignment?.tutor ? `${pkg.assignment.tutor.firstName} ${pkg.assignment.tutor.lastName}` : null
    }));

    res.json({ 
      success: true, 
      data: {
        available: transformedAvailable,
        purchased: transformedPurchased
      }
    });
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
    const { packageId, subject, assignmentId, hours } = req.body || {};
    
    let packageData;
    let packagePrice;
    let packageName;
    let packageHours = hours || 10; // Default to 10 hours
    
    if (packageId) {
      // Get specific package from PackageType
      packageData = await packageTypeModel.findById(packageId);
      if (!packageData) {
        return res.status(404).json({ success: false, error: "Package not found" });
      }
      
      // Use package hours if available
      if (packageData.hours) {
        packageHours = packageData.hours;
      }
      
      // Calculate final price with discount
      const basePrice = parseFloat(packageData.priceDollars || 0);
      let finalPrice = basePrice;
      
      if (packageData.discountType === "fixed" && packageData.discountValueDollars) {
        finalPrice = Math.max(0, basePrice - parseFloat(packageData.discountValueDollars));
      } else if (packageData.discountType === "percent" && packageData.discountPercent) {
        finalPrice = basePrice * (1 - packageData.discountPercent / 100);
      }
      
      packagePrice = Math.round(finalPrice * 100); // Convert to cents
      packageName = packageData.name;
    } else if (subject) {
      // Fallback to legacy subject-based pricing
      packagePrice = 50000; // $500 in cents
      packageName = `10-Hour Tutoring Package - ${subject}`;
    } else {
      return res.status(400).json({ success: false, error: "packageId or subject is required" });
    }
    
    // Validate assignmentId if provided
    if (assignmentId) {
      const { studentTutorModel } = require('../models');
      const assignment = await studentTutorModel.findByIdWithTutor(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ success: false, error: "Assignment not found" });
      }
      
      if (assignment.studentId !== req.user.id) {
        return res.status(403).json({ success: false, error: "Assignment does not belong to you" });
      }
    }
    
    const lineItems = [{
      price_data: {
        currency: 'aud',
        product_data: {
          name: packageName,
          description: packageData ? packageData.description : `${packageHours} hours of one-on-one tutoring with expert tutors`
        },
        unit_amount: packagePrice
      },
      quantity: 1
    }];
    
    const successUrl = `${process.env.FRONTEND_URL}/dashboard/student/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/dashboard/student/packages`;
    
    // Include assignmentId and hours in metadata for webhook to credit
    const metadata = { 
      type: 'package', 
      subject: subject || packageData?.subject, 
      packageId: packageId?.toString(),
      hours: packageHours.toString(),
    };
    
    if (assignmentId) {
      metadata.assignmentId = assignmentId.toString();
    }
    
    const session = await stripeService.createCheckoutSession(
      req.user.id,
      lineItems,
      successUrl,
      cancelUrl,
      metadata
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

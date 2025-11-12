const { studentPaymentMethodModel } = require("../models");
const stripeService = require('../services/stripeService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.list = async (req, res) => {
  try {
    const rows = await prisma.studentPaymentMethod.findMany({
      where: { studentId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("pm.list", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Create payment method setup intent
exports.createSetupIntent = async (req, res) => {
  try {
    console.log('🚀 createSetupIntent called for user:', req.user?.id);
    const customer = await stripeService.getOrCreateCustomer(req.user.id);
    console.log('👤 Customer created/retrieved:', customer.id);
    
    const setupIntent = await require('stripe')(process.env.STRIPE_SECRET_KEY).setupIntents.create({
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true
      },
      usage: 'off_session'
    });

    console.log('✅ Setup intent created:', setupIntent.id);
    
    res.json({ 
      success: true, 
      data: { 
        client_secret: setupIntent.client_secret,
        setup_intent_id: setupIntent.id 
      } 
    });
  } catch (e) {
    console.error("pm.createSetupIntent", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Attach payment method after setup intent confirmation
exports.attachPaymentMethod = async (req, res) => {
  try {
    const { payment_method_id } = req.body;
    
    if (!payment_method_id) {
      return res.status(400).json({ success: false, error: "payment_method_id is required" });
    }

    const paymentMethod = await stripeService.attachPaymentMethod(req.user.id, payment_method_id);
    
    // Update pipeline for all tutors when payment method is added
    try {
      const lessonPipelineService = require('../services/lessonPipelineService');
      await lessonPipelineService.updatePipelineOnPaymentMethodAdded(req.user.id);
      console.log('Pipeline updated for student payment method addition');
    } catch (pipelineError) {
      // Log but don't fail the payment method attachment
      console.error('Failed to update pipeline:', pipelineError);
    }
    
    res.status(201).json({ success: true, data: paymentMethod });
  } catch (e) {
    console.error("pm.attachPaymentMethod", e);
    res.status(500).json({ success: false, error: e.message || "Internal server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const paymentMethod = await prisma.studentPaymentMethod.findFirst({
      where: { 
        id: Number(req.params.id),
        studentId: req.user.id 
      }
    });

    if (!paymentMethod) {
      return res.status(404).json({ success: false, error: "Payment method not found" });
    }

    if (paymentMethod.stripePaymentMethodId) {
      await stripeService.detachPaymentMethod(req.user.id, paymentMethod.stripePaymentMethodId);
    } else {
      // Legacy payment method without Stripe ID
      await prisma.studentPaymentMethod.delete({
        where: { id: Number(req.params.id) }
      });
    }
    
    res.json({ success: true });
  } catch (e) {
    console.error("pm.remove", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.setDefault = async (req, res) => {
  try {
    const paymentMethod = await prisma.studentPaymentMethod.findFirst({
      where: { 
        id: Number(req.params.id),
        studentId: req.user.id 
      }
    });

    if (!paymentMethod) {
      return res.status(404).json({ success: false, error: "Payment method not found" });
    }

    if (paymentMethod.stripePaymentMethodId) {
      await stripeService.setDefaultPaymentMethod(req.user.id, paymentMethod.stripePaymentMethodId);
    } else {
      // Legacy payment method - just update database
      await prisma.studentPaymentMethod.updateMany({
        where: { studentId: req.user.id },
        data: { isDefault: false }
      });
      
      await prisma.studentPaymentMethod.update({
        where: { id: Number(req.params.id) },
        data: { isDefault: true }
      });
    }
    
    res.json({ success: true });
  } catch (e) {
    console.error("pm.setDefault", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// TEMPORARY HARDCODED KEYS FOR DEBUGGING - REMOVE AFTER FIXING!
const HARDCODED_STRIPE_SECRET_KEY = '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';

// FORCE HARDCODED KEY - ignoring env var for debugging
// const stripeKey = process.env.STRIPE_SECRET_KEY || HARDCODED_STRIPE_SECRET_KEY;
const stripeKey = HARDCODED_STRIPE_SECRET_KEY;

console.log(`✅ Stripe initialized with HARDCODED LIVE key (${stripeKey.substring(0, 12)}...)`);

const stripe = new Stripe(stripeKey);

class StripeService {
  
  // Customer Management
  async createCustomer(userId, email, name) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { userId: userId.toString() }
      });

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id }
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  async getOrCreateCustomer(userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      if (user.stripeCustomerId) {
        return await stripe.customers.retrieve(user.stripeCustomerId);
      }
      
      return await this.createCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
    } catch (error) {
      console.error('Error getting or creating customer:', error);
      throw error;
    }
  }

  // Payment Method Management
  async attachPaymentMethod(userId, paymentMethodId) {
    try {
      const customer = await this.getOrCreateCustomer(userId);
      
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id
      });

      // Save to database
      const existingMethods = await prisma.studentPaymentMethod.count({
        where: { studentId: userId }
      });

      await prisma.studentPaymentMethod.create({
        data: {
          studentId: userId,
          type: paymentMethod.type === 'card' ? 'card' : 'paypal',
          brand: paymentMethod.card?.brand || null,
          last4: paymentMethod.card?.last4 || null,
          billingName: paymentMethod.billing_details?.name || null,
          stripePaymentMethodId: paymentMethodId,
          isDefault: existingMethods === 0 // First payment method is default
        }
      });

      return paymentMethod;
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  }

  async detachPaymentMethod(userId, paymentMethodId) {
    try {
      // Remove from Stripe
      await stripe.paymentMethods.detach(paymentMethodId);
      
      // Remove from database
      const deletedMethod = await prisma.studentPaymentMethod.deleteMany({
        where: {
          studentId: userId,
          stripePaymentMethodId: paymentMethodId
        }
      });

      // If this was the default method, set another as default
      if (deletedMethod.count > 0) {
        const firstMethod = await prisma.studentPaymentMethod.findFirst({
          where: { studentId: userId }
        });
        
        if (firstMethod) {
          await prisma.studentPaymentMethod.update({
            where: { id: firstMethod.id },
            data: { isDefault: true }
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(userId, paymentMethodId) {
    try {
      // Unset all defaults for this user
      await prisma.studentPaymentMethod.updateMany({
        where: { studentId: userId },
        data: { isDefault: false }
      });

      // Set new default
      await prisma.studentPaymentMethod.updateMany({
        where: {
          studentId: userId,
          stripePaymentMethodId: paymentMethodId
        },
        data: { isDefault: true }
      });

      return { success: true };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  // Payment Processing
  async createPaymentIntent(userId, amountCents, description, metadata = {}) {
    try {
      const customer = await this.getOrCreateCustomer(userId);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'aud',
        customer: customer.id,
        description,
        metadata: {
          userId: userId.toString(),
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async createCheckoutSession(userId, lineItems, successUrl, cancelUrl, metadata = {}) {
    try {
      const customer = await this.getOrCreateCustomer(userId);
      
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId.toString(),
          ...metadata
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Webhook Processing
  async processWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutComplete(event.data.object);
          break;
        case 'setup_intent.created':
        case 'setup_intent.succeeded':
          console.log(`✅ Setup intent event: ${event.type}`);
          // Setup intents are handled on the frontend, no backend action needed
          break;
        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
      throw error;
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    const userId = parseInt(paymentIntent.metadata.userId);
    
    // Update transaction status
    await prisma.paymentTransaction.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: 'succeeded' }
    });

    // Add any additional success logic (e.g., activate lesson package)
  }

  async handlePaymentFailure(paymentIntent) {
    const userId = parseInt(paymentIntent.metadata.userId);
    
    // Update transaction status
    await prisma.paymentTransaction.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: 'failed' }
    });

    // Add any additional failure logic
  }

  async handleCheckoutComplete(session) {
    const userId = parseInt(session.metadata.userId);
    const sessionType = session.metadata.type;
    const assignmentId = session.metadata.assignmentId ? parseInt(session.metadata.assignmentId) : null;
    const hours = session.metadata.hours ? parseFloat(session.metadata.hours) : null;
    
    // Update transaction status
    await prisma.paymentTransaction.updateMany({
      where: { stripeSessionId: session.id },
      data: { status: 'succeeded' }
    });

    // If this is a package purchase, create records and credit hours
    if (sessionType === 'package') {
      const { studentTutorModel } = require('../models');
      
      try {
        const hours = session.metadata.hours ? parseFloat(session.metadata.hours) : 10; // Default to 10 hours
        
        // 1. Create PackagePurchase record
        const pkg = await prisma.packagePurchase.create({
          data: {
            studentId: userId,
            assignmentId: assignmentId || null,
            subject: session.metadata.subject || 'Tutoring',
            hoursTotal: Math.round(hours),
            hoursUsed: 0,
            status: 'active',
            purchasedAt: new Date()
          }
        });
        console.log(`✅ Created PackagePurchase record: ${pkg.id}`);

        // 2. Create PaymentTransaction record
        await prisma.paymentTransaction.create({
          data: {
            studentId: userId,
            packageId: pkg.id,
            type: 'package',
            amountCents: session.amount_total || 0,
            description: `Purchase of ${hours} hours package`,
            status: 'succeeded',
            stripeSessionId: session.id,
            stripePaymentId: session.payment_intent
          }
        });
        console.log(`✅ Created PaymentTransaction record for package ${pkg.id}`);

        // 3. Credit hours to the assignment bucket (only if assignmentId provided)
        if (assignmentId) {
          await studentTutorModel.creditHours(assignmentId, hours);
          console.log(`✅ Credited ${hours} hours to assignment ${assignmentId} for user ${userId}`);
        }
        
        // 4. Send notification to student
        const notificationService = require('./notificationService');
        await notificationService.createNotification(
          userId,
          'payment_confirmation',
          'Package Purchased Successfully',
          `Your ${hours}-hour tutoring package has been activated.`,
          'medium',
          '/dashboard/student/packages',
          { assignmentId, hours, packageId: pkg.id }
        );
      } catch (e) {
        console.error('Error processing package purchase:', e);
      }
    }
  }

  // Subscription Management (for recurring lessons)
  async createSubscription(userId, priceId, metadata = {}) {
    try {
      const customer = await this.getOrCreateCustomer(userId);
      
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        metadata: {
          userId: userId.toString(),
          ...metadata
        }
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Refunds
  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason
      });

      // Create refund transaction record
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const userId = parseInt(paymentIntent.metadata.userId);

      await prisma.paymentTransaction.create({
        data: {
          studentId: userId,
          type: 'refund',
          amountCents: -(refund.amount),
          description: `Refund for ${paymentIntentId}`,
          status: 'succeeded',
          stripePaymentId: refund.id
        }
      });

      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  // Stripe Connect (Tutor Payouts)
  async createConnectAccount(userId, email) {
    try {
      console.log(`Creating Stripe Connect account for user ${userId} with email ${email}`);
      
      const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: { userId: userId.toString() }
      });

      console.log(`Successfully created Stripe Connect account: ${account.id}`);

      // Update tutor profile with account ID
      await prisma.tutorProfile.update({
        where: { userId },
        data: { stripeConnectAccountId: account.id }
      });

      return account;
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      console.error('Stripe Error Details:', {
        type: error.type,
        code: error.code,
        message: error.message,
        raw: error.raw
      });
      throw error;
    }
  }

  async createAccountLink(stripeAccountId, returnUrl, refreshUrl) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      console.error('Error creating Stripe account link:', error);
      throw error;
    }
  }

  async getAccount(stripeAccountId) {
    try {
      return await stripe.accounts.retrieve(stripeAccountId);
    } catch (error) {
      console.error('Error retrieving Stripe account:', error);
      throw error;
    }
  }

  async createTransfer(stripeAccountId, amountCents, description, metadata = {}) {
    try {
      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: 'aud',
        destination: stripeAccountId,
        description,
        metadata
      });

      return transfer;
    } catch (error) {
      console.error('Error creating Stripe transfer:', error);
      throw error;
    }
  }

  // Utility Methods
  constructWebhookEvent(body, signature) {
    // TEMPORARY HARDCODED WEBHOOK SECRET - REMOVE AFTER FIXING!
    const HARDCODED_WEBHOOK_SECRET = 'whsec_G0IG6MWU0C2DKRPdniy1aeYgNJg7MWEc';
    // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const webhookSecret = HARDCODED_WEBHOOK_SECRET;
    
    return stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  }
}

module.exports = new StripeService();
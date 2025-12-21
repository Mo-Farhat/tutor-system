const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    // If this is a package purchase with an assignment, credit the hours
    if (sessionType === 'package' && assignmentId && hours) {
      const { studentTutorModel } = require('../models');
      
      try {
        // Credit hours to the assignment bucket
        await studentTutorModel.creditHours(assignmentId, hours);
        console.log(`✅ Credited ${hours} hours to assignment ${assignmentId} for user ${userId}`);
        
        // Send notification to student
        const notificationService = require('./notificationService');
        await notificationService.createNotification(
          userId,
          'payment_confirmation',
          'Hours credited to your account',
          `${hours} hours have been added to your tutoring bucket.`,
          'medium',
          '/dashboard/student/packages',
          { assignmentId, hours }
        );
      } catch (e) {
        console.error('Error crediting hours to assignment:', e);
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

  // Utility Methods
  constructWebhookEvent(body, signature) {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }
}

module.exports = new StripeService();
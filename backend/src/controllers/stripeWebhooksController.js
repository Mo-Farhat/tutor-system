const stripeService = require('../services/stripeService');

exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    // Construct the event using raw body
    const event = stripeService.constructWebhookEvent(req.body, signature);
    
    console.log('Received Stripe webhook event:', event.type);
    
    // Process the event
    await stripeService.processWebhookEvent(event);
    
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
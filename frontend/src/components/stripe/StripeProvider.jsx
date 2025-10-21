import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripeProvider = ({ children, clientSecret, options = {} }) => {
  const elementsOptions = {
    ...options
  };
  
  // Add clientSecret if provided
  if (clientSecret) {
    elementsOptions.clientSecret = clientSecret;
  }
  
  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {children}
    </Elements>
  );
};

export default StripeProvider;

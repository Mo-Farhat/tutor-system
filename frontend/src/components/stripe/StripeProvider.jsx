import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51PATyjJrxq55GyAkVSelz0QhKpMZZ1gIn5JVHHtTyW3Zv7YczdVyafGgHxwUyfAlSawrOJq9acbl0sCtVidqer6n00r3lfpDyp');

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

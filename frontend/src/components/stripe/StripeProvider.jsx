import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51PATyjJrxq55GyAkRtJ8gcncUpPAAnvY6a5US65kOKsTZNwkXds6zi9fXiDhwMRIISlkKBpzrIdewY2b9PRBOPmT00ZN6lgdJI');

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

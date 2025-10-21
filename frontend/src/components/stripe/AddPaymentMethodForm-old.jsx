import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import authService from '../../services/authService';
import StripeProvider from './StripeProvider';

// Inner form component that uses Stripe hooks
const PaymentForm = ({ clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    try {
      // Confirm the setup intent
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/student/payment-methods`,
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('Setup failed:', error);
        onError?.(error.message || 'Payment setup failed');
        setIsLoading(false);
        return;
      }

      // If setup was successful, attach the payment method
      if (setupIntent.status === 'succeeded') {
        const response = await authService.post('/student/payment-methods/attach', {
          payment_method_id: setupIntent.payment_method
        });

        if (response.data.success) {
          onSuccess?.(response.data.data);
        } else {
          onError?.(response.data.error || 'Failed to save payment method');
        }
      }
    } catch (err) {
      console.error('Error in payment setup:', err);
      onError?.(err.message || 'Payment setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="mb-4">
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading || !stripe || !elements}
        className="btn btn-primary w-100"
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Adding Payment Method...
          </>
        ) : (
          'Add Payment Method'
        )}
      </button>
    </form>
  );
};

export default AddPaymentMethodForm;
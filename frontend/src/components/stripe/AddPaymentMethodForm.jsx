import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import authService from '../../services/authService';
import StripeProvider from './StripeProvider';

// Inner form component that uses Stripe hooks
const PaymentForm = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
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
        console.log('🎉 Setup intent succeeded, attaching payment method...');
        const response = await authService.post('/student/payment-methods/attach', {
          payment_method_id: setupIntent.payment_method
        });

        if (response.success) {
          onSuccess?.(response.data);
        } else {
          onError?.(response.error || 'Failed to save payment method');
        }
      }
    } catch (err) {
      console.error('Error in payment setup:', err);
      onError?.(err.message || 'Payment setup failed');
    } finally {
      setIsLoading(false);
    }
  };

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

// Main component that fetches clientSecret and provides Stripe context
const AddPaymentMethodForm = ({ onSuccess, onError }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoadingSetupIntent, setIsLoadingSetupIntent] = useState(true);

  useEffect(() => {
    const createSetupIntent = async () => {
      try {
        console.log('🚀 Creating setup intent...');
        const response = await authService.post('/student/payment-methods/setup-intent');
        console.log('📋 Setup intent response:', response);
        
        if (response.success) {
          console.log('✅ Setup intent created successfully');
          setClientSecret(response.data.client_secret);
        } else {
          console.error('❌ Setup intent creation failed:', response);
          onError?.(response.error || 'Failed to create setup intent');
        }
      } catch (error) {
        console.error('💥 Error creating setup intent:', error);
        onError?.(error.message || 'Failed to initialize payment form');
      } finally {
        setIsLoadingSetupIntent(false);
      }
    };

    createSetupIntent();
  }, [onError]);

  if (isLoadingSetupIntent) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 small text-muted">Initializing secure payment form...</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-circle me-2"></i>
        Failed to initialize payment form. Please try again.
      </div>
    );
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <PaymentForm 
        onSuccess={onSuccess}
        onError={onError}
      />
    </StripeProvider>
  );
};

export default AddPaymentMethodForm;
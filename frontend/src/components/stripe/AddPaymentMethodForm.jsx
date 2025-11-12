import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import authService from '../../services/authService';
import StripeProvider from './StripeProvider';

// Inner form component that uses Stripe hooks
const PaymentForm = ({ onSuccess, onError, onResetRequired }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || isLoading || hasSubmitted) {
      return;
    }

    setIsLoading(true);
    setHasSubmitted(true);

    try {
      // Validate form elements first
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error('Form validation error:', submitError);
        onError?.(submitError.message || 'Please check your payment details');
        setIsLoading(false);
        setHasSubmitted(false);
        return;
      }

      // Confirm the setup intent
      const { error, setupIntent: confirmedSetupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/student/payment-methods`,
        },
        redirect: 'if_required'
      });

      if (error) {
        // Handle specific error types
        if (error.code === 'setup_intent_unexpected_state') {
          console.warn('⚠️ Setup intent in unexpected state:', error);
          // Setup intent is in an invalid state, need to refresh the form
          onError?.('Refreshing payment form... Please wait a moment and try again.');
          // Signal parent to reset and create a new setup intent
          // Small delay to allow error message to display
          setTimeout(() => {
            if (onResetRequired) {
              onResetRequired();
            }
          }, 500);
          setIsLoading(false);
          setHasSubmitted(false);
          return;
        }

        if (error.code === 'setup_intent_authentication_failure') {
          console.error('🔒 Authentication failed:', error);
          onError?.(error.message || 'Payment authentication failed. Please verify your payment details.');
          setIsLoading(false);
          setHasSubmitted(false);
          return;
        }

        if (error.type === 'validation_error') {
          console.error('❌ Validation error:', error);
          onError?.(error.message || 'Please check your payment details and try again.');
          setIsLoading(false);
          setHasSubmitted(false);
          return;
        }

        // Generic error handling
        console.error('❌ Setup failed:', error);
        onError?.(error.message || 'Payment setup failed. Please try again.');
        setIsLoading(false);
        setHasSubmitted(false);
        return;
      }

      // If setup was successful, attach the payment method
      if (confirmedSetupIntent && confirmedSetupIntent.status === 'succeeded') {
        console.log('🎉 Setup intent succeeded, attaching payment method...');
        const response = await authService.post('/student/payment-methods/attach', {
          payment_method_id: confirmedSetupIntent.payment_method
        });

        if (response.success) {
          onSuccess?.(response.data);
        } else {
          onError?.(response.error || 'Failed to save payment method');
          setHasSubmitted(false);
        }
      } else if (confirmedSetupIntent) {
        // Setup intent is in a different state (processing, requires_action, etc.)
        console.log('ℹ️ Setup intent status:', confirmedSetupIntent.status);
        if (confirmedSetupIntent.status === 'processing') {
          onError?.('Payment method is being processed. Please wait a moment and refresh.');
        } else if (confirmedSetupIntent.status === 'requires_action') {
          // Stripe will handle 3D Secure authentication automatically
          console.log('🔐 Requires action (3D Secure):', confirmedSetupIntent);
        } else {
          onError?.(`Unexpected setup intent status: ${confirmedSetupIntent.status}`);
        }
        setHasSubmitted(false);
      }
    } catch (err) {
      console.error('💥 Error in payment setup:', err);
      // Handle network errors and other exceptions
      if (err.message && err.message.includes('network')) {
        onError?.('Network error. Please check your connection and try again.');
      } else {
        onError?.(err.message || 'Payment setup failed. Please try again.');
      }
      setHasSubmitted(false);
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
  const [retryKey, setRetryKey] = useState(0); // Key to force re-render of StripeProvider

  const createSetupIntent = async () => {
    try {
      setIsLoadingSetupIntent(true);
      console.log('🚀 Creating setup intent...');
      const response = await authService.post('/student/payment-methods/setup-intent');
      console.log('📋 Setup intent response:', response);
      
      if (response.success) {
        console.log('✅ Setup intent created successfully');
        setClientSecret(response.data.client_secret);
        setRetryKey(prev => prev + 1); // Force re-render with new client secret
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

  useEffect(() => {
    createSetupIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetRequired = () => {
    console.log('🔄 Resetting payment form with new setup intent...');
    // Clear current client secret and create a new one
    setClientSecret('');
    createSetupIntent();
  };

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
      <div className="alert alert-warning">
        <i className="fas fa-exclamation-triangle me-2"></i>
        <div>
          <p className="mb-2">Failed to initialize payment form.</p>
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={createSetupIntent}
          >
            <i className="fas fa-redo me-1"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <StripeProvider key={retryKey} clientSecret={clientSecret}>
      <PaymentForm 
        onSuccess={onSuccess}
        onError={onError}
        onResetRequired={handleResetRequired}
      />
    </StripeProvider>
  );
};

export default AddPaymentMethodForm;
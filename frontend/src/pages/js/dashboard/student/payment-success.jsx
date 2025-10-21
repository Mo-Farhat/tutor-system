import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as Snippets from '../../../../components/dashboards/student/snippets/snippets-index';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard/student/payment-history');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToDashboard = () => {
    navigate('/dashboard/student/payment-history');
  };

  const handleGoToPaymentMethods = () => {
    navigate('/dashboard/student/payment-methods');
  };

  return (
    <div className="student-payment-success-page">
      <div className="student-payment-methods-nav-bar">
        <Snippets.StudentNavbar />
      </div>
      <div className="student-payment-methods-content" style={{ padding: '2rem' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body text-center p-5">
                  {/* Success Icon */}
                  <div className="mb-4">
                    <div 
                      className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className="fas fa-check text-white" style={{ fontSize: '40px' }}></i>
                    </div>
                  </div>

                  {/* Success Message */}
                  <h2 className="mb-3">Payment Successful!</h2>
                  <p className="text-muted mb-4">
                    Your tutoring package has been purchased successfully. 
                    You'll receive a confirmation email shortly.
                  </p>

                  {/* Session ID (for reference) */}
                  {searchParams.get('session_id') && (
                    <div className="alert alert-light small mb-4">
                      <strong>Transaction ID:</strong>
                      <br />
                      <code className="text-muted">{searchParams.get('session_id')}</code>
                    </div>
                  )}

                  {/* Auto-redirect notice */}
                  <div className="alert alert-info mb-4">
                    <i className="fas fa-info-circle me-2"></i>
                    Redirecting to your dashboard in <strong>{countdown}</strong> seconds...
                  </div>

                  {/* Action Buttons */}
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={handleGoToDashboard}
                    >
                      <i className="fas fa-chart-line me-2"></i>
                      View Payment History
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={handleGoToPaymentMethods}
                    >
                      <i className="fas fa-credit-card me-2"></i>
                      Manage Payment Methods
                    </button>
                  </div>

                  {/* Next Steps */}
                  <div className="mt-4 pt-4 border-top text-start">
                    <h6 className="mb-3">What's Next?</h6>
                    <ul className="text-muted small">
                      <li className="mb-2">Your package hours are now available for booking lessons</li>
                      <li className="mb-2">Check your email for the payment receipt</li>
                      <li className="mb-2">Contact your tutor to schedule your first lesson</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
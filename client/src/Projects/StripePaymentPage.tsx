import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import styles from './StripePaymentPage.module.css';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe('your_publishable_key_here');

interface StripePaymentPageProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripePaymentPage: React.FC<StripePaymentPageProps> = ({
  amount,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className={styles.paymentContainer}>
      <h2>Complete Payment</h2>
      <p>Amount to pay: ${amount}</p>
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.buttonContainer}>
          <button
            type="submit"
            disabled={!stripe || processing}
            className={styles.payButton}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StripePaymentPage;

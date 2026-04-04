import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';
import { supabase } from '../lib/supabase';
import { stripePromise } from '../lib/stripe';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { showSuccess, showError } from '../components/ui/Toast';

const CheckoutForm = ({ onSubscribe }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });

    if (error) {
      setMessage(error.message);
      showError(error.message);
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      showSuccess('Card verified! Welcome to GoFuel Pro.');
      onSubscribe();
    } else {
      setMessage('Verification status: ' + paymentIntent.status);
      showError('Verification status: ' + paymentIntent.status);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '32px' }}>
        <PaymentElement id="payment-element" />
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading || !stripe || !elements}
        style={{
          width: '100%', padding: '20px', borderRadius: '16px', background: '#00C2CB',
          color: 'white', border: 'none', fontSize: '18px', fontWeight: '800', cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 24px rgba(0, 194, 203, 0.4)`
        }}
      >
        {isLoading ? 'Processing...' : 'Start Free Trial'}
      </motion.button>
      {message && <div style={{ color: 'red', marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>{message}</div>}
    </form>
  );
};

const PaywallCheckout = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { membershipIntent, setMembershipIntent } = usePayment();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);

  const colors = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    primary: '#00C2CB',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
  };

  useEffect(() => {
    // If we already have a pre-fetched secret from the context, use it immediately
    if (membershipIntent.clientSecret) {
      setClientSecret(membershipIntent.clientSecret);
      return;
    }

    // Fallback if prefetch wasn't triggered or failed
    fetch('https://ugqjyfgcosjajazsdydw.supabase.co/functions/v1/create-payment-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ amount: 0.50 }),
    })
    .then((res) => {
        if (!res.ok) {
            return res.json().then(json => Promise.reject(json));
        }
        return res.json();
    })
    .then((data) => {
        setClientSecret(data.clientSecret);
        // Sync back to context just in case
        setMembershipIntent(prev => ({ ...prev, clientSecret: data.clientSecret, amount: data.amount }));
    })
    .catch((err) => {
        console.error('Error fetching payment intent:', err);
        setError(err.error || 'Failed to initialize secure checkout');
    });
  }, [membershipIntent.clientSecret, setMembershipIntent]);

  const { user, refreshProfile } = useAuth();

  const handleSubscribe = async () => {
    try {
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: true,
            is_gofuel_pro: true 
          })
          .eq('id', user.id);
        
        await refreshProfile();
      }
      navigate('/success');
    } catch (err) {
      console.error('Error updating subscription:', err);
      navigate('/success'); // Fallback
    }
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', position: 'relative' }}>
          <button 
            onClick={() => navigate('/paywall')} 
            type="button"
            style={{ background: 'transparent', border: 'none', color: colors.text, cursor: 'pointer', padding: '8px', marginLeft: '-8px', position: 'relative', zIndex: 10 }}
          >
            <ArrowLeft size={24} />
          </button>
          <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: '700', position: 'absolute', left: 0, right: 0, pointerEvents: 'none' }}>
            Secure Checkout
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: `${colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <ShieldCheck size={32} color={colors.primary} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            Set up your membership
          </h1>
          <p style={{ fontSize: '15px', color: colors.textSecondary, lineHeight: '1.5' }}>
            Your 7-day free trial starts today. Cancel anytime before your trial ends to avoid being charged.
          </p>
        </div>

        {/* Stripe Elements */}
        <div style={{ background: colors.card, padding: '24px', borderRadius: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          {clientSecret ? (
            <Elements options={{ clientSecret, appearance: { theme: isDarkMode ? 'night' : 'stripe' } }} stripe={stripePromise}>
              <CheckoutForm onSubscribe={handleSubscribe} />
            </Elements>
          ) : error ? (
            <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
                {error}
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: colors.textSecondary }}>
                <div style={{ width: '30px', height: '30px', border: `3px solid ${colors.border}`, borderTopColor: colors.primary, borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
                Loading secure checkout...
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', color: colors.textSecondary, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '24px' }}>
          <Lock size={14} /> Secure SSL Encryption
        </div>
        <p style={{ textAlign: 'center', color: colors.textSecondary, fontSize: '10px', marginTop: '12px', opacity: 0.8 }}>
          *A $0.50 temporary authorization hold may appear to verify your card.
        </p>

      </div>
    </div>
  );
};

export default PaywallCheckout;

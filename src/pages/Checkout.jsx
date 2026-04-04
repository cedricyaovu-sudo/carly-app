/* eslint-disable */
import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { stripePromise } from '../lib/stripe';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { showSuccess, showError } from '../components/ui/Toast';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';
import { usePricing } from '../hooks/usePricing';

const CheckoutForm = (props) => {
    const { clientSecret, amount } = props;
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Processing payment...');
    const navigate = useNavigate();
    const { bookingData, resetBooking } = useBooking();
    const { user } = useAuth();

    const sendConfirmationEmail = async (totalAmount) => {
        try {
            const response = await fetch('https://ugqjyfgcosjajazsdydw.supabase.co/functions/v1/send-booking-confirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    email: user.email,
                    bookingDetails: {
                        serviceType: bookingData.serviceType,
                        location: bookingData.location,
                        dateTime: bookingData.dateTime,
                        totalAmount: totalAmount.toFixed(2)
                    }
                })
            });
            const result = await response.json();
            return result.emailSent;
        } catch (error) {
            console.error('Email error:', error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Payment submission initiated');

        if (!stripe || !elements) {
            console.error('Stripe or Elements not loaded', { stripe: !!stripe, elements: !!elements });
            return;
        }

        if (!bookingData) {
            console.error('No booking data found');
            return;
        }

        console.log('Booking Data:', bookingData);

        // Validate booking data before processing payment
        if (!bookingData.serviceType || !bookingData.dateTime) {
            console.warn('Missing booking data');
            setMessage('Session expired or invalid booking details. Please start over.');
            showError('Session expired. Please start over.');
            return;
        }

        setIsLoading(true);
        setLoadingMessage('Processing payment...');
        setMessage(null); // Clear previous errors

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/appointments',
            },
            redirect: 'if_required'
        });

        if (error) {
            setMessage(error.message);
            showError(error.message);
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Create appointment in Supabase
            try {
                setLoadingMessage('Creating your appointment...');

                // 1. Create Appointment
                const { data: appointment, error: appError } = await supabase
                    .from('appointments')
                    .insert([
                        {
                            user_id: user.id,
                            service_type: bookingData.serviceType,
                            status: 'confirmed',
                            scheduled_time: bookingData.scheduledTime || new Date().toISOString(),
                            location: bookingData.location || 'Location not provided',
                            notes: JSON.stringify(bookingData.details || {}),
                            total_amount: amount / 100
                        }
                    ])
                    .select()
                    .single();

                if (appError) throw appError;

                // 2. Create Payment Record
                const { error: payError } = await supabase
                    .from('payments')
                    .insert([
                        {
                            appointment_id: appointment.id,
                            user_id: user.id,
                            stripe_payment_intent_id: paymentIntent.id,
                            amount: amount / 100,
                            status: 'succeeded'
                        }
                    ]);

                if (payError) throw payError;

                // 3. Send confirmation email
                setLoadingMessage('Sending confirmation email...');
                const emailSent = await sendConfirmationEmail(amount / 100);

                if (emailSent) {
                    showSuccess('Booking confirmed! Check your email for details.');
                } else {
                    showSuccess('Booking confirmed!');
                }

                resetBooking();
                navigate('/appointments');
            } catch (err) {
                console.error('Error saving appointment:', err);
                setMessage('Payment successful but failed to save appointment. Please contact support.');
                showError('Failed to save appointment. Please contact support.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setMessage('Payment status: ' + paymentIntent.status);
            showError('Payment status: ' + paymentIntent.status);
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <LoadingOverlay message={loadingMessage} />}
            <form onSubmit={handleSubmit}>
                <PaymentElement />
                <button
                    type="submit"
                    disabled={isLoading || !stripe || !elements}
                    className="btn btn-primary"
                    style={{ marginTop: 'var(--spacing-lg)', width: '100%' }}
                >
                    {isLoading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
                </button>
                {message && <div style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>{message}</div>}
            </form>
        </>
    );
};

const Checkout = () => {
    const { bookingData } = useBooking();
    const [clientSecret, setClientSecret] = useState('');
    const [serverAmount, setServerAmount] = useState(0);
    const [serverTrace, setServerTrace] = useState([]);
    const [error, setError] = useState(null);
    const {
        calculateSubtotal: subtotal,
        fuelCostOnly,
        taxes,
        deliveryFee,
        servicePrices,
        FALLBACK_PRICES,
        loading: pricingLoading,
        isPlaceholderActive,
        pricingConfig,
        serviceFee,
        detailedBreakdown,
        promoDiscount,
        gasPrices
    } = usePricing();

    const [promoCode, setPromoCode] = useState('');
    const [promoMessage, setPromoMessage] = useState('');

    const fetchPaymentIntent = (data, promo, gPrices) => {
        setError(null);
        console.log('Fetching Secure Payment Intent...');
        fetch('https://ugqjyfgcosjajazsdydw.supabase.co/functions/v1/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ 
                bookingData: data,
                promoCode: promo,
                gasPrices: gPrices
            }),
        })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then(json => Promise.reject(json));
                }
                return res.json();
            })
            .then((data) => {
                console.log('Secure Payment Intent Response:', data);
                if (data.debug) {
                    console.log('Backend Pricing Debug:', data.debug);
                }
                if (data.trace) {
                    console.log('Backend Trace:', data.trace);
                    setServerTrace(data.trace);
                } else {
                    setServerTrace([]);
                }
                setClientSecret(data.clientSecret);
                setServerAmount(data.amount);
            })
            .catch((err) => {
                console.error('Error fetching payment intent:', err);
                setError(err.error || 'Failed to load payment details');
            });
    };

    // 2. Fetch Payment Intent when booking data or promo changes
    useEffect(() => {
        if (!pricingLoading) {
            fetchPaymentIntent(bookingData, promoCode, gasPrices);
        }
    }, [bookingData, promoCode, pricingLoading, gasPrices]);

    // Debugging log for booking data
    useEffect(() => {
        console.log('Current Booking Data:', bookingData);
    }, [bookingData]);

    const handleApplyPromo = () => {
        const code = promoCode.trim().toUpperCase();
        if (code === 'NEWCAR15') {
            updateBooking({ promoCode: code });
            setPromoMessage(`Promo code applied!`);
        } else {
            updateBooking({ promoCode: '' });
            setPromoMessage('Invalid promo code.');
        }
    };

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
        },
    };

    const getServiceName = (key) => {
        const names = {
            recharging: 'EV Recharging',
            detailing: 'Detailing',
            maintenance: 'Maintenance',
            coating: 'Ceramic Coating',
            refueling: 'Refueling'
        };
        return names[key] || key;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '18px', marginBottom: 'var(--spacing-md)' }}>Order Summary</h2>

            <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ height: '160px', overflow: 'hidden' }}>
                    <img
                        src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop"
                        alt="Service Car"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                        decoding="async"
                    />
                </div>
                <div style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>{bookingData.dateTime || 'Date not selected'}</div>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{bookingData.serviceType || 'Service'}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: '#666', fontSize: '14px' }}>{bookingData.location || 'Location not selected'}</div>
                    </div>
                </div>
            </div>

            {isPlaceholderActive && (
                <div style={{
                    padding: '16px',
                    background: '#EBF8FF',
                    border: '1px solid #BEE3F8',
                    borderRadius: 'var(--radius-md)',
                    color: '#2C5282',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: 'var(--spacing-xl)',
                    textAlign: 'center',
                    lineHeight: '1.4'
                }}>
                    Don't worry, we will calculate the price of your service at the time of your appointment!
                </div>
            )}

            {/* Promo Code Section */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Promo Code</h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--spacing-xl)' }}>
                <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #E5E7EB',
                        fontSize: '16px'
                    }}
                />
                <button
                    onClick={handleApplyPromo}
                    style={{
                        background: '#007AFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        padding: '0 24px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Apply
                </button>
            </div>
            {promoMessage && (
                <div style={{
                    color: promoDiscount > 0 ? 'green' : 'red',
                    fontSize: '14px',
                    marginTop: '-16px',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    {promoMessage}
                </div>
            )}

            <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px', fontWeight: '600', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--color-primary)' }}>Service Breakdown</span>
                    <span>${(subtotal / 100).toFixed(2)}</span>
                </div>

                {/* Service Breakdown */}
                <div style={{ marginBottom: '16px' }}>
                    {detailedBreakdown.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '6px', padding: '4px 0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '500' }}>{item.name}</span>
                                {item.surgeApplied && <span style={{ color: '#F59E0B', fontSize: '11px' }}>Surge pricing applied</span>}
                            </div>
                            <span style={{ fontWeight: '600' }}>
                                ${(item.price / 100).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>

                {promoDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'green' }}>
                        <span>Discount (15%)</span>
                        <span>-${(promoDiscount / 100).toFixed(2)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: '#666' }}>Delivery Fee</span>
                    <span>${(deliveryFee / 100).toFixed(2)}</span>
                </div>
                {serviceFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                        <span style={{ color: '#666' }}>Service Fees</span>
                        <span>${(serviceFee / 100).toFixed(2)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                    <span style={{ color: '#666' }}>Taxes</span>
                    <span>${(taxes / 100).toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', color: 'var(--color-primary)' }}>
                    <span>Total</span>
                    <span>{serverAmount > 0 ? `$${(serverAmount / 100).toFixed(2)}` : 'Calculating...'}</span>
                </div>
            </div>

            <h2 style={{ fontSize: '18px', marginBottom: 'var(--spacing-md)' }}>Payment Method</h2>

            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                {clientSecret ? (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm clientSecret={clientSecret} amount={serverAmount} />
                    </Elements>
                ) : error ? (
                    <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
                        Error: {error}
                    </div>
                ) : (
                    <div style={{ 
                        padding: '32px 20px', 
                        textAlign: 'center', 
                        background: 'var(--color-surface)', 
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            border: '3px solid var(--color-border)', 
                            borderTopColor: 'var(--color-primary)', 
                            borderRadius: '50%', 
                            animation: 'spin 1s linear infinite' 
                        }} />
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                            Securing your payment session...
                        </div>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', color: '#999', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: 'var(--spacing-lg)' }}>
                <Lock size={12} />
                Secure SSL Encryption
            </div>
        </div>
    );
};

export default Checkout;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, Shield, Bell, Zap, Play } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Paywall = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState('annual');

  const colors = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    primary: '#00C2CB',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    highlight: '#F59E0B' // Gold
  };

  const handleSubscribe = () => {
    navigate(`/paywall-checkout?plan=${selectedPlan}`);
  };

  const benefits = [
    { title: 'On-Demand Refueling', desc: 'We deliver gas directly to your parked car.' },
    { title: 'At-Home Detailing', desc: 'Professional cleaning in your driveway.' },
    { title: 'Mobile Maintenance', desc: 'Oil changes and care without the shop visit.' }
  ];

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 24px 40px 24px',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: `${colors.highlight}20`, borderRadius: '20px', color: colors.highlight, fontWeight: '700', fontSize: '14px', marginBottom: '16px' }}>
            <Star size={16} fill="currentColor" /> GOFUEL MEMBERSHIP
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2', marginBottom: '12px' }}>
            Unlock unlimited car care convenience.
          </h1>
          <p style={{ fontSize: '16px', color: colors.textSecondary }}>
            Join 15,000+ members saving time every week.
          </p>
        </div>

        {/* Benefits List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          {benefits.map((benefit, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '14px', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, marginTop: '2px' }}>
                <Check size={16} strokeWidth={3} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{benefit.title}</h3>
                <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.4' }}>{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Toggle */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          {/* Monthly */}
          <div 
            onClick={() => setSelectedPlan('monthly')}
            style={{ 
              flex: 1, padding: '16px', borderRadius: '16px', cursor: 'pointer',
              border: `2px solid ${selectedPlan === 'monthly' ? colors.primary : colors.border}`,
              background: selectedPlan === 'monthly' ? `${colors.primary}10` : colors.card,
              position: 'relative', transition: 'all 0.2s'
            }}
          >
            <div style={{ opacity: selectedPlan === 'monthly' ? 1 : 0.6 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Monthly</div>
              <div style={{ fontSize: '24px', fontWeight: '800' }}>$24<span style={{ fontSize: '16px', color: colors.textSecondary }}>.99</span></div>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>billed monthly</div>
            </div>
          </div>

          {/* Annual */}
          <div 
            onClick={() => setSelectedPlan('annual')}
            style={{ 
              flex: 1, padding: '16px', borderRadius: '16px', cursor: 'pointer',
              border: `2px solid ${selectedPlan === 'annual' ? colors.primary : colors.border}`,
              background: selectedPlan === 'annual' ? `${colors.primary}10` : colors.card,
              position: 'relative', transition: 'all 0.2s'
            }}
          >
            {/* Savings Badge */}
            <div style={{ 
              position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
              background: colors.highlight, color: '#000', padding: '4px 10px', borderRadius: '12px',
              fontSize: '11px', fontWeight: '800', whiteSpace: 'nowrap', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}>
              SAVE 16%
            </div>

            <div style={{ opacity: selectedPlan === 'annual' ? 1 : 0.6 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Annually</div>
              <div style={{ fontSize: '24px', fontWeight: '800' }}>$249<span style={{ fontSize: '16px', color: colors.textSecondary }}>.99</span></div>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>$20.83 / mo</div>
            </div>
          </div>
        </div>

        {/* The Timeline (Blinkist Model) */}
        <div style={{ 
            background: colors.card, borderRadius: '20px', padding: '24px', 
            border: `1px solid ${colors.border}`, marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>How your free trial works</h3>
          
          <div style={{ position: 'relative' }}>
            {/* Vertical Line */}
            <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: colors.border }} />
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: colors.highlight, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <Check size={14} color="#000" strokeWidth={3} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700' }}>Today</div>
                <div style={{ fontSize: '14px', color: colors.textSecondary, marginTop: '2px' }}>Get instant access to all Pro features.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: colors.card, border: `2px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <Bell size={12} color={colors.textSecondary} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700' }}>Day 5</div>
                <div style={{ fontSize: '14px', color: colors.textSecondary, marginTop: '2px' }}>We'll email you a reminder before billing.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: colors.card, border: `2px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <Shield size={12} color={colors.textSecondary} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700' }}>Day 7</div>
                <div style={{ fontSize: '14px', color: colors.textSecondary, marginTop: '2px' }}>You'll be billed. Cancel any time.</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ paddingBottom: '20px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubscribe}
            style={{
              width: '100%', padding: '20px', borderRadius: '16px', background: colors.primary,
              color: 'white', border: 'none', fontSize: '18px', fontWeight: '800', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px ${colors.primary}50`
            }}
          >
            Start 7-Day Free Trial
          </motion.button>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: colors.textSecondary, display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Restore Purchase</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paywall;

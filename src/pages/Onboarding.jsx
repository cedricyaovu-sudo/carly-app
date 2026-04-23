import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, ShieldCheck, Fuel, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';
import { supabase } from '../lib/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const digitsOnly = (value) => (value || '').replace(/\D/g, '');

const isValidName = (value) => (value || '').trim().length >= 2;
const isValidEmail = (value) => EMAIL_REGEX.test((value || '').trim());
const isValidPhone = (value) => {
  const digits = digitsOnly(value);
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
};

const formatPhone = (value) => {
  const d = digitsOnly(value).slice(0, 11);
  const body = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
  if (body.length === 0) return '';
  if (body.length < 4) return `(${body}`;
  if (body.length < 7) return `(${body.slice(0, 3)}) ${body.slice(3)}`;
  return `(${body.slice(0, 3)}) ${body.slice(3, 6)}-${body.slice(6, 10)}`;
};

// Keep the paywall/card flow in the codebase so it can be turned back on later.
const REQUIRE_CARD_AT_ONBOARDING = false;

const Onboarding = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, refreshProfile } = useAuth();
  const { prefetchMembershipIntent } = usePayment();
  const [step, setStep] = useState(1);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [contactTouched, setContactTouched] = useState({
    name: false,
    email: false,
    phone: false
  });
  const [contactError, setContactError] = useState('');

  // Form selections (we don't strictly need to save them, but it builds the personalized feel)
  const [selections, setSelections] = useState({
    name: '',
    email: '',
    phone: '',
    worstChore: '',
    feltUnsafe: null,
    lowOnGas: null,
    wishMaintenance: null,
    wishClean: null,
    vehicleCount: ''
  });

  const nextStep = () => setStep(s => s + 1);

  const handleSelection = (key, value) => {
    setSelections(prev => ({ ...prev, [key]: value }));
    // Add a slight delay for aesthetic feel before moving to next step
    setTimeout(nextStep, 300);
  };

  const contactFieldErrors = {
    name: isValidName(selections.name) ? '' : 'Please enter a valid name.',
    email: isValidEmail(selections.email) ? '' : 'Please enter a valid email address.',
    phone: isValidPhone(selections.phone) ? '' : 'Please enter a valid phone number.'
  };

  const contactFormValid = Object.values(contactFieldErrors).every(msg => msg === '');

  useEffect(() => {
    if (step === 9) {
      // Simulate the "calculating" Aha moment
      const timer = setTimeout(() => {
        setLoadingComplete(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const finishOnboarding = async () => {
    if (isFinishing) return;
    try {
      setIsFinishing(true);
      if (REQUIRE_CARD_AT_ONBOARDING) {
        // Warm the checkout flow only when onboarding requires a card again.
        prefetchMembershipIntent(0.50);
      }
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
        
        if (error) throw error;
        await refreshProfile();
      }
      navigate(REQUIRE_CARD_AT_ONBOARDING ? '/paywall' : '/new-service');
    } catch (err) {
      console.error('Error finishing onboarding:', err);
      // Fallback: still move the user forward so they aren't stuck.
      navigate(REQUIRE_CARD_AT_ONBOARDING ? '/paywall' : '/new-service');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/new-service`
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error(`Failed to sign in with ${provider}:`, err);
      setContactError(`Failed to sign in with ${provider}. Please try again.`);
    }
  };

  // Modern UI Colors ensuring it works seamlessly in the app
  const colors = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    primary: '#00C2CB',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
  };

  const contactInputStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    background: 'transparent',
    color: colors.text,
    marginBottom: '16px',
    fontSize: '16px'
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const OptionButton = ({ label, icon: Icon, onClick, isSelected }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isSelected ? colors.primary + '15' : colors.card,
        border: `2px solid ${isSelected ? colors.primary : colors.border}`,
        borderRadius: '16px',
        color: colors.text,
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {Icon && <Icon size={24} color={isSelected ? colors.primary : colors.textSecondary} />}
        {label}
      </div>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%',
        border: `2px solid ${isSelected ? colors.primary : colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isSelected ? colors.primary : 'transparent'
      }}>
        {isSelected && <CheckCircle2 size={16} color="white" />}
      </div>
    </motion.button>
  );

  const YesNoButtons = ({ stateKey }) => (
    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelection(stateKey, 'No')}
        style={{
          flex: 1, padding: '20px', borderRadius: '16px', fontSize: '18px', fontWeight: '700',
          background: colors.card, color: colors.text, border: `2px solid ${colors.border}`, cursor: 'pointer'
        }}
      >
        No
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelection(stateKey, 'Yes')}
        style={{
          flex: 1, padding: '20px', borderRadius: '16px', fontSize: '18px', fontWeight: '700',
          background: colors.primary, color: 'white', border: 'none', cursor: 'pointer',
          boxShadow: `0 8px 16px ${colors.primary}40`
        }}
      >
        Yes
      </motion.button>
    </div>
  );

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: colors.bg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>

      {/* Progress Bar (Hidden on step 1 and 8) */}
      {step > 1 && step < 8 && (
        <div style={{ width: '100%', height: '4px', background: colors.border, position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
          <motion.div
            initial={{ width: `${((step - 1) / 7) * 100}%` }}
            animate={{ width: `${(step / 7) * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{ height: '100%', background: colors.primary }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', maxWidth: '500px', margin: '0 auto', width: '100%', paddingTop: step === 1 ? '0' : '60px' }}>
        <AnimatePresence mode="wait">

          {/* STEP 1: Welcome / Value Prop */}
          {step === 1 && (
            <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                margin: '-24px -24px 32px -24px',
                height: '45vh',
                backgroundImage: 'url(/gofuel_onboarding_bg_v3.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${colors.bg} 0%, transparent 100%)` }} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '800', color: colors.text, marginBottom: '16px', lineHeight: '1.2' }}>
                  Welcome to GoFuel.
                </h1>
                <p style={{ fontSize: '18px', color: colors.textSecondary, lineHeight: '1.6', marginBottom: '40px' }}>
                  Car care that comes to you. Never wait in line at a gas station or car wash again. Tap a button, and we handle the rest.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  style={{
                    width: '100%', padding: '20px', borderRadius: '16px', background: colors.primary,
                    color: 'white', border: 'none', fontSize: '18px', fontWeight: '700', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: `0 8px 24px ${colors.primary}50`,
                    marginTop: 'auto'
                  }}
                >
                  Get Started <ArrowRight size={20} />
                </motion.button>

                {/* Existing User Bypass */}
                <motion.button
                  whileHover={{ opacity: 0.8 }}
                  onClick={() => {
                    navigate('/login');
                  }}
                  style={{
                    background: 'transparent', border: 'none', color: colors.textSecondary,
                    fontSize: '14px', fontWeight: '600', marginTop: '24px', cursor: 'pointer',
                    textDecoration: 'underline', textUnderlineOffset: '4px'
                  }}
                >
                  Already have an account? Log in
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Contact Info */}
          {step === 2 && (
            <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: colors.text, marginBottom: '32px', lineHeight: '1.3' }}>
                Let's get to know you.
              </h2>
              {contactError && (
                <div style={{
                  background: '#FEE2E2',
                  color: '#DC2626',
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  {contactError}
                </div>
              )}
              <input 
                type="text" 
                placeholder="Full Name" 
                value={selections.name}
                onChange={e => setSelections(prev => ({...prev, name: e.target.value}))}
                onBlur={() => setContactTouched(prev => ({ ...prev, name: true }))}
                aria-invalid={Boolean(contactTouched.name && contactFieldErrors.name)}
                style={{ ...contactInputStyle, border: `1px solid ${contactTouched.name && contactFieldErrors.name ? '#DC2626' : colors.border}` }}
              />
              {contactTouched.name && contactFieldErrors.name && (
                <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '-8px', marginBottom: '12px' }}>
                  {contactFieldErrors.name}
                </div>
              )}
              <input 
                type="email" 
                placeholder="Email Address" 
                value={selections.email}
                onChange={e => setSelections(prev => ({...prev, email: e.target.value}))}
                onBlur={() => setContactTouched(prev => ({ ...prev, email: true }))}
                aria-invalid={Boolean(contactTouched.email && contactFieldErrors.email)}
                style={{ ...contactInputStyle, border: `1px solid ${contactTouched.email && contactFieldErrors.email ? '#DC2626' : colors.border}` }}
              />
              {contactTouched.email && contactFieldErrors.email && (
                <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '-8px', marginBottom: '12px' }}>
                  {contactFieldErrors.email}
                </div>
              )}
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={selections.phone}
                onChange={e => setSelections(prev => ({...prev, phone: formatPhone(e.target.value)}))}
                onBlur={() => setContactTouched(prev => ({ ...prev, phone: true }))}
                aria-invalid={Boolean(contactTouched.phone && contactFieldErrors.phone)}
                style={{ ...contactInputStyle, border: `1px solid ${contactTouched.phone && contactFieldErrors.phone ? '#DC2626' : colors.border}`, marginBottom: '32px' }}
              />
              {contactTouched.phone && contactFieldErrors.phone && (
                <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '-24px', marginBottom: '20px' }}>
                  {contactFieldErrors.phone}
                </div>
              )}
              
              <div style={{ marginTop: 'auto', transform: 'translateY(-50px)' }}>
              <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                      setContactError('');
                      setContactTouched({ name: true, email: true, phone: true });
                      if (!contactFormValid) {
                          setContactError('Please fix the highlighted fields and try again.');
                          return;
                      }
                      try {
                          // Save lead immediately
                          await supabase.from('leads').insert({
                              name: selections.name.trim(),
                              email: selections.email.trim().toLowerCase(),
                              phone: selections.phone
                          });
                      } catch (e) {
                          console.error("Failed to save lead info", e);
                      }
                      navigate('/new-service');
                  }}
                  disabled={!selections.name || !selections.email || !selections.phone}
                  style={{
                    width: '100%', padding: '20px', borderRadius: '16px', background: colors.primary,
                    color: 'white', border: 'none', fontSize: '18px', fontWeight: '700', cursor: (!selections.name || !selections.email || !selections.phone) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: (!selections.name || !selections.email || !selections.phone) ? 'none' : `0 8px 24px ${colors.primary}50`,
                    opacity: (!selections.name || !selections.email || !selections.phone) ? 0.5 : 1
                  }}
                >
                  Continue <ArrowRight size={20} />
              </motion.button>

              <div style={{ margin: '24px 0 20px', position: 'relative', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: `1px solid ${colors.border}` }}></div>
                <span style={{ position: 'relative', background: colors.bg, padding: '0 16px', color: colors.textSecondary, fontSize: '14px', fontWeight: '600' }}>
                  OR
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    border: `1px solid ${colors.border}`,
                    background: colors.card,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: colors.text
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.86 16.8 15.69 17.58V20.34H19.26C21.35 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                    <path d="M12 23C14.97 23 17.46 22.02 19.26 20.34L15.69 17.58C14.71 18.24 13.46 18.66 12 18.66C9.17 18.66 6.78 16.75 5.9 14.18H2.23V17.03C4.04 20.62 7.71 23 12 23Z" fill="#34A853" />
                    <path d="M5.9 14.18C5.67 13.51 5.54 12.77 5.54 12C5.54 11.23 5.67 10.49 5.9 9.82V6.97H2.23C1.48 8.46 1.05 10.18 1.05 12C1.05 13.82 1.48 15.54 2.23 17.03L5.9 14.18Z" fill="#FBBC05" />
                    <path d="M12 5.34C13.62 5.34 15.06 5.89 16.21 6.99L19.34 3.86C17.46 2.11 14.97 1 12 1C7.71 1 4.04 3.38 2.23 6.97L5.9 9.82C6.78 7.25 9.17 5.34 12 5.34Z" fill="#EA4335" />
                  </svg>
                  Signup with Google
                </button>
              </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Needs Assessment */}
          {step === 3 && (
            <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: colors.text, marginBottom: '32px', lineHeight: '1.3' }}>
                What car chores do you hate the most?
              </h2>
              <OptionButton label="Refueling & Gas Stations" icon={Fuel} onClick={() => handleSelection('worstChore', 'refueling')} isSelected={selections.worstChore === 'refueling'} />
              <OptionButton label="Car Washes & Detailing" icon={Sparkles} onClick={() => handleSelection('worstChore', 'detailing')} isSelected={selections.worstChore === 'detailing'} />
              <OptionButton label="Oil Changes & Maintenance" icon={Wrench} onClick={() => handleSelection('worstChore', 'maintenance')} isSelected={selections.worstChore === 'maintenance'} />
              <OptionButton label="Honestly... all of them." icon={ShieldCheck} onClick={() => handleSelection('worstChore', 'all')} isSelected={selections.worstChore === 'all'} />
            </motion.div>
          )}

          {/* STEP 4: Pain Point 1 */}
          {step === 4 && (
            <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: `${colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={40} color={colors.primary} />
                </div>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: colors.text, marginBottom: '40px', lineHeight: '1.3', textAlign: 'center' }}>
                Have you ever felt unsafe at a gas station?
              </h2>
              <YesNoButtons stateKey="feltUnsafe" />
            </motion.div>
          )}

          {/* STEP 5: Pain Point 2 */}
          {step === 5 && (
            <motion.div key="step5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: `${colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Fuel size={40} color={colors.primary} />
                </div>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: colors.text, marginBottom: '40px', lineHeight: '1.3', textAlign: 'center' }}>
                Have you ever been low on gas while on the road?
              </h2>
              <YesNoButtons stateKey="lowOnGas" />
            </motion.div>
          )}

          {/* STEP 6: Pain Point 3 */}
          {step === 6 && (
            <motion.div key="step6" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: colors.text, marginBottom: '40px', lineHeight: '1.4', textAlign: 'center' }}>
                Did you ever wish your maintenance and gas could be taken care of, without you having to be involved or leaving the comfort of your home?
              </h2>
              <YesNoButtons stateKey="wishMaintenance" />
            </motion.div>
          )}

          {/* STEP 7: Pain Point 4 */}
          {step === 7 && (
            <motion.div key="step7" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: colors.text, marginBottom: '40px', lineHeight: '1.4', textAlign: 'center' }}>
                Did you ever wish your car(s) could be clean, without you having to be involved or leaving the comfort of your home?
              </h2>
              <YesNoButtons stateKey="wishClean" />
            </motion.div>
          )}

          {/* STEP 8: Value Quantification */}
          {step === 8 && (
            <motion.div key="step8" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: colors.text, marginBottom: '32px', lineHeight: '1.3' }}>
                How many vehicles are in your household?
              </h2>
              <OptionButton label="Just 1" onClick={() => handleSelection('vehicleCount', '1')} isSelected={selections.vehicleCount === '1'} />
              <OptionButton label="2 Vehicles" onClick={() => handleSelection('vehicleCount', '2')} isSelected={selections.vehicleCount === '2'} />
              <OptionButton label="3 or more" onClick={() => handleSelection('vehicleCount', '3+')} isSelected={selections.vehicleCount === '3+'} />
            </motion.div>
          )}

          {/* STEP 9: Aha Moment Loading */}
          {step === 9 && (
            <motion.div key="step9" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>

              {!loadingComplete ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    style={{ width: '64px', height: '64px', borderRadius: '32px', border: `4px solid ${colors.border}`, borderTopColor: colors.primary, marginBottom: '32px' }}
                  />
                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.text, marginBottom: '16px' }}>
                    Calculating your time saved...
                  </h2>
                  <p style={{ color: colors.textSecondary }}>Analyzing your responses...</p>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px auto', boxShadow: `0 8px 24px ${colors.primary}60` }}>
                    <Sparkles size={40} color="white" />
                  </div>
                  <h2 style={{ fontSize: '32px', fontWeight: '800', color: colors.text, marginBottom: '16px', lineHeight: '1.2' }}>
                    You could save up to <span style={{ color: colors.primary }}>40 hours</span> a year!
                  </h2>
                  <p style={{ fontSize: '18px', color: colors.textSecondary, marginBottom: '48px', lineHeight: '1.5' }}>
                    (Plus, you never have to go to the gas station again)
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={finishOnboarding}
                    style={{
                      padding: '20px 40px', borderRadius: '30px', background: colors.text,
                      color: colors.bg, border: 'none', fontSize: '18px', fontWeight: '800', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }}
                  >
                    {REQUIRE_CARD_AT_ONBOARDING ? 'See your plan' : 'Start using GoFuel'} <ChevronRight size={20} />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;

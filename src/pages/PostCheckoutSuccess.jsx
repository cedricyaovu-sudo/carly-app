import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const PostCheckoutSuccess = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1);

  const colors = {
    bg: isDarkMode ? '#0F172A' : '#FFFFFF', // Changed to pure white/dark for cleaner modal look
    text: isDarkMode ? '#F8FAFC' : '#000000',
    textSecondary: isDarkMode ? '#94A3B8' : '#6b7280',
    primary: '#00C2CB',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E5E7EB',
    modalBg: isDarkMode ? '#d1d5db' : '#d1d5db', // iOS style gray modal
    modalBtnDark: '#1c1c1e',
    modalBtnLight: '#d1d5db'
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      navigate('/review');
    }
  };

  const handleNotificationSelection = (allowed) => {
    // In a real app, you would request notification permissions here
    localStorage.setItem('notifications_allowed', allowed ? 'true' : 'false');
    navigate('/review');
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '440px', margin: 'auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="thank-you"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{ width: '96px', height: '96px', borderRadius: '48px', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', boxShadow: `0 12px 32px rgba(0, 194, 203, 0.4)` }}
              >
                <CheckCircle2 size={48} color="white" />
              </motion.div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
                Payment Confirmed!
              </h1>
              <p style={{ fontSize: '18px', color: colors.textSecondary, lineHeight: '1.5', marginBottom: '48px' }}>
                Your 7-day free trial has officially started. Welcome to the future of car ownership.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                style={{
                  width: '100%', padding: '20px', borderRadius: '16px', background: colors.text,
                  color: colors.bg, border: 'none', fontSize: '18px', fontWeight: '800', cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }}
              >
                Continue
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="notifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}
            >
              <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '32px', lineHeight: '1.2', maxWidth: '300px' }}>
                Stay updated with notifications
              </h1>

              {/* iOS Style Alert Mockup */}
              <div style={{
                background: colors.modalBg,
                borderRadius: '16px',
                width: '100%',
                maxWidth: '300px',
                overflow: 'hidden',
                color: '#000',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                <div style={{ padding: '24px 16px', fontWeight: '600', fontSize: '16px', lineHeight: '1.4' }}>
                  GoFuel would like to send you Notifications
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <button 
                    onClick={() => handleNotificationSelection(false)}
                    style={{ 
                      flex: 1, padding: '16px', background: 'transparent', border: 'none',
                      fontSize: '16px', color: '#666', borderRight: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer'
                    }}
                  >
                    Don't Allow
                  </button>
                  <button 
                    onClick={() => handleNotificationSelection(true)}
                    style={{ 
                      flex: 1, padding: '16px', background: colors.modalBtnDark, border: 'none',
                      fontSize: '16px', color: '#FFF', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    Allow
                  </button>
                </div>
              </div>

              {/* Pointing Finger Emoji */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                style={{ 
                  fontSize: '40px', 
                  position: 'absolute',
                  right: '60px', // Align under the 'Allow' button roughly
                  bottom: 'calc(50% - 150px)', // Positioned below the modal
                  zIndex: 10
                }}
              >
                👆
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default PostCheckoutSuccess;

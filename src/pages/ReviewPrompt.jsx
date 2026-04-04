import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { showSuccess } from '../components/ui/Toast';

const ReviewPrompt = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const colors = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    primary: '#00C2CB',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    starEmpty: isDarkMode ? '#475569' : '#CBD5E1',
    starFilled: '#F59E0B' // Amber/Gold
  };

  const handleSkip = () => {
    navigate('/signup');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showSuccess('Thank you for your feedback!');
    
    // Short delay so they see the thank you state before navigating
    setTimeout(() => {
      navigate('/signup');
    }, 1500);
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
      <div style={{ maxWidth: '440px', margin: 'auto', width: '100%' }}>
        
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px', lineHeight: '1.2' }}>
                  How was your experience?
                </h1>
                <p style={{ fontSize: '16px', color: colors.textSecondary, lineHeight: '1.5' }}>
                  We're completely changing how car care works. Let us know how easy it was to get set up!
                </p>
              </div>

              <div style={{ background: colors.card, padding: '32px 24px', borderRadius: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 8px 16px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        transition: 'transform 0.2s',
                        transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      <Star
                        size={40}
                        fill={(hoverRating || rating) >= star ? colors.starFilled : 'transparent'}
                        color={(hoverRating || rating) >= star ? colors.starFilled : colors.starEmpty}
                        strokeWidth={(hoverRating || rating) >= star ? 0 : 2}
                      />
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {rating > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: colors.textSecondary }}>
                          Any other feedback? (Optional)
                        </label>
                        <textarea
                          rows={4}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Tell us what you loved, or what we can improve..."
                          style={{
                            width: '100%',
                            padding: '16px',
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '16px',
                            color: colors.text,
                            fontSize: '15px',
                            resize: 'none',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  style={{
                    width: '100%', padding: '20px', borderRadius: '16px', background: rating > 0 ? colors.primary : colors.border,
                    color: rating > 0 ? 'white' : colors.textSecondary, border: 'none', fontSize: '18px', fontWeight: '800', 
                    cursor: rating > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: rating > 0 ? `0 8px 24px rgba(0, 194, 203, 0.4)` : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Submit Review
                </motion.button>
              </div>

              <button
                onClick={handleSkip}
                style={{
                  width: '100%', padding: '16px', background: 'transparent',
                  color: colors.textSecondary, border: 'none', fontSize: '15px', fontWeight: '600', 
                  cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px'
                }}
              >
                Not now
              </button>

            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '60vh' }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: `0 8px 24px rgba(0, 194, 203, 0.4)` }}>
                <CheckCircle2 size={40} color="white" />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>
                Thank You!
              </h2>
              <p style={{ fontSize: '16px', color: colors.textSecondary }}>
                Your feedback helps us make GoFuel better every day.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ReviewPrompt;

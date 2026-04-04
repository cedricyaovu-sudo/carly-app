import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MapPin, Calendar, Info, Navigation2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const MEETS_DATA = [
  {
    id: 1,
    title: 'Coffee & Cars (POST Houston)',
    location: 'Downtown Houston',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop',
    accentColor: '#00C2CB', // GoFuel Primary Cyan
    details: [
      'One of the largest car meets in the U.S.',
      'Happens 1st Saturday of every month (8-11 AM)',
      'Mix of supercars, JDM, classics, muscle',
      'Main Houston meet with thousands of cars sometimes'
    ]
  },
  {
    id: 2,
    title: 'Katy Cars & Coffee',
    location: 'Current Church',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop',
    accentColor: '#0EA5E9', // Sky Blue
    details: [
      'Last Saturday of every month (8-11 AM)',
      'Hosted by West Houston Muscle',
      'All builds welcome (daily drivers to exotics)',
      'Best consistent local meet'
    ]
  },
  {
    id: 3,
    title: 'Caffeine & Chrome (Gateway Classic Cars)',
    location: 'North Houston / Cypress area',
    image: 'https://images.unsplash.com/photo-1511407397940-d57f68e81203?q=80&w=1974&auto=format&fit=crop',
    accentColor: '#3B82F6', // Blue
    details: [
      'Monthly meet (late Saturdays, 9 AM-12 PM)',
      'Chill vibe, classic-heavy crowd',
      'Free entry plus coffee and donuts',
      'More laid-back vs Coffee & Cars'
    ]
  },
  {
    id: 4,
    title: 'Exotics & Brews (Sawyer Yards)',
    location: 'Midtown / Arts District',
    image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1974&auto=format&fit=crop',
    accentColor: '#0284C7', // Light Navy
    details: [
      'Focus on supercars and luxury builds',
      'Usually Sunday mornings',
      'Curated lineup (not fully open parking)',
      'Best for seeing Lambos, Ferraris, McLarens'
    ]
  },
  {
    id: 5,
    title: 'Houston parking lot meets (takeovers / pop-ups)',
    location: 'Random (gas stations, plazas, strip malls)',
    image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=2071&auto=format&fit=crop',
    accentColor: '#06B6D4', // Indigo Cyan
    details: [
      'Organized through IG/Snap',
      'Deep roots in Houston car culture',
      'Often late-night meets',
      'Unpredictable, sometimes shut down by police, but very popular in the scene'
    ]
  },
  {
    id: 6,
    title: 'RAD Day Coffee & Cars',
    location: 'POST Houston',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1974&auto=format&fit=crop',
    accentColor: '#2563EB', // Royal Blue
    details: [
      'Themed meet (80s/90s cars and hypercars)',
      'Special showcases and unveilings'
    ]
  },
  {
    id: 7,
    title: 'Houston PRE-2K Meet / Themed Meets',
    location: 'Various (restaurants, lots, collabs)',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=2028&auto=format&fit=crop',
    accentColor: '#38BDF8', // Light Sky Blue
    details: [
      'Focused themes (JDM, pre-2000, etc.)',
      'Usually posted on IG pages like HTX Cars, Cars Across Texas'
    ]
  },
  {
    id: 8,
    title: 'Houston Exotic Auto Festival',
    location: 'Houston Exotic Auto Festival Venue',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=100&w=2000&auto=format&fit=crop',
    accentColor: '#0891B2', // Deep Cyan
    details: [
      'Bigger event (not weekly)',
      'Supercars, vendors, and show environment'
    ]
  }
];

const CarMeets = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationAllowed, setLocationAllowed] = useState(false);

  useEffect(() => {
    // Check if we've already asked for location permission
    const hasPrompted = localStorage.getItem('car_meets_location_prompted');
    const isAllowed = localStorage.getItem('car_meets_location_allowed') === 'true';

    if (!hasPrompted) {
      // Small delay before showing the prompt for better UX
      setTimeout(() => setShowLocationPrompt(true), 500);
    } else {
      setLocationAllowed(isAllowed);
    }
  }, []);

  const handleLocationResponse = (allowed) => {
    localStorage.setItem('car_meets_location_prompted', 'true');
    localStorage.setItem('car_meets_location_allowed', allowed ? 'true' : 'false');
    setLocationAllowed(allowed);
    setShowLocationPrompt(false);
  };

  const colors = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    primary: '#00C2CB',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    modalBg: isDarkMode ? '#d1d5db' : '#d1d5db',
    modalBtnDark: '#1c1c1e',
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px',
      paddingTop: '48px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Car Meets</h1>
      </div>

      {locationAllowed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: `${colors.primary}15`, color: colors.primary,
          padding: '12px 16px', borderRadius: '12px', marginBottom: '24px',
          fontWeight: '600', fontSize: '14px'
        }}>
          <Navigation2 size={18} />
          Showing meets near Houston, TX
        </div>
      )}

      {/* Meets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '40px' }}>
        {MEETS_DATA.map((meet, index) => (
          <motion.div
            key={meet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              background: colors.card,
              borderRadius: '20px',
              border: `1px solid ${colors.border}`,
              borderTop: `4px solid ${meet.accentColor}`,
              boxShadow: '0 8px 16px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Image Banner */}
            <div style={{ position: 'relative', width: '100%', height: '180px' }}>
              <img 
                src={meet.image} 
                alt={meet.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              {/* Gradient Overlay for Text Readability */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 80%)' }} />
              
              <h3 style={{ 
                position: 'absolute', 
                bottom: '16px', 
                left: '20px', 
                right: '20px', 
                fontSize: '20px', 
                fontWeight: '800', 
                margin: 0, 
                color: 'white', 
                lineHeight: '1.3',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                {meet.title}
              </h3>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px', color: meet.accentColor, fontSize: '14px' }}>
                <MapPin size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontWeight: '500' }}>{meet.location}</span>
              </div>

              <ul style={{
                margin: 0,
                paddingLeft: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                color: colors.text,
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {meet.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Location Modal Overlay */}
      <AnimatePresence>
        {showLocationPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: colors.modalBg,
                borderRadius: '16px',
                width: '100%',
                maxWidth: '300px',
                overflow: 'hidden',
                color: '#000', // Modals usually have specific fixed text color in iOS
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                textAlign: 'center'
              }}
            >
              <div style={{ padding: '24px 16px', fontWeight: '600', fontSize: '16px', lineHeight: '1.4' }}>
                Allow "GoFuel" to use your location?
                <div style={{ fontSize: '13px', fontWeight: '400', marginTop: '8px', color: '#333' }}>
                  We use your location to find the best car meets and services near you.
                </div>
              </div>
              <div style={{ display: 'flex', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <button
                  onClick={() => handleLocationResponse(false)}
                  style={{
                    flex: 1, padding: '16px', background: 'transparent', border: 'none',
                    fontSize: '16px', color: '#007AFF', borderRight: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer'
                  }}
                >
                  Don't Allow
                </button>
                <button
                  onClick={() => handleLocationResponse(true)}
                  style={{
                    flex: 1, padding: '16px', background: 'transparent', border: 'none',
                    fontSize: '16px', color: '#007AFF', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Allow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarMeets;

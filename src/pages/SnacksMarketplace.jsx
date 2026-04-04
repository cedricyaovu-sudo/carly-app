import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useBooking } from '../contexts/BookingContext';
import { verifyAddressWithUSPS } from '../services/uspsService';
import AddressAutocomplete from '../components/AddressAutocomplete';

const SNACK_CATEGORIES = [
  {
    name: 'Chips',
    items: [
      { id: 'sun', name: 'SunChips (7 oz)', price: 5.97, image: '/snacks/sun.jpg' },
      { id: 'tos', name: 'Tostitos Scoops (14.5 oz)', price: 8.91, image: '/snacks/tos.jpg' },
      { id: 'sma', name: 'Smash Kitchen Kettle Chips (6 oz)', price: 5.46, image: '/snacks/sma.jpg' },
      { id: 'fri', name: 'Fritos Corn Chips (9.25 oz)', price: 5.96, image: '/snacks/fri.jpg' },
      { id: 'var', name: 'Frito-Lay 42-pack chips', price: 29.97, image: '/snacks/var.jpg' },
    ]
  },
  {
    name: 'Crackers & Pretzels',
    items: [
      { id: 'chz', name: 'Cheez-It Crackers (12.4 oz)', price: 5.97, image: '/snacks/chz.jpg' },
      { id: 'gfc', name: 'Gluten-free Cheez-It (9 oz)', price: 5.07, image: '/snacks/gfc.jpg' },
      { id: 'dot', name: 'Dot’s Snack Mix (14 oz)', price: 9.72, image: '/snacks/dot.jpg' },
    ]
  },
  {
    name: 'Cookies & Cakes',
    items: [
      { id: 'waf', name: 'Great Value Wafer Cookies (8 oz)', price: 2.96, image: '/snacks/waf.jpg' },
      { id: 'fam', name: 'Famous Amos (10-pack)', price: 8.66, image: '/snacks/fam.jpg' },
      { id: 'aho', name: 'Chips Ahoy (9.6 oz)', price: 5.81, image: '/snacks/aho.jpg' },
      { id: 'rol', name: 'Swiss Rolls (6 count)', price: 3.71, image: '/snacks/rol.jpg' },
    ]
  },
  {
    name: 'Sweet Snacks & Candy',
    items: [
      { id: 'rice', name: 'Rice Krispies Treats (8 ct)', price: 4.17, image: '/snacks/rice.jpg' },
      { id: 'pud', name: 'Snack Pack pudding (12 ct)', price: 6.00, image: '/snacks/pud.jpg' },
      { id: 'mot', name: 'Mott’s Fruit Snacks (40 pack)', price: 12.56, image: '/snacks/mot.jpg' },
      { id: 'fru', name: 'Fruit Roll-Ups variety pack', price: 7.83, image: '/snacks/fru.jpg' },
      { id: 'res', name: 'Reese’s King Size', price: 3.75, image: '/snacks/res.jpg' },
    ]
  },
  {
    name: 'Soda & Energy Drinks',
    items: [
      { id: 'awrb', name: 'A&W Root Beer (12-pack)', price: 12.93, image: '/snacks/awrb.jpg' },
      { id: 'pep', name: 'Pepsi (12-pack)', price: 9.00, image: '/snacks/pep.jpg' },
      { id: 'preb', name: 'Prebiotic Pepsi (8-pack)', price: 9.00, image: '/snacks/preb.jpg' },
      { id: 'c4e', name: 'C4 Energy (16 oz can)', price: 4.08, image: '/snacks/c4e.jpg' },
      { id: 'cel', name: 'CELSIUS (12 oz can)', price: 3.42, image: '/snacks/cel.jpg' },
      { id: 'mon', name: 'Monster Energy (16 oz)', price: 4.02, image: '/snacks/mon.jpg' },
      { id: 'aln', name: 'Alani Nu (12-pack)', price: 29.97, image: '/snacks/aln.jpg' },
      { id: 'red', name: 'Red Bull (4-pack)', price: 16.17, image: '/snacks/red.jpg' },
    ]
  },
  {
    name: 'Sports, Kids & Functional',
    items: [
      { id: 'gat', name: 'Gatorade variety pack (18-pack)', price: 16.17, image: '/snacks/gat.jpg' },
      { id: 'koo', name: 'Kool-Aid Bursts (6-pack)', price: 3.00, image: '/snacks/koo.jpg' },
      { id: 'pop', name: 'Poppi prebiotic soda', price: 2.24, image: '/snacks/pop.jpg' },
      { id: 'boo', name: 'BOOST nutritional drinks (24-pack)', price: 63.65, image: '/snacks/boo.jpg' },
    ]
  }
];

const SnacksMarketplace = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { bookingData, updateBooking } = useBooking();
  // We can temporarily use local state for snacks cart, or integrate with BookingContext later.
  // We'll manage local cart for now to show the UI
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState(bookingData.location || '');
  const [showAddressError, setShowAddressError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [addressErrorMessage, setAddressErrorMessage] = useState('Please enter an address');

  const handleUpdateQuantity = (item, delta) => {
    setCart(prev => {
      const current = prev[item.id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: next };
    });
  };

  const getCartTotal = () => {
    let total = 0;
    let count = 0;
    Object.entries(cart).forEach(([id, quantity]) => {
      // find item
      for (const cat of SNACK_CATEGORIES) {
        const item = cat.items.find(i => i.id === id);
        if (item) {
          total += item.price * quantity;
          count += quantity;
          break;
        }
      }
    });
    return { total, count };
  };

  const cartStats = getCartTotal();

  const handleCheckout = async () => {
    if (!address || address.trim() === '') {
      setAddressErrorMessage('Please enter an address');
      setShowAddressError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsVerifying(true);
    const uspsResult = await verifyAddressWithUSPS(address);
    setIsVerifying(false);

    if (!uspsResult.isValid) {
      setAddressErrorMessage(uspsResult.message || 'Invalid address according to USPS');
      setShowAddressError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Persist snacks and address to booking context
    const snacksForContext = {};
    Object.entries(cart).forEach(([id, qty]) => {
      snacksForContext[id] = qty;
    });

    updateBooking({
      location: address,
      details: {
        addOns: {
          ...bookingData.details?.addOns,
          ...snacksForContext
        }
      }
    });

    // Navigate to the order summary page
    navigate('/order-summary');
  };

  const allCategories = ['All', ...SNACK_CATEGORIES.map(c => c.name)];

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <div className="page-header" style={{ position: 'sticky', top: 0, zIndex: 50, background: isDarkMode ? 'var(--color-bg-primary)' : '#fff', paddingBottom: '16px' }}>
        <button className="back-button" onClick={() => navigate('/new-service')}>
          <ArrowLeft size={24} />
        </button>
        <h1>Gas Station Snacks</h1>
        <div style={{ width: 40 }} /> {/* Spacer */}
      </div>

      <div style={{ marginBottom: '24px' }}>
        {/* Address Field */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: isDarkMode ? '#1E293B' : '#F1F5F9',
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: showAddressError ? '8px' : '16px',
          border: '1px solid ' + (showAddressError ? '#EF4444' : (address ? '#00C7BE' : (isDarkMode ? '#334155' : '#E2E8F0')))
        }}>
          <MapPin size={20} color={showAddressError ? '#EF4444' : '#00C7BE'} style={{ marginRight: '12px', flexShrink: 0 }} />
          <div style={{ flex: 1, position: 'relative' }}>
            <AddressAutocomplete
              placeholder="Enter delivery address..."
              value={address}
              onChange={(val) => {
                setAddress(val);
                if (showAddressError) setShowAddressError(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '16px',
                width: '100%'
              }}
            />
          </div>
        </div>
        {showAddressError && (
          <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', marginBottom: '16px', marginLeft: '4px' }}>
            {addressErrorMessage}
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: isDarkMode ? '#1E293B' : '#F1F5F9',
          padding: '12px 16px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '16px'
        }}>
          <Search size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} style={{ marginRight: '12px' }} />
          <input
            type="text"
            placeholder="Search snacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '16px',
              width: '100%'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none', // Firefox
          MsOverflowStyle: 'none',  // IE/Edge
        }} className="hide-scroll">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                background: activeCategory === cat ? '#00C7BE' : (isDarkMode ? '#1E293B' : '#F1F5F9'),
                color: activeCategory === cat ? 'white' : 'var(--color-text-primary)',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        {SNACK_CATEGORIES.map(category => {
          if (activeCategory !== 'All' && activeCategory !== category.name) return null;

          const filteredItems = category.items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={category.name} style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
                {category.name}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                {filteredItems.map(item => {
                  const quantity = cart[item.id] || 0;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: isDarkMode ? '#1E293B' : '#fff',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                        border: isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      </div>
                      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-primary)', lineHeight: '1.3' }}>
                            {item.name}
                          </h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#00C7BE' }}>
                            ${item.price.toFixed(2)}
                          </span>

                          {quantity > 0 ? (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: isDarkMode ? '#334155' : '#F1F5F9',
                              borderRadius: 'var(--radius-full)',
                              padding: '4px'
                            }}>
                              <button
                                onClick={() => handleUpdateQuantity(item, -1)}
                                style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#000', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                              >
                                <Minus size={14} />
                              </button>
                              <span style={{ fontSize: '14px', fontWeight: '600', width: '12px', textAlign: 'center' }}>
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item, 1)}
                                style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#00C7BE', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUpdateQuantity(item, 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#00C7BE',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#fff'
                              }}
                            >
                              <Plus size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {cartStats.count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 100, x: '-50%' }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              width: 'calc(100% - 48px)',
              maxWidth: '517px', // 565px (container) - 48px (horizontal margins)
              padding: '16px 24px',
              background: '#000',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              zIndex: 100,
              cursor: isVerifying ? 'wait' : 'pointer',
              opacity: isVerifying ? 0.8 : 1
            }}
            onClick={() => !isVerifying && handleCheckout()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                {cartStats.count}
              </div>
              <span style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>{isVerifying ? 'Verifying...' : 'View Cart'}</span>
            </div>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
              ${cartStats.total.toFixed(2)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SnacksMarketplace;

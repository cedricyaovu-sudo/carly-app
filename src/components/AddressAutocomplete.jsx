import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { searchAddressAutocomplete } from '../services/uspsService';

export default function AddressAutocomplete({ 
    value, 
    onChange, 
    placeholder = "Enter your address", 
    hasError,
    mapPinColor,
    style
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!value || value.length < 3) {
                setSuggestions([]);
                return;
            }
            setIsLoading(true);
            const results = await searchAddressAutocomplete(value);
            setSuggestions(results);
            setIsLoading(false);
        };

        const timer = setTimeout(() => {
            // Only fetch if dropdown is meant to be open (user is typing)
            if (isOpen) fetchSuggestions();
        }, 400); // 400ms debounce

        return () => clearTimeout(timer);
    }, [value, isOpen]);

    const stateCodeMap = {
        "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR", "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE", "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID", "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS", "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD", "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS", "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV", "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK", "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC", "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT", "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY", "district of columbia": "DC"
    };

    const handleSelect = (suggestion) => {
        // Format nominatim result to be closer to normal US addresses
        // Often "House Number Street Name, City, County, State, ZIP, United States"
        const addr = suggestion.address;
        const street = addr.house_number ? `${addr.house_number} ${addr.road || ''}` : (addr.road || '');
        const city = addr.city || addr.town || addr.village || addr.municipality || '';
        let state = addr.state || '';
        if (state && stateCodeMap[state.toLowerCase()]) {
            state = stateCodeMap[state.toLowerCase()];
        }
        const zip = addr.postcode || '';
        
        let formatted = [street, city].filter(Boolean).map(s => String(s).trim()).join(', ');
        const stateZip = [state, zip].filter(Boolean).join(' ');
        if (stateZip) {
            formatted += formatted ? `, ${stateZip}` : stateZip;
        }
        
        onChange(formatted || suggestion.display_name);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => {
                    if (value && value.length >= 3) setIsOpen(true);
                }}
                placeholder={placeholder}
                style={style}
            />
            <MapPin 
                size={20} 
                color={hasError ? '#EF4444' : mapPinColor} 
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
            />

            {isOpen && (suggestions.length > 0 || isLoading) && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'var(--color-surface, #fff)',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxHeight: '250px',
                    overflowY: 'auto'
                }}>
                    {isLoading ? (
                        <div style={{ padding: '12px 16px', color: '#64748B', fontSize: '14px', textAlign: 'center' }}>
                            Searching...
                        </div>
                    ) : (
                        suggestions.map((s, idx) => (
                            <div 
                                key={idx}
                                onClick={() => handleSelect(s)}
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: idx < suggestions.length - 1 ? '1px solid var(--color-border, #f1f5f9)' : 'none',
                                    fontSize: '14px',
                                    color: 'var(--color-text-primary, #1e293b)',
                                    cursor: 'pointer',
                                    lineHeight: '1.4'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-primary, #f8fafc)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {s.display_name}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

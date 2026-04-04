import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data, error: supabaseError } = await supabase
                    .from('services')
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (supabaseError) throw supabaseError;

                // Check for duplicates
                const ids = data.map(s => s.id);
                const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
                if (duplicates.length > 0) {
                    console.warn('useServices: DUPLICATE IDS DETECTED:', duplicates);
                }

                setServices(data);
                console.log(`useServices: [${new Date().toLocaleTimeString()}] Data refetched from Supabase (Rows: ${data.length})`);
                console.log('useServices: Visibility states:', data.map(s => `${s.id}: ${s.visible}`));
            } catch (err) {
                console.error('useServices: Fetch failed, using fallback:', err);
                setError(err);
                const fallback = [
                    { id: 'Gas Refueling', title: 'Re-fueling', icon_name: 'Fuel', visible: true, is_active: true, sort_order: 1 },
                    { id: 'EV Recharging', title: 'EV Recharging', icon_name: 'Zap', visible: true, is_active: true, sort_order: 5 },
                    { id: 'Detailing', title: 'Detailing', icon_name: 'Droplets', visible: true, is_active: true, sort_order: 2 },
                    { id: 'Maintenance', title: 'Maintenance', icon_name: 'Wrench', visible: true, is_active: true, sort_order: 3 },
                    { id: 'Paint Correction', title: 'Paint Correction', icon_name: 'Sparkles', visible: true, is_active: true, sort_order: 3.01 },
                    { id: 'Mechanic Work', title: 'Mechanic Work', icon_name: 'Wrench', visible: true, is_active: true, sort_order: 3.02 }
                ];
                setServices(fallback);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();

        // Real-time subscription
        const channel = supabase
            .channel('public:services')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (payload) => {
                console.log('useServices: Real-time update received:', payload);
                fetchServices(); // Refetch to get updated list with correct order
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getServiceById = (id) => services.find(s => s.id === id);

    // Map of frontend service keys (used in state/URL) to database IDs
    const crossSellMap = {
        'fuel': 'Gas Refueling',
        'refueling': 'Gas Refueling',
        'ev': 'EV Recharging',
        'charging': 'EV Recharging',
        'recharging': 'EV Recharging',
        'detailing': 'Detailing',
        'maintenance': 'Maintenance',
        'mechanic-work': 'Mechanic Work',
        'paint-correction': 'Paint Correction',
        'coating': 'Ceramic Coating'
    };

    const isServiceVisible = (serviceKey) => {
        const dbId = crossSellMap[serviceKey] || serviceKey;
        const service = getServiceById(dbId);
        // If not found in DB (like new services being developed), default to visible: true
        if (!service) return true;
        // is_active: false means the service is completely hidden/unavailable
        return service.is_active !== false;
    };

    const isServiceComingSoon = (serviceKey) => {
        const dbId = crossSellMap[serviceKey] || serviceKey;
        const service = getServiceById(dbId);
        if (!service) return false;
        // Handle both boolean and potential string variants ('false')
        return service.visible === false || String(service.visible) === 'false';
    };

    return { services, loading, error, isServiceVisible, isServiceComingSoon };
};

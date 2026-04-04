import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Fuel, Zap, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';

const MyVehicles = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cache, updateCache } = useBooking();
    const [vehicles, setVehicles] = useState(cache.vehicles || []);
    const [loading, setLoading] = useState(!cache.vehicles);

    const fetchVehicles = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            const vehiclesData = data || [];
            setVehicles(vehiclesData);
            updateCache('vehicles', vehiclesData);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    }, [updateCache]);

    useEffect(() => {
        if (user) {
            fetchVehicles();
        }
    }, [user, fetchVehicles]);

    const deleteVehicle = async (id) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setVehicles(vehicles.filter(v => v.id !== id));
        } catch (error) {
            console.error('Error deleting vehicle:', error);
        }
    };

    if (loading) {
        return <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>Loading vehicles...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {vehicles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: '#666' }}>
                        <p>No vehicles found. Add your first car!</p>
                    </div>
                ) : (
                    vehicles.map((vehicle) => (
                        <div key={vehicle.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ width: '80px', height: '60px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginRight: 'var(--spacing-md)', flexShrink: 0, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {vehicle.image_url ? (
                                    <img src={vehicle.image_url} alt={vehicle.nickname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" decoding="async" />
                                ) : (
                                    <span style={{ fontSize: '24px' }}>🚗</span>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{vehicle.nickname}</div>
                                <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{vehicle.make} {vehicle.model} - {vehicle.color}</div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    background: vehicle.fuel_type === 'electric' ? '#D1FAE5' : '#E0F2FE',
                                    color: vehicle.fuel_type === 'electric' ? '#059669' : 'var(--color-primary)',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    textTransform: 'capitalize'
                                }}>
                                    {vehicle.fuel_type === 'electric' ? <Zap size={14} /> : <Fuel size={14} />}
                                    {vehicle.fuel_type}
                                </div>
                            </div>
                            <button
                                onClick={() => deleteVehicle(vehicle.id)}
                                style={{ padding: '8px', color: '#999', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={() => navigate('/add-vehicle')}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                <Plus size={28} />
            </button>
        </div>
    );
};

export default MyVehicles;

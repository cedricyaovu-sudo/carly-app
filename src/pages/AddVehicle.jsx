import { useState } from 'react';
import { Fuel, Zap, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ImageUploader from '../components/ui/ImageUploader';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';
import { showSuccess, showError } from '../components/ui/Toast';

const AddVehicle = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        nickname: '',
        make: '',
        model: '',
        color: '',
        fuelType: 'gasoline'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (file) => {
        setImageFile(file);
    };

    const uploadImage = async (file) => {
        if (!file) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('vehicle-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('vehicle-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async () => {
        if (!user) return;

        if (!formData.nickname.trim()) {
            showError('Please enter a vehicle nickname');
            return;
        }

        try {
            setLoading(true);
            let imageUrl = null;

            if (imageFile) {
                setLoadingMessage('Uploading image...');
                imageUrl = await uploadImage(imageFile);
            }

            setLoadingMessage('Saving vehicle...');
            const { error } = await supabase.from('vehicles').insert([
                {
                    user_id: user.id,
                    nickname: formData.nickname,
                    make: formData.make,
                    model: formData.model,
                    color: formData.color,
                    fuel_type: formData.fuelType,
                    image_url: imageUrl
                }
            ]);

            if (error) throw error;

            showSuccess('Vehicle added successfully!');
            navigate('/my-vehicles');
        } catch (error) {
            console.error('Error adding vehicle:', error);
            showError('Failed to add vehicle. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{ paddingBottom: '100px' }}
        >
            {loading && <LoadingOverlay message={loadingMessage} />}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', padding: '8px', marginRight: '8px', cursor: 'pointer' }}
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Add New Vehicle</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                {/* Image Upload */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '14px' }}>Vehicle Photo</label>
                    <ImageUploader
                        onUpload={handleImageUpload}
                        bucket="vehicle-images"
                        aspectRatio="16:9"
                        maxSizeMB={1}
                        maxWidthOrHeight={800}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '14px' }}>Vehicle Nickname *</label>
                    <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        placeholder="e.g., My Sedan"
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '16px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '14px' }}>Make</label>
                    <input
                        type="text"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        placeholder="e.g., Toyota"
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '16px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '14px' }}>Model</label>
                    <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="e.g., Camry"
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '16px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '14px' }}>Color</label>
                    <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="e.g., Blue"
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '16px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '14px' }}>Fuel Type</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <button
                            onClick={() => setFormData({ ...formData, fuelType: 'gasoline' })}
                            style={{
                                flex: 1,
                                padding: '24px',
                                borderRadius: 'var(--radius-lg)',
                                border: formData.fuelType === 'gasoline' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                background: formData.fuelType === 'gasoline' ? '#E0F2FE' : 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            <Fuel size={32} color={formData.fuelType === 'gasoline' ? 'var(--color-primary)' : '#666'} />
                            <span style={{ fontWeight: '600', color: formData.fuelType === 'gasoline' ? 'var(--color-primary)' : '#666' }}>Gasoline</span>
                        </button>

                        <button
                            onClick={() => setFormData({ ...formData, fuelType: 'electric' })}
                            style={{
                                flex: 1,
                                padding: '24px',
                                borderRadius: 'var(--radius-lg)',
                                border: formData.fuelType === 'electric' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                background: formData.fuelType === 'electric' ? '#E0F2FE' : 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            <Zap size={32} color={formData.fuelType === 'electric' ? 'var(--color-primary)' : '#666'} />
                            <span style={{ fontWeight: '600', color: formData.fuelType === 'electric' ? 'var(--color-primary)' : '#666' }}>Electric</span>
                        </button>
                    </div>
                </div>
            </div>

            <div
                style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 'var(--spacing-md)', background: 'var(--color-background)', borderTop: '1px solid var(--color-border)' }}
            >
                <div className="container" style={{ minHeight: 'auto', padding: 0, margin: '0 auto' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Vehicle'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddVehicle;

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import LoadingSpinner from './LoadingSpinner';

const ImageUploader = ({
    onUpload,
    currentImage = null,
    bucket = 'vehicle-images',
    maxSizeMB = 1,
    maxWidthOrHeight = 800,
    aspectRatio = 'auto' // 'square', '16:9', 'auto'
}) => {
    const [preview, setPreview] = useState(currentImage);
    const [isDragging, setIsDragging] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const compressImage = async (file) => {
        setIsCompressing(true);
        setProgress(0);

        const options = {
            maxSizeMB,
            maxWidthOrHeight,
            useWebWorker: true,
            onProgress: (p) => setProgress(Math.round(p)),
        };

        try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        } catch (error) {
            console.error('Compression error:', error);
            return file; // Return original if compression fails
        } finally {
            setIsCompressing(false);
        }
    };

    const handleFile = useCallback(async (file) => {
        if (!file || !file.type.startsWith('image/')) {
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        // Compress and upload
        const compressedFile = await compressImage(file);
        if (onUpload) {
            onUpload(compressedFile);
        }
    }, [onUpload, maxSizeMB, maxWidthOrHeight]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setPreview(null);
        if (onUpload) {
            onUpload(null);
        }
    };

    const aspectRatioStyle = aspectRatio === 'square'
        ? { aspectRatio: '1/1' }
        : aspectRatio === '16:9'
            ? { aspectRatio: '16/9' }
            : { minHeight: '150px' };

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            role="button"
            tabIndex="0"
            aria-label="Upload image"
            style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: isDragging ? 'rgba(0, 122, 255, 0.05)' : 'var(--color-surface)',
                cursor: 'pointer',
                overflow: 'hidden',
                ...aspectRatioStyle,
            }}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {isCompressing ? (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                    }}
                >
                    <LoadingSpinner size={32} />
                    <span style={{ fontSize: '14px', color: '#666' }}>
                        Optimizing... {progress}%
                    </span>
                </div>
            ) : preview ? (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                    }}
                >
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        loading="lazy"
                        decoding="async"
                    />
                    <button
                        onClick={handleRemove}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '24px',
                    }}
                >
                    <div>
                        <Upload size={32} color="#999" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-heading)', marginBottom: '4px' }}>
                            Drag & drop or tap to upload
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            JPG, PNG, WebP up to 5MB
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;

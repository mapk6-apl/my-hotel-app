import React, { useState, useEffect } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getHotelGallery, getFallbackSvgDataUri } from '../../api/photoApi.js';
import '../../styles/screen3.css'; 

export type PhotoGalleryProps = {
  images?: string[];
  hotelName?: string;
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  images = [],
  hotelName = 'Break-Away Hotel',
}) => {
  const galleryImages = images && images.length > 0 
    ? images 
    : [
        '/assets/hotel-hero.jpg',
        '/assets/hotel-room-1.jpg',
        '/assets/hotel-room-2.jpg',
        '/assets/hotel-room-3.jpg',
        '/assets/hotel-room-4.jpg'
      ];

  const [activeImage, setActiveImage] = useState<string>(galleryImages[0] ?? '');
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const heroImage = activeImage || galleryImages[0] || '';
  const sideThumbnails = galleryImages.slice(0, 4);

  return (
    <div className="photo-gallery-wrapper">
      <div className="gallery-grid">
        {/* MAIN HERO FEATURED IMAGE */}
        <div 
          className="gallery-hero-image-wrapper"
          onClick={() => setIsLightboxOpen(true)}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <img
            src={heroImage}
            alt={`${hotelName} main view`}
            className="gallery-hero-image"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="533"><rect width="800" height="533" fill="%23CBD0B9"/><text x="400" y="270" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23514B23">Break-Away Luxury Hotel</text></svg>';
            }}
          />
          <button 
            className="gallery-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
          >
            <Maximize2 size={14} />
            <span>View Fullscreen</span>
          </button>
        </div>

        {/* THUMBNAILS GRID */}
        <div className="gallery-thumbs-grid">
          {sideThumbnails.map((imgUrl, idx) => (
            <div 
              key={idx} 
              className="gallery-thumb-item"
              onClick={() => setActiveImage(imgUrl)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={imgUrl}
                alt={`${hotelName} thumbnail ${idx + 1}`}
                className="gallery-thumb-image"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23CBD0B9"/><text x="200" y="150" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23514B23">Photo Preview</text></svg>';
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX OVERLAY */}
      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setIsLightboxOpen(false)}>
              <X size={20} />
            </button>
            <img src={heroImage} alt={`${hotelName} gallery view`} className="lightbox-main-img" />
            <div className="lightbox-footer">
              <span>{hotelName} Photo Gallery</span>
              <div className="lightbox-thumbs-row">
                {galleryImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${hotelName} gallery thumbnail ${i + 1}`}
                    className="lightbox-thumb-image"
                    onClick={() => setActiveImage(img)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
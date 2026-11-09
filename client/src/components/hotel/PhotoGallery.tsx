import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { normalizePropertyImageUrl } from '../../api/photoApi.js';
import type { PropertyImage } from '../../store/slices/hotelSlice.js';
import '../../styles/screen3.css';

export type PhotoGalleryProps = {
  images?: PropertyImage[];
  hotelName?: string;
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  images = [],
  hotelName = 'Break-Away Hotel',
}) => {
  const galleryImages = images?.map((image) => ({
    ...image,
    image_url: normalizePropertyImageUrl(image.image_url),
  })) ?? [];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const heroImage = galleryImages[currentIndex] || galleryImages[0];
  const sideThumbnails = galleryImages
    .map((image, index) => ({ image, index }))
    .filter(({ index }) => index !== currentIndex)
    .slice(0, 4);

  const handleNext = () => {
    if (galleryImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = () => {
    if (galleryImages.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  return (
    <div className="photo-gallery-wrapper">
      {/* FEATURED PHOTO + 4 THUMBNAILS GRID */}
      <div className="gallery-grid">
        {/* MAIN HERO FEATURED IMAGE */}
        <div
          className="gallery-hero-image-wrapper"
          onClick={() => galleryImages.length > 0 && setIsLightboxOpen(true)}
        >
          {heroImage ? (
            <img src={heroImage.image_url} alt={heroImage.alt_text || `Representative image for ${hotelName}`} className="gallery-hero-image" />
          ) : (
            <div className="gallery-empty-state">No property images are available.</div>
          )}
          {heroImage?.attribution_name && (
            <a
              href={heroImage.attribution_url || undefined}
              target="_blank"
              rel="noreferrer"
              className="gallery-image-credit"
              onClick={(event) => event.stopPropagation()}
            >
              Photo by {heroImage.attribution_name} / {heroImage.source_name}
            </a>
          )}
          {galleryImages.length > 0 && (
            <button
              type="button"
              className="gallery-expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
            >
              <Maximize2 size={14} />
              <span>View Fullscreen Gallery ({galleryImages.length})</span>
            </button>
          )}
        </div>

        {/* THUMBNAIL GRID (4 Sub-photos) */}
        <div className="gallery-thumbs-grid">
          {sideThumbnails.map(({ image, index }) => (
            <div
              key={index}
              className="gallery-thumb-item"
              onClick={() => setCurrentIndex(index)}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `Representative image for ${hotelName}, photo ${index + 1}`}
                className="gallery-thumb-image"
              />
            </div>
          ))}
        </div>
      </div>

      {/* STYLED LIGHTBOX OVERLAY */}
      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            
            {/* TOP HEADER BAR */}
            <div className="lightbox-header">
              <button
                type="button"
                className="lightbox-back-btn"
                onClick={() => setIsLightboxOpen(false)}
              >
                <ArrowLeft size={16} />
                <span>Back to Gallery</span>
              </button>

              <span className="lightbox-counter">
                {hotelName} &bull; Photo {currentIndex + 1} of {galleryImages.length}
              </span>

              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Close Lightbox"
              >
                <X size={18} />
              </button>
            </div>

            {/* MAIN IMAGE DISPLAY WITH PREV/NEXT BUTTONS */}
            <div className="lightbox-main-stage">
              <button
                type="button"
                className="lightbox-arrow-btn left"
                onClick={handlePrev}
                aria-label="Previous Photo"
              >
                <ChevronLeft size={24} />
              </button>

              <img
                src={galleryImages[currentIndex]?.image_url}
                alt={galleryImages[currentIndex]?.alt_text || `Representative image for ${hotelName}, photo ${currentIndex + 1}`}
                className="lightbox-featured-img"
              />

              <button
                type="button"
                className="lightbox-arrow-btn right"
                onClick={handleNext}
                aria-label="Next Photo"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* BOTTOM THUMBNAILS STRIP */}
            <div className="lightbox-footer-strip">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className={'lightbox-strip-thumb ' + (currentIndex === idx ? 'active' : '')}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <img src={img.image_url} alt={img.alt_text || `${hotelName} representative photo ${idx + 1}`} />
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import '../../styles/screen3.css';

export type PhotoGalleryProps = {
  images?: string[];
  hotelName?: string;
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  images = [],
  hotelName = 'Break-Away Hotel',
}) => {
  const galleryImages = images && images.length > 0 ? images : [];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const heroImage = galleryImages[currentIndex] || galleryImages[0] || '/assets/hotel-placeholder.jpg';
  const sideThumbnails = galleryImages.slice(0, 4);

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
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={heroImage}
            alt={hotelName + ' Hero View'}
            className="gallery-hero-image"
          />
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
        </div>

        {/* THUMBNAIL GRID (4 Sub-photos) */}
        <div className="gallery-thumbs-grid">
          {sideThumbnails.map((imgUrl, idx) => (
            <div
              key={idx}
              className={'gallery-thumb-item ' + (currentIndex === idx ? 'active-thumb' : '')}
              onClick={() => setCurrentIndex(idx)}
            >
              <img
                src={imgUrl}
                alt={hotelName + ' Room Photo ' + (idx + 1)}
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
                src={galleryImages[currentIndex]}
                alt={hotelName + ' Large Photo ' + (currentIndex + 1)}
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
                  <img src={img} alt={'Thumb ' + (idx + 1)} />
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

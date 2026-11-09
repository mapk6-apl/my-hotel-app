import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { getFallbackSvgDataUri, normalizePropertyImageUrl } from '../../api/photoApi.js';
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
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());

  const heroImage = galleryImages[currentIndex] || galleryImages[0];
  const fallbackImage = getFallbackSvgDataUri(hotelName);
  const imageSource = (url?: string): string =>
    url && !failedImages.has(url) ? url : fallbackImage;
  const markImageFailed = (url?: string) => {
    if (url) setFailedImages((current) => new Set(current).add(url));
  };
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
          <img
            src={imageSource(heroImage?.image_url)}
            alt={heroImage?.alt_text || `Representative image for ${hotelName}`}
            className="gallery-hero-image"
            onError={() => markImageFailed(heroImage?.image_url)}
          />
          {galleryImages.length === 0 && (
            <span className="gallery-fallback-label">Property images are not available yet.</span>
          )}
          {heroImage?.attribution_name && (
            <div className="gallery-image-credit" onClick={(event) => event.stopPropagation()}>
              <a href={heroImage.attribution_url || undefined} target="_blank" rel="noreferrer">Photo by {heroImage.attribution_name}</a>
              {heroImage.source_url && (
                <> / <a href={heroImage.source_url} target="_blank" rel="noreferrer">{heroImage.source_name}</a></>
              )}
            </div>
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
            <button
              type="button"
              key={index}
              className="gallery-thumb-item"
              onClick={() => setCurrentIndex(index)}
            >
              <img
                src={imageSource(image.image_url)}
                alt={image.alt_text || `Representative image for ${hotelName}, photo ${index + 1}`}
                className="gallery-thumb-image"
                onError={() => markImageFailed(image.image_url)}
              />
            </button>
          ))}
          {Array.from({ length: Math.max(0, 4 - sideThumbnails.length) }, (_, index) => (
            <div className="gallery-thumb-placeholder" key={`empty-${index}`} aria-hidden="true">
              <span>No additional image</span>
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
                src={imageSource(galleryImages[currentIndex]?.image_url)}
                alt={galleryImages[currentIndex]?.alt_text || `Representative image for ${hotelName}, photo ${currentIndex + 1}`}
                className="lightbox-featured-img"
                onError={() => markImageFailed(galleryImages[currentIndex]?.image_url)}
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
                <button
                  type="button"
                  key={idx}
                  className={'lightbox-strip-thumb ' + (currentIndex === idx ? 'active' : '')}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <img src={imageSource(img.image_url)} alt={img.alt_text || `${hotelName} representative photo ${idx + 1}`} onError={() => markImageFailed(img.image_url)} />
                </button>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

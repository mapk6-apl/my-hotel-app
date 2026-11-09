import React, { useEffect, useState } from 'react';
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
  const gallerySignature = galleryImages.map((image) => image.image_url).join('|');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);

  const activeIndex = galleryImages.length ? currentIndex % galleryImages.length : 0;
  const heroImage = galleryImages[activeIndex];
  const fallbackImage = getFallbackSvgDataUri(hotelName);
  const imageSource = (url?: string): string =>
    url && !failedImages.has(url) ? url : fallbackImage;
  const markImageFailed = (url?: string) => {
    if (url) setFailedImages((current) => new Set(current).add(url));
  };
  const activeImageUrl = heroImage?.image_url;
  const isImageLoading = Boolean(
    activeImageUrl && !failedImages.has(activeImageUrl) && loadedImageUrl !== activeImageUrl
  );
  const sideThumbnails = galleryImages
    .map((image, index) => ({ image, index }))
    .filter(({ index }) => index !== activeIndex)
    .slice(0, 4);

  useEffect(() => {
    setCurrentIndex(0);
    setFailedImages(new Set());
    setLoadedImageUrl(null);
    setIsLightboxOpen(false);
  }, [hotelName, gallerySignature]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const navigatePhotos = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLightboxOpen(false);
      if (event.key === 'ArrowRight') handleNext();
      if (event.key === 'ArrowLeft') handlePrev();
    };
    document.addEventListener('keydown', navigatePhotos);
    return () => document.removeEventListener('keydown', navigatePhotos);
  }, [isLightboxOpen, galleryImages.length]);

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
            onLoad={() => setLoadedImageUrl(heroImage?.image_url ?? null)}
          />
          {isImageLoading && <span className="gallery-image-loading" role="status">Loading photo…</span>}
          {galleryImages.length === 0 && (
            <span className="gallery-fallback-label">Property images are not available yet.</span>
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
      {heroImage?.attribution_name && (
        <p className="gallery-attribution">
          Photo by <a href={heroImage.attribution_url || undefined} target="_blank" rel="noreferrer">{heroImage.attribution_name}</a>
          {heroImage.source_url && <> on <a href={heroImage.source_url} target="_blank" rel="noreferrer">{heroImage.source_name}</a></>}
        </p>
      )}

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
                {hotelName} &bull; Photo                 {activeIndex + 1} of {galleryImages.length}
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
                src={imageSource(galleryImages[activeIndex]?.image_url)}
                alt={galleryImages[activeIndex]?.alt_text || `Representative image for ${hotelName}, photo ${activeIndex + 1}`}
                className="lightbox-featured-img"
                onError={() => markImageFailed(galleryImages[activeIndex]?.image_url)}
                onLoad={() => setLoadedImageUrl(galleryImages[activeIndex]?.image_url ?? null)}
              />
              {isImageLoading && <span className="gallery-image-loading lightbox-image-loading" role="status">Loading photo…</span>}

              <button
                type="button"
                className="lightbox-arrow-btn right"
                onClick={handleNext}
                aria-label="Next Photo"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="lightbox-attribution" aria-live="polite">
              {galleryImages[activeIndex]?.attribution_name && (
                <>
                  Photo by{' '}
                  <a href={galleryImages[activeIndex]?.attribution_url || undefined} target="_blank" rel="noreferrer">
                    {galleryImages[activeIndex]?.attribution_name}
                  </a>
                  {galleryImages[activeIndex]?.source_url && (
                    <> on <a href={galleryImages[activeIndex]?.source_url || undefined} target="_blank" rel="noreferrer">{galleryImages[activeIndex]?.source_name}</a></>
                  )}
                </>
              )}
            </div>

            {/* BOTTOM THUMBNAILS STRIP */}
            <div className="lightbox-footer-strip">
              {galleryImages.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={'lightbox-strip-thumb ' + (activeIndex === idx ? 'active' : '')}
                  aria-label={`Show photo ${idx + 1} of ${galleryImages.length}`}
                  aria-current={activeIndex === idx ? 'true' : undefined}
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

import React from 'react';
import { Maximize2 } from 'lucide-react'; 
import '../../styles/screen3.css'; 

export type PhotoGalleryProps = {
  images?: string[];
  hotelName?: string[];
};

const DEFAULT_GALLERY_IMAGES = [
  '/assets/hotel-hero.jpg',
  '/assets/hotel-room-1.jpg',
  '/assets/hotel-room-2.jpg',
  '/assets/hotel-room-3.jpg',
  '/assets/hotel-room-4.jpg',
];

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({images = DEFAULT_GALLERY_IMAGES, hotelName = 'Hotel Property'}) => {
  const galleryImages = images.length > 0 ? images : DEFAULT_GALLERY_IMAGES;
  const heroImage = galleryImages[0] ?? '/assets/hotel-hero.jpg';
  const sideThumbnails = galleryImages.slice(1, 5);

  const [activeImage, setActiveImage] = useState<string>(heroImage);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  return (
    <div className="photo-gallery-container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="md:col-span-2 h-96 bg-[#CBD0B9] rounded-2xl overflow-hidden relative cursor-pointer group shadow"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img src={activeImage} alt={`${hotelName} Featured`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => {(
            e.currentTarget as HTMLImageElement).src = '/assets/hotel-placeholder.jpg';}}/>
          <button className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3 py-2 rounded-xl backdrop-blur-sm flex items-center space-x-1.5 transition-colors">
            <Maximize2 size={14} />
            <span>View Fullscreen</span>
          </button>
        </div>

        {/* 4 small side thumbnails */}
        <div className="grid grid-cols-2 gap-2.5 h-96">
          {sideThumbnails.map((imgUrl, index) => (
            <div
              key={index}
              onClick={() => setActiveImage(imgUrl)}
              className={`bg-[#CBD0B9] rounded-xl overflow-hidden cursor-pointer relative border-2 transition-all ${
                activeImage === imgUrl ? 'border-[#656839] scale-95 shadow-md' : 'border-transparent hover:opacity-90'
              }`}
            >
              <img src={imgUrl} alt={`${hotelName} Preview ${index + 1}`} className="w-full h-full object-cover" onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/hotel-placeholder.jpg';}}/>
            </div>
          ))}
        </div>
      </div>

      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] bg-[#514B23] p-4 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={activeImage} alt="Fullscreen View" className="w-full h-[70vh] object-contain rounded-xl" />
            <div className="flex justify-between items-center mt-3 px-2 text-white text-xs font-semibold">
              <span>{hotelName} Gallery</span>
              <button onClick={() => setIsLightboxOpen(false)} className="bg-[#656839] hover:bg-[#CBD0B9] hover:text-[#514B23] px-4 py-1.5 rounded-lg text-white font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
function useState<T>(initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  return React.useState(initialValue);
}


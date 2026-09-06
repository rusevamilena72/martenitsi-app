import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ListingWithImages } from '../lib/supabase';

interface ListingDetailsModalProps {
  listing: ListingWithImages;
  onClose: () => void;
}

export default function ListingDetailsModal({ listing, onClose }: ListingDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = listing.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{listing.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Затвори"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {hasImages && (
            <div className="mb-6">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex].image_data}
                  alt={`${listing.name} - Снимка ${currentImageIndex + 1}`}
                  className="w-full h-96 object-contain"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'bg-red-600 w-4'
                              : 'bg-white bg-opacity-75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-red-600'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={image.image_data}
                        alt={`Миниатюра ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Цена</h3>
              <p className="text-2xl font-bold text-red-600">
                {listing.price.toFixed(2)} {listing.currency}
              </p>
            </div>

            {listing.size && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Размери</h3>
                <p className="text-gray-600">{listing.size}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Описание</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Категория</h3>
              <p className="text-gray-600 capitalize">{listing.category}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

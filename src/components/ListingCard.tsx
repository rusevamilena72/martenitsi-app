import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ListingWithImages, getCategoryLabel, getCategoryPath, getAvailabilityLabel } from '../lib/supabase';
import { Edit, Trash2, Eye, ShoppingCart, Check } from 'lucide-react';
import ListingDetailsModal from './ListingDetailsModal';
import { useCart } from '../contexts/CartContext';

interface ListingCardProps {
  listing: ListingWithImages;
  showActions?: boolean;
  showCategory?: boolean;
  onDelete?: (id: string) => void;
}

const AVAILABILITY_STYLES: Record<string, string> = {
  in_stock: 'bg-green-100 text-green-800',
  made_to_order: 'bg-amber-100 text-amber-800',
  sold_out: 'bg-gray-200 text-gray-600',
};

export default function ListingCard({ listing, showActions = false, showCategory = false, onDelete }: ListingCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();

  const isSoldOut = listing.availability === 'sold_out';

  const handleAddToOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(listing);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && confirm('Сигурни ли сте, че искате да изтриете тази обява?')) {
      onDelete(listing.id);
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  const primaryImage = listing.images?.find(img => img.is_primary);
  const displayImage = primaryImage || (listing.images && listing.images.length > 0 ? listing.images[0] : null);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-64 bg-gradient-to-br from-red-100 to-white flex items-center justify-center overflow-hidden">
          {showCategory && (
            <Link
              to={getCategoryPath(listing.category)}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm text-red-700 text-xs font-semibold px-2 py-1 rounded-full shadow-sm hover:bg-white transition-colors"
            >
              {getCategoryLabel(listing.category)}
            </Link>
          )}

          {displayImage ? (
            <img
              src={displayImage.image_data}
              alt={listing.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-6xl">🎀</div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800 break-words">{listing.name}</h3>
          </div>

          {listing.availability && (
            <span
              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
                AVAILABILITY_STYLES[listing.availability] || AVAILABILITY_STYLES.in_stock
              }`}
            >
              {getAvailabilityLabel(listing.availability)}
            </span>
          )}

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

          {listing.size && (
            <p className="text-xs text-gray-500 mb-2">Размер: {listing.size}</p>
          )}

          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="text-lg font-bold text-red-600">
                {listing.price.toFixed(2)} {listing.currency}
              </div>
            </div>

            {showActions ? (
              <div className="flex gap-2">
                <Link
                  to={`/listings/edit/${listing.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Редактирай"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Изтрий"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleDetailsClick}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Детайли
                <Eye size={16} />
              </button>
            )}
          </div>

          {!showActions && (
            <button
              onClick={handleAddToOrder}
              disabled={isSoldOut}
              className={`mt-3 w-full flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-colors ${
                isSoldOut
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : justAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              {isSoldOut ? (
                'Изчерпано'
              ) : justAdded ? (
                <>
                  <Check size={16} />
                  Добавено
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Добави към поръчката
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showDetails && (
        <ListingDetailsModal listing={listing} onClose={() => setShowDetails(false)} />
      )}
    </>
  );
}

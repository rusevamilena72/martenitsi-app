import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, CATEGORIES, CURRENCIES, Category, Currency, Listing, ListingImage } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface ImageFile {
  data: string;
  mimeType: string;
  name: string;
  isPrimary?: boolean;
}

interface ListingFormProps {
  listing?: Listing;
  onSuccess?: () => void;
}

export default function ListingForm({ listing, onSuccess }: ListingFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [existingImages, setExistingImages] = useState<ListingImage[]>([]);

  const [formData, setFormData] = useState({
    category: listing?.category || ('komplekti' as Category),
    name: listing?.name || '',
    description: listing?.description || '',
    size: listing?.size || '',
    price: listing?.price?.toString() || '',
    currency: listing?.currency || ('лв.' as Currency),
    row_position: listing?.row_position?.toString() || '1',
    column_position: listing?.column_position?.toString() || '1',
    show_on_homepage: listing?.show_on_homepage || false,
  });

  useEffect(() => {
    if (listing) {
      loadExistingImages();
    }
  }, [listing]);

  const loadExistingImages = async () => {
    if (!listing) return;

    const { data } = await supabase
      .from('listing_images')
      .select('*')
      .eq('listing_id', listing.id)
      .order('position', { ascending: true });

    if (data) {
      setExistingImages(data);
      setImages(
        data.map((img) => ({
          data: img.image_data,
          mimeType: img.mime_type,
          name: `Снимка ${img.position}`,
          isPrimary: img.is_primary,
        }))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!user) {
      setError('Трябва да сте влезли, за да създадете обява');
      setLoading(false);
      return;
    }

    if (!formData.name || !formData.description || !formData.price) {
      setError('Моля, попълнете всички задължителни полета');
      setLoading(false);
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setError('Невалидна цена');
      setLoading(false);
      return;
    }

    const rowPosition = parseInt(formData.row_position);
    const columnPosition = parseInt(formData.column_position);

    if (isNaN(rowPosition) || rowPosition < 1) {
      setError('Невалиден номер на ред');
      setLoading(false);
      return;
    }

    if (isNaN(columnPosition) || columnPosition < 1 || columnPosition > 4) {
      setError('Позицията в реда трябва да бъде между 1 и 4');
      setLoading(false);
      return;
    }

    const listingData = {
      user_id: user.id,
      category: formData.category,
      name: formData.name,
      description: formData.description,
      size: formData.size || null,
      price,
      currency: formData.currency,
      row_position: rowPosition,
      column_position: columnPosition,
      show_on_homepage: formData.show_on_homepage,
      updated_at: new Date().toISOString(),
    };

    try {
      let listingId: string;

      if (listing) {
        const { error: updateError } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', listing.id);

        if (updateError) throw updateError;
        listingId = listing.id;

        await supabase.from('listing_images').delete().eq('listing_id', listingId);
      } else {
        const { data: newListing, error: insertError } = await supabase
          .from('listings')
          .insert([listingData])
          .select()
          .single();

        if (insertError || !newListing) throw insertError;
        listingId = newListing.id;
      }

      if (images.length > 0) {
        const imageRecords = images.map((img, index) => ({
          listing_id: listingId,
          image_data: img.data,
          mime_type: img.mimeType,
          position: index + 1,
          is_primary: img.isPrimary || index === 0,
        }));

        const { error: imageError } = await supabase
          .from('listing_images')
          .insert(imageRecords);

        if (imageError) throw imageError;
      }

      setSuccess(listing ? 'Обявата е обновена успешно' : 'Обявата е създадена успешно');

      if (listing && onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Възникна грешка при записването на обявата');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {listing ? 'Редактиране на обява' : 'Създаване на нова обява'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Категория <span className="text-red-600">*</span>
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Име на артикула <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Детайли / Описание <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-32"
            required
          />
        </div>

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
            Размери
          </label>
          <input
            id="size"
            type="text"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="напр. 10см x 5см"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Цена <span className="text-red-600">*</span>
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Валута <span className="text-red-600">*</span>
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              {CURRENCIES.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="row_position" className="block text-sm font-medium text-gray-700 mb-1">
              Ред <span className="text-red-600">*</span>
            </label>
            <input
              id="row_position"
              type="number"
              min="1"
              value={formData.row_position}
              onChange={(e) => setFormData({ ...formData, row_position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label htmlFor="column_position" className="block text-sm font-medium text-gray-700 mb-1">
              Позиция в реда (1-4) <span className="text-red-600">*</span>
            </label>
            <input
              id="column_position"
              type="number"
              min="1"
              max="4"
              value={formData.column_position}
              onChange={(e) => setFormData({ ...formData, column_position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
        </div>

        <ImageUpload images={images} onChange={setImages} />

        <div className="flex items-center gap-2">
          <input
            id="show_on_homepage"
            type="checkbox"
            checked={formData.show_on_homepage}
            onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="show_on_homepage" className="text-sm font-medium text-gray-700">
            Покажи на началната страница
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Запазване...' : listing ? 'Обнови обявата' : 'Създай обява'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
}

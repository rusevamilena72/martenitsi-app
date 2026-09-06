import { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, MAX_IMAGES } from '../lib/supabase';

interface ImageFile {
  data: string;
  mimeType: string;
  name: string;
  isPrimary?: boolean;
}

interface ImageUploadProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');

    if (images.length + files.length > MAX_IMAGES) {
      setError(`Можете да качите максимум ${MAX_IMAGES} снимки`);
      return;
    }

    const newImages: ImageFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError(`Файлът ${file.name} не е в разрешен формат (PNG, JPG, WebP)`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError(`Файлът ${file.name} е по-голям от 1MB`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newImages.push({
          data: base64,
          mimeType: file.type,
          name: file.name,
        });
      } catch (err) {
        setError(`Грешка при четене на ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      const hasPrimary = images.some(img => img.isPrimary);
      const updatedNewImages = newImages.map((img, index) => ({
        ...img,
        isPrimary: !hasPrimary && images.length === 0 && index === 0,
      }));
      onChange([...images, ...updatedNewImages]);
      e.target.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const removeImage = (index: number) => {
    const wasPrimary = images[index]?.isPrimary;
    let remainingImages = images.filter((_, i) => i !== index);

    if (wasPrimary && remainingImages.length > 0) {
      remainingImages = remainingImages.map((img, i) => ({
        ...img,
        isPrimary: i === 0,
      }));
    }

    onChange(remainingImages);
  };

  const setPrimaryImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updatedImages);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Снимки (максимум {MAX_IMAGES})
      </label>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {images.length < MAX_IMAGES && (
        <div className="mb-4">
          <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors">
            <div className="flex flex-col items-center">
              <Upload className="text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600">
                Кликнете за качване или влачете файлове
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG или WebP (макс. 1MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              multiple
              onChange={handleFileSelect}
            />
          </label>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.data}
                alt={`Снимка ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Премахни снимка"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <label className="flex items-center gap-1 px-2 py-1 bg-white bg-opacity-90 rounded cursor-pointer hover:bg-opacity-100 transition-all">
                  <input
                    type="checkbox"
                    checked={image.isPrimary === true}
                    onChange={() => setPrimaryImage(index)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-medium text-gray-700">Основна</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Изберете коя снимка да е основна, като поставите чек върху нея
      </p>
    </div>
  );
}

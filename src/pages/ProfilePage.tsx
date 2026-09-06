import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, User, Lock, Plus, Package, Edit, Trash2, UserPlus, Image as ImageIcon, X } from 'lucide-react';
import { supabase, ListingWithImages, getCategoryLabel, getAvailabilityLabel } from '../lib/supabase';

const AVAILABILITY_BADGE_STYLES: Record<string, string> = {
  in_stock: 'bg-green-100 text-green-800',
  made_to_order: 'bg-amber-100 text-amber-800',
  sold_out: 'bg-gray-200 text-gray-600',
};

export default function ProfilePage() {
  const { user, profile, loading, updateProfile, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [registering, setRegistering] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setBackgroundImageUrl(profile.background_image_url || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      loadUserListings();
    }
  }, [user]);

  const loadUserListings = async () => {
    if (!user) return;

    setLoadingListings(true);
    const { data: listingsData, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (!error && listingsData) {
      setListings(listingsData as ListingWithImages[]);
    }
    setLoadingListings(false);
  };

  const handleDeleteListing = async (id: string) => {
    const { error } = await supabase.from('listings').delete().eq('id', id);

    if (!error) {
      setListings(listings.filter((l) => l.id !== id));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    if (!username) {
      setError('Потребителското име не може да бъде празно');
      setUpdating(false);
      return;
    }

    const { error } = await updateProfile(username);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Профилът е обновен успешно');
    }
    setUpdating(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    if (!newPassword || !confirmPassword) {
      setError('Моля, попълнете всички полета за парола');
      setUpdating(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Паролата трябва да бъде поне 6 символа');
      setUpdating(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Паролите не съвпадат');
      setUpdating(false);
      return;
    }

    const { error } = await updatePassword(newPassword);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Паролата е променена успешно');
      setNewPassword('');
      setConfirmPassword('');
    }
    setUpdating(false);
  };

  const handleBackgroundImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      setError('Моля, изберете изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Файлът е твърде голям (макс. 5MB)');
      return;
    }

    setError('');
    setSuccess('');
    setUploadingBackground(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;

      const { error } = await updateProfile(username, base64);

      if (error) {
        setError('Грешка при качване на фона');
      } else {
        setBackgroundImageUrl(base64);
        setSuccess('Фонът е променен успешно');
      }
      setUploadingBackground(false);
    };

    reader.onerror = () => {
      setError('Грешка при прочитане на файла');
      setUploadingBackground(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    setError('');
    setSuccess('');
    setUploadingBackground(true);

    const { error } = await updateProfile(username, null);

    if (error) {
      setError('Грешка при премахване на фона');
    } else {
      setBackgroundImageUrl('');
      setSuccess('Фонът е премахнат');
    }
    setUploadingBackground(false);
  };

  const handleRegisterNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setRegistering(true);

    if (!newUserEmail || !newUserPassword || !newUserUsername) {
      setError('Моля, попълнете всички полета');
      setRegistering(false);
      return;
    }

    if (newUserPassword.length < 6) {
      setError('Паролата трябва да бъде поне 6 символа');
      setRegistering(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: newUserEmail,
      password: newUserPassword,
      options: {
        data: {
          username: newUserUsername,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setRegistering(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: newUserUsername,
          email: newUserEmail,
        });

      if (profileError) {
        setError('Грешка при създаване на профил');
        setRegistering(false);
        return;
      }

      setSuccess('Новият потребител е регистриран успешно');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserUsername('');
      setShowRegisterForm(false);
    }

    setRegistering(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Моят профил</h1>

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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="text-gray-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Фон на страниците</h2>
          </div>

          <div className="space-y-4">
            {backgroundImageUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={backgroundImageUrl}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingBackground}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ImageIcon size={18} />
                {backgroundImageUrl ? 'Смени фона' : 'Качи фон'}
              </button>

              {backgroundImageUrl && (
                <button
                  onClick={handleRemoveBackground}
                  disabled={uploadingBackground}
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  <X size={18} />
                  Премахни
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageChange}
              className="hidden"
            />

            <p className="text-xs text-gray-500">JPG, PNG или WebP (макс. 5MB)</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-gray-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Информация за профила</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Потребителско име
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Имейл
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Имейлът не може да бъде променен</p>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {updating ? 'Запазване...' : 'Запази промените'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="text-gray-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Регистрация на нов потребител</h2>
          </div>

          {!showRegisterForm ? (
            <button
              onClick={() => setShowRegisterForm(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              <UserPlus size={18} />
              Регистрирай нов потребител
            </button>
          ) : (
            <form onSubmit={handleRegisterNewUser} className="space-y-4">
              <div>
                <label htmlFor="newUserUsername" className="block text-sm font-medium text-gray-700 mb-1">
                  Потребителско име
                </label>
                <input
                  id="newUserUsername"
                  type="text"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="newUserEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Имейл
                </label>
                <input
                  id="newUserEmail"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="newUserPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Парола
                </label>
                <input
                  id="newUserPassword"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  minLength={6}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Минимум 6 символа</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={registering}
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {registering ? 'Регистриране...' : 'Регистрирай'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(false);
                    setNewUserEmail('');
                    setNewUserPassword('');
                    setNewUserUsername('');
                  }}
                  disabled={registering}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Откажи
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-gray-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Промяна на парола</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Нова парола
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">Минимум 6 символа</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Потвърди нова парола
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {updating ? 'Промяна...' : 'Промени паролата'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package className="text-gray-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-800">Моите обяви</h2>
            </div>
            <Link
              to="/listings/new"
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              <Plus size={18} />
              Нова обява
            </Link>
          </div>

          {loadingListings ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Зареждане...</p>
            </div>
          ) : listings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Име</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Категория</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Цена</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Наличност</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Размер</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Начална страница</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((listing) => (
                    <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800 break-words">{listing.name}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {getCategoryLabel(listing.category)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-red-600">
                        {listing.price.toFixed(2)} {listing.currency}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            AVAILABILITY_BADGE_STYLES[listing.availability] || AVAILABILITY_BADGE_STYLES.in_stock
                          }`}
                        >
                          {getAvailabilityLabel(listing.availability)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {listing.size || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {listing.show_on_homepage ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Да
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Не
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/listings/edit/${listing.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Редактирай"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Сигурни ли сте, че искате да изтриете тази обява?')) {
                                handleDeleteListing(listing.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Изтрий"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {listings.length > itemsPerPage && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Предишна
                  </button>
                  <span className="text-sm text-gray-600">
                    Страница {currentPage} от {Math.ceil(listings.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(listings.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(listings.length / itemsPerPage)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Следваща
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Все още нямате създадени обяви.</p>
              <Link
                to="/listings/new"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
              >
                <Plus size={18} />
                Създай първата си обява
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

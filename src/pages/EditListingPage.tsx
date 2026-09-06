import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Listing } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ListingForm from '../components/ListingForm';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadListing();
  }, [id, user]);

  const loadListing = async () => {
    if (!id) {
      setError('Невалиден идентификатор на обява');
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !data) {
      setError('Обявата не е намерена');
      setLoading(false);
      return;
    }

    if (data.user_id !== user?.id) {
      setError('Нямате права да редактирате тази обява');
      setLoading(false);
      return;
    }

    setListing(data);
    setLoading(false);
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <ListingForm listing={listing} onSuccess={() => navigate('/profile')} />
      </div>
    </div>
  );
}

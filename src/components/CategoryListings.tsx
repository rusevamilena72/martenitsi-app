import { useEffect, useState } from 'react';
import { supabase, ListingWithImages, Category } from '../lib/supabase';
import ListingCard from './ListingCard';

interface CategoryListingsProps {
  category: Category;
}

export default function CategoryListings({ category }: CategoryListingsProps) {
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    setLoading(true);
    const { data: listingsData, error } = await supabase
      .from('listings')
      .select('*')
      .eq('category', category)
      .order('row_position', { ascending: true })
      .order('column_position', { ascending: true });

    if (!error && listingsData) {
      const listingsWithImages = await Promise.all(
        listingsData.map(async (listing) => {
          const { data: images } = await supabase
            .from('listing_images')
            .select('*')
            .eq('listing_id', listing.id)
            .order('position', { ascending: true });

          return { ...listing, images: images || [] };
        })
      );
      setListings(listingsWithImages);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadListings();
  }, [category]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Зареждане...</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Все още няма обяви в тази категория.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

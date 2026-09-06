import { useEffect, useState } from 'react';
import { supabase, ListingWithImages } from '../lib/supabase';
import ListingCard from '../components/ListingCard';

export default function HomePage() {
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeaturedListings = async () => {
    setLoading(true);
    const { data: listingsData, error } = await supabase
      .from('listings')
      .select('*')
      .eq('show_on_homepage', true)
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
    loadFeaturedListings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Добре дошли в нашия магазин за мартеници</h1>
        <p className="text-lg text-gray-600">Открийте уникални ръчно изработени мартеници за всеки вкус</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Зареждане...</p>
        </div>
      ) : listings.length > 0 ? (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Избрани продукти</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} showCategory={true} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Все още няма избрани продукти за началната страница.</p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase, ListingWithImages } from '../lib/supabase';
import ListingCard from '../components/ListingCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    const runSearch = async () => {
      if (!query.trim()) {
        setListings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: listingsData, error } = await supabase
        .from('listings')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

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

    runSearch();
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(inputValue ? { q: inputValue } : {});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Търсене</h1>

      <form onSubmit={handleSubmit} className="mb-8 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Търси по име или описание..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </form>

      {!query.trim() ? (
        <p className="text-gray-600">Въведи какво търсиш отгоре.</p>
      ) : loading ? (
        <p className="text-gray-600">Търсене...</p>
      ) : listings.length > 0 ? (
        <>
          <p className="text-gray-600 mb-6">
            Намерени резултати за „{query}“: {listings.length}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} showCategory={true} />
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-600">Няма намерени резултати за „{query}“.</p>
      )}
    </div>
  );
}

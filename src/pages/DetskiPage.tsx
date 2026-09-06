import CategoryListings from '../components/CategoryListings';

export default function DetskiPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Детски</h1>
      <CategoryListings category="detski" />
    </div>
  );
}

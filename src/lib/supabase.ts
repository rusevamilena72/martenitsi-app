import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  email: string;
  background_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = 'komplekti' | 'unikalni' | 'grivni' | 'cvetya' | 'zhivotni' | 'detski' | 'gerdani';

export type Currency = 'лв.' | 'EUR';

export type Listing = {
  id: string;
  user_id: string;
  category: Category;
  name: string;
  description: string;
  size: string | null;
  price: number;
  currency: Currency;
  row_position: number;
  column_position: number;
  show_on_homepage: boolean;
  created_at: string;
  updated_at: string;
};

export type ListingImage = {
  id: string;
  listing_id: string;
  image_data: string;
  mime_type: string;
  position: number;
  is_primary: boolean;
  created_at: string;
};

export type ListingWithImages = Listing & {
  images?: ListingImage[];
};

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'komplekti', label: 'Комплекти' },
  { value: 'unikalni', label: 'Уникални' },
  { value: 'grivni', label: 'Гривни' },
  { value: 'cvetya', label: 'Цветя' },
  { value: 'zhivotni', label: 'Животни' },
  { value: 'detski', label: 'Детски' },
  { value: 'gerdani', label: 'Гердани' },
];

export const getCategoryLabel = (category: Category): string => {
  const cat = CATEGORIES.find((c) => c.value === category);
  return cat ? cat.label : category;
};

export const getCategoryPath = (category: Category): string => {
  return `/${category}`;
};

export const CURRENCIES: Currency[] = ['лв.', 'EUR'];

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const MAX_IMAGE_SIZE = 1024 * 1024;
export const MAX_IMAGES = 5;

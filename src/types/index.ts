import type { Database } from './supabase';

export type Product = Database['public']['Tables']['products']['Row'] & {
  location?: StoreLocation;
};

export type StoreLocation = Database['public']['Tables']['store_locations']['Row'];

export type WeeklyShop = Database['public']['Tables']['weekly_shops']['Row'] & {
  items: (Database['public']['Tables']['weekly_shop_items']['Row'] & {
    product?: Product;
  })[];
};

export type WeeklyShopItem = Database['public']['Tables']['weekly_shop_items']['Row'] & {
  product?: Product;
};
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          store_location_id: string;
          shelf_height: 'top' | 'middle' | 'bottom';
          typical_price: number | null;
          notes: string | null;
          sequence_number: number;
          created_at: string;
          product_url: string | null;
          image_url: string | null;
          barcode: string | null;
          default_quantity: number;
          aliases: string[] | null;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      store_locations: {
        Row: {
          id: string;
          name: string;
          sequence_number: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['store_locations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['store_locations']['Insert']>;
      };
      weekly_shops: {
        Row: {
          id: string;
          shop_date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['weekly_shops']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['weekly_shops']['Insert']>;
      };
      weekly_shop_items: {
        Row: {
          id: string;
          weekly_shop_id: string;
          product_id: string;
          quantity: number;
          max_price: number | null;
          notes: string | null;
          status: 'required' | 'bought' | 'unavailable';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['weekly_shop_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['weekly_shop_items']['Insert']>;
      };
    };
    Functions: {
      search_products: {
        Args: { search_term: string };
        Returns: Database['public']['Tables']['products']['Row'][];
      };
    };
  };
}
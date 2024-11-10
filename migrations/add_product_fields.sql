-- Add new columns to products table
ALTER TABLE products
ADD COLUMN product_url TEXT,
ADD COLUMN image_url TEXT,
ADD COLUMN barcode TEXT,
ADD COLUMN default_quantity INTEGER NOT NULL DEFAULT 1,
ADD COLUMN aliases TEXT[];

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode 
  ON products(barcode);

CREATE INDEX IF NOT EXISTS idx_products_aliases 
  ON products USING GIN (aliases);

-- Create or replace the search function to include aliases
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.*
  FROM products p
  WHERE 
    p.name ILIKE '%' || search_term || '%'
    OR EXISTS (
      SELECT 1 
      FROM unnest(p.aliases) alias 
      WHERE alias ILIKE '%' || search_term || '%'
    );
END;
$$ LANGUAGE plpgsql;


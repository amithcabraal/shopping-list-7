-- Add aliases column to products table
ALTER TABLE products
ADD COLUMN aliases TEXT[];

-- Create a GIN index for faster searching through arrays
CREATE INDEX idx_products_aliases ON products USING GIN (aliases);

-- Update the search function to include aliases
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
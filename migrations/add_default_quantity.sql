-- Add default_quantity column to products table
ALTER TABLE products
ADD COLUMN default_quantity INTEGER NOT NULL DEFAULT 1;

-- Update some example products with default quantities
UPDATE products
SET default_quantity = 6
WHERE name ILIKE '%banana%';

UPDATE products
SET default_quantity = 2
WHERE name ILIKE '%cucumber%';
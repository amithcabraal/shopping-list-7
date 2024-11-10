-- Drop existing triggers
drop trigger if exists on_shop_item_change on weekly_shop_items;

-- Drop existing functions
drop function if exists handle_new_shop_item();

-- Drop existing tables (in correct order due to dependencies)
drop table if exists weekly_shop_items;
drop table if exists weekly_shops;
drop table if exists products;
drop table if exists store_locations;

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Store Locations Table
create table if not exists store_locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sequence_number integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique sequence numbers
  constraint unique_sequence_number unique (sequence_number)
);

-- Create index for faster sorting
create index if not exists idx_store_locations_sequence_number 
  on store_locations(sequence_number);

-- Products Table
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  store_location_id uuid references store_locations(id) on delete restrict not null,
  shelf_height text check (shelf_height in ('top', 'middle', 'bottom')) not null,
  typical_price decimal(10,2),
  notes text,
  sequence_number integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique names within the same location
  constraint unique_product_name_per_location unique (name, store_location_id)
);

-- Create indexes for faster lookups and sorting
create index if not exists idx_products_name 
  on products(name);
create index if not exists idx_products_store_location 
  on products(store_location_id);
create index if not exists idx_products_sequence_number 
  on products(sequence_number);

-- Weekly Shops Table
create table if not exists weekly_shops (
  id uuid primary key default uuid_generate_v4(),
  shop_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for date-based queries
create index if not exists idx_weekly_shops_date 
  on weekly_shops(shop_date desc);

-- Weekly Shop Items Table
create table if not exists weekly_shop_items (
  id uuid primary key default uuid_generate_v4(),
  weekly_shop_id uuid references weekly_shops(id) on delete cascade not null,
  product_id uuid references products(id) on delete restrict not null,
  quantity integer not null default 1 check (quantity > 0),
  max_price decimal(10,2),
  notes text,
  status text check (status in ('required', 'bought', 'unavailable')) not null default 'required',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique products within the same shop
  constraint unique_product_per_shop unique (weekly_shop_id, product_id)
);

-- Create indexes for faster lookups and filtering
create index if not exists idx_weekly_shop_items_shop 
  on weekly_shop_items(weekly_shop_id);
create index if not exists idx_weekly_shop_items_product 
  on weekly_shop_items(product_id);
create index if not exists idx_weekly_shop_items_status 
  on weekly_shop_items(status);

-- Enable Row Level Security (RLS)
alter table store_locations enable row level security;
alter table products enable row level security;
alter table weekly_shops enable row level security;
alter table weekly_shop_items enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable read access for all users" on store_locations;
drop policy if exists "Enable read access for all users" on products;
drop policy if exists "Enable read access for all users" on weekly_shops;
drop policy if exists "Enable read access for all users" on weekly_shop_items;
drop policy if exists "Enable insert access for all users" on weekly_shops;
drop policy if exists "Enable insert access for all users" on weekly_shop_items;
drop policy if exists "Enable update access for all users" on weekly_shop_items;
drop policy if exists "Enable insert access for all users" on products;
drop policy if exists "Enable update access for all users" on products;
drop policy if exists "Enable delete access for all users" on products;
drop policy if exists "Enable insert access for all users" on store_locations;
drop policy if exists "Enable update access for all users" on store_locations;
drop policy if exists "Enable delete access for all users" on store_locations;

-- Create new policies for public access
create policy "Enable all access for all users" on store_locations
  for all using (true) with check (true);

create policy "Enable all access for all users" on products
  for all using (true) with check (true);

create policy "Enable all access for all users" on weekly_shops
  for all using (true) with check (true);

create policy "Enable all access for all users" on weekly_shop_items
  for all using (true) with check (true);

-- Create function for real-time subscriptions
create or replace function handle_new_shop_item() 
returns trigger as $$
begin
  perform pg_notify(
    'shop_changes',
    json_build_object(
      'type', tg_op,
      'record', row_to_json(new)
    )::text
  );
  return new;
end;
$$ language plpgsql;

-- Create trigger for real-time updates
create trigger on_shop_item_change
  after insert or update or delete
  on weekly_shop_items
  for each row
  execute function handle_new_shop_item();

-- Insert some initial store locations
insert into store_locations (name, sequence_number) values
  ('Produce', 1),
  ('Dairy', 2),
  ('Meat', 3),
  ('Bakery', 4),
  ('Pantry', 5),
  ('Frozen', 6),
  ('Beverages', 7),
  ('Household', 8)
on conflict (sequence_number) do nothing;
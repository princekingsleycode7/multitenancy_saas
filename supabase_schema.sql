# DigiKing POS Supabase Schema

-- 1. tenants
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text UNIQUE NOT NULL,
  business_name text NOT NULL,
  plan text DEFAULT 'starter',
  currency text DEFAULT 'NGN',
  tax_rate numeric DEFAULT 7.5,
  receipt_footer text,
  logo_url text,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON tenants USING (org_id = (auth.jwt() ->> 'org_code'));

-- 2. products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  outlet_id uuid REFERENCES outlet_settings(id),
  name text NOT NULL,
  price numeric NOT NULL,
  cost_price numeric,
  stock integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  category_id uuid,
  barcode text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON products USING (org_id = (auth.jwt() ->> 'org_code'));

-- 3. categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  name text NOT NULL,
  color text
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON categories USING (org_id = (auth.jwt() ->> 'org_code'));

-- 4. sales
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  outlet_id uuid REFERENCES outlet_settings(id),
  cashier_id text NOT NULL,
  cashier_name text,
  subtotal numeric NOT NULL,
  tax_amount numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  total numeric NOT NULL,
  payment_method text,
  payment_ref text,
  customer_id uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON sales USING (org_id = (auth.jwt() ->> 'org_code'));
-- Cashier can only see their own sales
CREATE POLICY "cashier_select" ON sales FOR SELECT USING (org_id = (auth.jwt() ->> 'org_code') AND (cashier_id = auth.uid() OR (auth.jwt() ->> 'role') IN ('owner', 'manager')));

-- 5. sale_items
CREATE TABLE sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id),
  org_id text NOT NULL,
  product_id uuid REFERENCES products(id),
  product_name text,
  qty integer NOT NULL,
  unit_price numeric NOT NULL,
  line_total numeric NOT NULL
);
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON sale_items USING (org_id = (auth.jwt() ->> 'org_code'));

-- 6. customers
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  total_spend numeric DEFAULT 0,
  visit_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON customers USING (org_id = (auth.jwt() ->> 'org_code'));

-- 7. staff_profiles
CREATE TABLE staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  outlet_id uuid REFERENCES outlet_settings(id),
  kinde_user_id text UNIQUE NOT NULL,
  email text NOT NULL,
  full_name text,
  role text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON staff_profiles USING (org_id = (auth.jwt() ->> 'org_code'));

-- 8. outlet_settings
CREATE TABLE outlet_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  slug text NOT NULL,
  outlet_name text NOT NULL,
  address text,
  phone text,
  opens_at time,
  closes_at time,
  UNIQUE(org_id, slug)
);
ALTER TABLE outlet_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON outlet_settings USING (org_id = (auth.jwt() ->> 'org_code'));

-- 9. audit_log
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  user_id text NOT NULL,
  action text NOT NULL,
  details jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON audit_log USING (org_id = (auth.jwt() ->> 'org_code'));

-- 11. outlet_stock
CREATE TABLE outlet_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  outlet_id uuid REFERENCES outlet_settings(id),
  product_id uuid REFERENCES products(id),
  stock integer DEFAULT 0
);
ALTER TABLE outlet_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON outlet_stock USING (org_id = (auth.jwt() ->> 'org_code'));

-- 12. rate_limit
CREATE TABLE rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE rate_limit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON rate_limit USING (org_id = (auth.jwt() ->> 'org_code'));

-- 13. errors
CREATE TABLE errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text,
  user_id text,
  error_message text,
  stack text,
  url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON errors USING (org_id = (auth.jwt() ->> 'org_code'));

-- 14. decrement_stock RPC
CREATE OR REPLACE FUNCTION decrement_stock(p_id uuid, o_id uuid, qty integer)
RETURNS void AS $$
BEGIN
  UPDATE outlet_stock
  SET stock = stock - qty
  WHERE product_id = p_id AND outlet_id = o_id;
END;
$$ LANGUAGE plpgsql;

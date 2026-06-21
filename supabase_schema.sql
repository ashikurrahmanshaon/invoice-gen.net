-- Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_email TEXT,
  company_phone TEXT,
  company_address TEXT,
  logo_url TEXT,
  currency TEXT DEFAULT 'USD',
  is_premium BOOLEAN DEFAULT FALSE,
  brand_color TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Clients Table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Invoices Table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  issue_date DATE,
  due_date DATE,
  currency TEXT DEFAULT 'USD',
  tax_rate NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  discount_rate NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Invoice Items Table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  amount NUMERIC NOT NULL
);

-- Create Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  payment_method TEXT,
  notes TEXT
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own invoice items" ON invoice_items FOR ALL USING (
  invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own payments" ON payments FOR ALL USING (
  invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
);

-- Create enum for barcode types
CREATE TYPE public.barcode_type AS ENUM ('UPC-A', 'EAN-13');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'completed', 'refunded');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Create profiles table for customer information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  contact_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  postal_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create barcode_packs table for pricing tiers
CREATE TABLE public.barcode_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  barcode_type barcode_type NOT NULL,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on barcode_packs
ALTER TABLE public.barcode_packs ENABLE ROW LEVEL SECURITY;

-- Create barcode_ranges table for tracking sold ranges
CREATE TABLE public.barcode_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_number TEXT NOT NULL,
  end_number TEXT NOT NULL,
  barcode_type barcode_type NOT NULL,
  is_sold BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on barcode_ranges
ALTER TABLE public.barcode_ranges ENABLE ROW LEVEL SECURITY;

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id UUID REFERENCES public.barcode_packs(id),
  quantity INT NOT NULL,
  barcode_type barcode_type NOT NULL,
  start_number TEXT NOT NULL,
  end_number TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  certificate_number TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create order_barcodes table for individual barcode assignments
CREATE TABLE public.order_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  barcode_number TEXT NOT NULL UNIQUE,
  barcode_type barcode_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on order_barcodes
ALTER TABLE public.order_barcodes ENABLE ROW LEVEL SECURITY;

-- Create GEPIR registry table for public barcode lookup
CREATE TABLE public.gepir_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode_number TEXT NOT NULL UNIQUE,
  barcode_type barcode_type NOT NULL,
  company_name TEXT NOT NULL,
  company_contact TEXT,
  country TEXT,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL
);

-- Enable RLS on gepir_registry
ALTER TABLE public.gepir_registry ENABLE ROW LEVEL SECURITY;

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  barcodes TEXT[] NOT NULL,
  barcode_type barcode_type NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for barcode_packs (public read)
CREATE POLICY "Anyone can view active packs"
  ON public.barcode_packs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage packs"
  ON public.barcode_packs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for barcode_ranges
CREATE POLICY "Admins can manage ranges"
  ON public.barcode_ranges FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for order_barcodes
CREATE POLICY "Users can view their own barcodes"
  ON public.order_barcodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_barcodes.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all barcodes"
  ON public.order_barcodes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for GEPIR registry (public read)
CREATE POLICY "Anyone can view public registry entries"
  ON public.gepir_registry FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins can manage registry"
  ON public.gepir_registry FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for certificates
CREATE POLICY "Users can view their own certificates"
  ON public.certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = certificates.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all certificates"
  ON public.certificates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default barcode packs
INSERT INTO public.barcode_packs (name, quantity, price, barcode_type, description) VALUES
  ('Starter Pack', 1, 29.99, 'UPC-A', 'Perfect for testing or single products'),
  ('Small Business', 5, 99.99, 'UPC-A', 'Great for small product lines'),
  ('Business', 10, 179.99, 'UPC-A', 'Popular choice for growing businesses'),
  ('Professional', 25, 349.99, 'UPC-A', 'Best value for established brands'),
  ('Enterprise', 50, 599.99, 'UPC-A', 'Bulk pricing for large catalogs'),
  ('Corporate', 100, 999.99, 'UPC-A', 'Maximum savings for enterprises'),
  ('EAN Starter', 1, 34.99, 'EAN-13', 'Single EAN-13 for international sales'),
  ('EAN Business', 10, 199.99, 'EAN-13', 'EAN-13 pack for global distribution'),
  ('EAN Enterprise', 50, 699.99, 'EAN-13', 'Bulk EAN-13 for international brands');

-- Generate initial barcode range (example: 1 million UPC-A barcodes)
INSERT INTO public.barcode_ranges (start_number, end_number, barcode_type) VALUES
  ('00000000000', '00099999999', 'UPC-A'),
  ('0000000000000', '0009999999999', 'EAN-13');
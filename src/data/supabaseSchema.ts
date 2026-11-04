export const SUPABASE_SQL_SCHEMA = `-- AgenMate Mobile CRM Properti - Supabase PostgreSQL Schema
-- Multi-tenant Row-Level-Security (RLS) & Role-based Approvals

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE client_segment AS ENUM ('buyer', 'tenant', 'seller', 'landlord');
CREATE TYPE property_type AS ENUM (
  'Rumah Tapak / Cluster',
  'Apartemen / Kondominium',
  'Ruko / Komersial',
  'Villa Tropis',
  'Tanah / Kavling',
  'Gudang / Industri'
);
CREATE TYPE legal_certificate AS ENUM (
  'SHM (Sertifikat Hak Milik)',
  'HGB (Hak Guna Bangunan)',
  'Strata Title',
  'Girik / AJB',
  'PPJB Lunas'
);
CREATE TYPE property_status AS ENUM ('available', 'under_offer', 'sold', 'rented');
CREATE TYPE pipeline_stage AS ENUM ('new_lead', 'site_visit', 'negotiation', 'booking_fee', 'closed_won');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. USER PROFILES TABLE (Multi-Tier Role Hierarchy)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  status user_status DEFAULT 'pending' NOT NULL,
  agency_name TEXT NOT NULL,
  license_number TEXT,
  city TEXT NOT NULL,
  avatar_url TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  segment client_segment DEFAULT 'buyer' NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'nurturing', 'inactive')),
  preferred_locations TEXT[] DEFAULT '{}',
  preferred_types TEXT[] DEFAULT '{}',
  budget_min BIGINT DEFAULT 0,
  budget_max BIGINT DEFAULT 0,
  payment_preference TEXT DEFAULT 'KPR Bank',
  notes TEXT,
  source TEXT DEFAULT 'WhatsApp',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_contacted_at DATE,
  next_follow_up_date DATE
);

-- 4. PROPERTIES (INVENTORY) TABLE
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  property_type property_type NOT NULL,
  certificate_type legal_certificate DEFAULT 'SHM (Sertifikat Hak Milik)' NOT NULL,
  price BIGINT NOT NULL,
  listing_type TEXT DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent')),
  status property_status DEFAULT 'available' NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area_land_sqft NUMERIC DEFAULT 0, -- LT (m²)
  area_building_sqft NUMERIC DEFAULT 0, -- LB (m²)
  commission_rate NUMERIC(4, 2) DEFAULT 2.50,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  image_url TEXT,
  svg_preset TEXT DEFAULT 'condo' CHECK (svg_preset IN ('condo', 'villa', 'townhouse', 'penthouse')),
  seller_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  seller_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. DEALS (PIPELINE) TABLE
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  stage pipeline_stage DEFAULT 'new_lead' NOT NULL,
  deal_value BIGINT NOT NULL,
  estimated_commission BIGINT NOT NULL,
  probability_percent INTEGER DEFAULT 25,
  target_closing_date DATE,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  booking_fee_amount BIGINT DEFAULT 0,
  payment_method TEXT DEFAULT 'KPR Bank',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. SITE VISITS TABLE
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  visit_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  interest_score SMALLINT DEFAULT 4 CHECK (interest_score BETWEEN 1 AND 5),
  feedback TEXT NOT NULL,
  agreed_next_step TEXT,
  next_follow_up_date DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. FOLLOW UP REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  property_title TEXT,
  due_date DATE NOT NULL,
  priority TEXT DEFAULT 'high' CHECK (priority IN ('high', 'medium', 'low')),
  note TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  type TEXT DEFAULT 'whatsapp' CHECK (type IN ('call', 'whatsapp', 'viewing', 'contract')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Super Admin Lock: Only ochasyamsiah16@gmail.com has global unrestricted access
CREATE POLICY "super_admin_all_profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND email = 'ochasyamsiah16@gmail.com'
    )
  );

-- Standard Users / Admins: Access own profile
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
  FOR ALL USING (id = auth.uid());

-- Operational Data RLS: ONLY APPROVED agents/admins can manage operational data!
-- (Users in 'pending' status are blocked at the PostgreSQL database level)
CREATE POLICY "agents_manage_own_clients" ON public.clients
  FOR ALL USING (
    agent_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "agents_manage_own_properties" ON public.properties
  FOR ALL USING (
    agent_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "agents_manage_own_deals" ON public.deals
  FOR ALL USING (
    agent_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "agents_manage_own_site_visits" ON public.site_visits
  FOR ALL USING (
    agent_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "agents_manage_own_follow_ups" ON public.follow_ups
  FOR ALL USING (
    agent_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND status = 'approved')
  );
`;

export const VERCEL_DEPLOY_GUIDE = `# Panduan Deployment AgenMate CRM ke Vercel (Produksi 24/7)

## 1. Hubungkan Repositori GitHub
1. Pastikan seluruh berkas telah di-commit ke Git.
2. Buka dashboard Vercel (https://vercel.com) dan klik "Add New" -> "Project".
3. Pilih repository \`agenmate-crm\`.

## 2. Atur Environment Variables
Di menu Settings -> Environment Variables, tambahkan:
- \`VITE_SUPABASE_URL\` = URL project Supabase Anda
- \`VITE_SUPABASE_ANON_KEY\` = Kunci anonim Supabase Anda
- \`GEMINI_API_KEY\` = (Opsional) Google Gemini API Key untuk asisten AI properti

## 3. Konfigurasi Build & Output
- Framework Preset: Vite
- Build Command: \`npm run build\`
- Output Directory: \`dist\`
- Install Command: \`npm install\`

## 4. Akses Mobile & PWA
Agen dapat langsung membuka URL deployment di browser HP (Safari iOS / Chrome Android), kemudian ketuk "Add to Home Screen" untuk tampilan mobile layaknya aplikasi native.
`;

/*
# Smart Village Management System - Core Schema

## Overview
Creates the complete database schema for the AI-Based Smart Village Management System (Digital Twin Village).
This is a multi-user application with two roles: citizens (residents) and administrators (village authority staff).
Citizens register, submit complaints with map locations and photos, and track complaint status.
Administrators manage complaints, water tanks, and garbage bins, and view analytics dashboards.

## New Tables

1. `profiles` — extends Supabase auth.users with application-specific user data.
   - `id` (uuid, PK, references auth.users) — links to the auth account.
   - `full_name` (text) — user's display name.
   - `phone` (text) — contact phone number.
   - `role` (text: 'citizen' | 'admin') — default 'citizen'.
   - `created_at` (timestamptz).

2. `complaints` — public issue reports submitted by citizens.
   - `id`, `user_id`, `title`, `category`, `priority`, `description`, `image_url`,
     `latitude`, `longitude`, `location_label`, `status`,
     `ai_category`, `ai_confidence`, `admin_notes`, `created_at`, `updated_at`.

3. `water_tanks` — village water tank inventory and monitoring.
   - `id`, `name`, `location_label`, `latitude`, `longitude`,
     `capacity_liters`, `current_level_liters`, `created_at`, `updated_at`.

4. `garbage_bins` — village garbage bin inventory and fill monitoring.
   - `id`, `name`, `location_label`, `latitude`, `longitude`,
     `capacity_liters`, `current_level_liters`, `created_at`, `updated_at`.

## Security
- RLS enabled on all tables.
- `profiles`: each authenticated user can read/update only their own profile.
- `complaints`: all authenticated users can read (community visibility); citizens insert/update own;
  admins can update/delete any complaint.
- `water_tanks`, `garbage_bins`: all authenticated users can read; only admins can insert/update/delete.
- Admin status is determined via `is_admin()` SQL function checking the profiles table.

## Notes
1. `is_admin()` is SECURITY DEFINER so it can read profiles regardless of caller RLS context.
2. `user_id` columns default to `auth.uid()` so inserts omitting the owner still satisfy policy checks.
3. `updated_at` triggers keep the timestamp current on row changes.
4. Auto-create profile trigger fires on new auth.users signup.
5. Functions created BEFORE policies that reference them to avoid "function does not exist" errors.
*/

-- ============ SECTION 1: TABLES (no RLS yet, no policy references) ============

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('road_damage','garbage_overflow','water_leakage','street_light','drainage','other')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  description text DEFAULT '',
  image_url text,
  latitude numeric,
  longitude numeric,
  location_label text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved','rejected')),
  ai_category text,
  ai_confidence numeric,
  admin_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.water_tanks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_label text DEFAULT '',
  latitude numeric,
  longitude numeric,
  capacity_liters integer NOT NULL DEFAULT 10000,
  current_level_liters integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.garbage_bins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_label text DEFAULT '',
  latitude numeric,
  longitude numeric,
  capacity_liters integer NOT NULL DEFAULT 500,
  current_level_liters integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ SECTION 2: FUNCTIONS (created before policies) ============

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ SECTION 3: RLS + POLICIES ============

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_complaints" ON public.complaints;
CREATE POLICY "select_complaints" ON public.complaints FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_complaints" ON public.complaints;
CREATE POLICY "insert_own_complaints" ON public.complaints FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_complaints" ON public.complaints;
CREATE POLICY "update_complaints" ON public.complaints FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "delete_complaints" ON public.complaints;
CREATE POLICY "delete_complaints" ON public.complaints FOR DELETE
  TO authenticated USING (public.is_admin());

-- water_tanks
ALTER TABLE public.water_tanks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_water_tanks" ON public.water_tanks;
CREATE POLICY "select_water_tanks" ON public.water_tanks FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_water_tanks" ON public.water_tanks;
CREATE POLICY "insert_water_tanks" ON public.water_tanks FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_water_tanks" ON public.water_tanks;
CREATE POLICY "update_water_tanks" ON public.water_tanks FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_water_tanks" ON public.water_tanks;
CREATE POLICY "delete_water_tanks" ON public.water_tanks FOR DELETE
  TO authenticated USING (public.is_admin());

-- garbage_bins
ALTER TABLE public.garbage_bins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_garbage_bins" ON public.garbage_bins;
CREATE POLICY "select_garbage_bins" ON public.garbage_bins FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_garbage_bins" ON public.garbage_bins;
CREATE POLICY "insert_garbage_bins" ON public.garbage_bins FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_garbage_bins" ON public.garbage_bins;
CREATE POLICY "update_garbage_bins" ON public.garbage_bins FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_garbage_bins" ON public.garbage_bins;
CREATE POLICY "delete_garbage_bins" ON public.garbage_bins FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============ SECTION 4: TRIGGERS + INDEXES ============

DROP TRIGGER IF EXISTS complaints_updated_at ON public.complaints;
CREATE TRIGGER complaints_updated_at BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS water_tanks_updated_at ON public.water_tanks;
CREATE TRIGGER water_tanks_updated_at BEFORE UPDATE ON public.water_tanks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS garbage_bins_updated_at ON public.garbage_bins;
CREATE TRIGGER garbage_bins_updated_at BEFORE UPDATE ON public.garbage_bins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);

-- ============ SECTION 5: STORAGE ============

INSERT INTO storage.buckets (id, name, public)
VALUES ('complaints', 'complaints', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "read_complaint_images" ON storage.objects;
CREATE POLICY "read_complaint_images" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'complaints');

DROP POLICY IF EXISTS "insert_complaint_images" ON storage.objects;
CREATE POLICY "insert_complaint_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'complaints');

DROP POLICY IF EXISTS "update_complaint_images" ON storage.objects;
CREATE POLICY "update_complaint_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'complaints');

DROP POLICY IF EXISTS "delete_complaint_images" ON storage.objects;
CREATE POLICY "delete_complaint_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'complaints');

-- ============ SECTION 6: AUTO-PROFILE TRIGGER ============

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
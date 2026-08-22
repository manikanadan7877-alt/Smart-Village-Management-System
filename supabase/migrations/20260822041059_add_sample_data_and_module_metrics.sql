/*
# Add Sample Data and Module Metrics Table

1. Sample Data
   - Insert 5 sample water tanks into water_tanks table
   - Insert 6 sample garbage bins into garbage_bins table
   - Uses ON CONFLICT DO NOTHING to prevent duplicates on re-run

2. New Table: module_metrics
   - Stores editable key-value metrics for Agriculture, Education, Healthcare, Infrastructure modules
   - Allows admin to persist edits to feature values and status rows
   - Columns: id, module (text), metric_key (text), metric_value (text), updated_at
   - Unique constraint on (module, metric_key) to prevent duplicates

3. Security
   - RLS enabled on module_metrics
   - All authenticated users can SELECT (view data)
   - Only admin users can INSERT/UPDATE/DELETE (enforced via profile role check)
*/

-- Insert sample water tanks (idempotent via ON CONFLICT)
INSERT INTO water_tanks (name, location_label, latitude, longitude, capacity_liters, current_level_liters)
VALUES
  ('Main Village Water Tank', 'Village Main Area', 13.0860, 80.2750, 10000, 7800),
  ('North Street Water Tank', 'North Street', 13.0870, 80.2740, 7500, 4650),
  ('School Area Water Tank', 'Government School Area', 13.0850, 80.2760, 5000, 2250),
  ('East Colony Water Tank', 'East Colony', 13.0855, 80.2775, 8000, 2480),
  ('Agricultural Water Tank', 'Agricultural Field Area', 13.0840, 80.2730, 12000, 10320)
ON CONFLICT DO NOTHING;

-- Insert sample garbage bins (idempotent via ON CONFLICT)
INSERT INTO garbage_bins (name, location_label, latitude, longitude, capacity_liters, current_level_liters)
VALUES
  ('GB-001', 'Village Main Road', 13.0860, 80.2750, 100, 72),
  ('GB-002', 'Bus Stand', 13.0865, 80.2755, 100, 45),
  ('GB-003', 'Government School', 13.0850, 80.2760, 100, 28),
  ('GB-004', 'Market Area', 13.0862, 80.2745, 100, 91),
  ('GB-005', 'North Street', 13.0870, 80.2740, 100, 56),
  ('GB-006', 'East Colony', 13.0855, 80.2775, 100, 38)
ON CONFLICT DO NOTHING;

-- Create module_metrics table for persisting admin edits
CREATE TABLE IF NOT EXISTS module_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  metric_key text NOT NULL,
  metric_value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE module_metrics ENABLE ROW LEVEL SECURITY;

-- Unique constraint to prevent duplicate metric entries
CREATE UNIQUE INDEX IF NOT EXISTS module_metrics_module_metric_key_idx
  ON module_metrics (module, metric_key);

-- All authenticated users can read
DROP POLICY IF EXISTS "read_module_metrics" ON module_metrics;
CREATE POLICY "read_module_metrics" ON module_metrics FOR SELECT
  TO authenticated USING (true);

-- Only admins can insert/update/delete (checked via profiles table)
DROP POLICY IF EXISTS "admin_insert_module_metrics" ON module_metrics;
CREATE POLICY "admin_insert_module_metrics" ON module_metrics FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_update_module_metrics" ON module_metrics;
CREATE POLICY "admin_update_module_metrics" ON module_metrics FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_delete_module_metrics" ON module_metrics;
CREATE POLICY "admin_delete_module_metrics" ON module_metrics FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

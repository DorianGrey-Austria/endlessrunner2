-- Create table for error logging in Supabase
-- This table stores JavaScript errors, CSP violations, and resource loading failures
-- GDPR compliant - no personal data is stored

CREATE TABLE IF NOT EXISTS subway_runner_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  error_type VARCHAR(50) NOT NULL, -- 'javascript', 'csp', 'resource', 'promise'
  message TEXT NOT NULL,
  stack TEXT,
  source_url TEXT,
  line_number INTEGER,
  column_number INTEGER,
  user_agent TEXT,
  game_version VARCHAR(20),
  session_id UUID,
  -- Context data (GDPR compliant - no personal info)
  browser_info JSONB,
  game_state JSONB,
  performance_metrics JSONB
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_errors_created_at ON subway_runner_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_errors_type ON subway_runner_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_version ON subway_runner_errors(game_version);

-- Grant access for the service (adjust based on your Supabase setup)
GRANT ALL ON subway_runner_errors TO authenticated;
GRANT ALL ON subway_runner_errors TO service_role;

-- Optional: Add Row Level Security (RLS) policies
ALTER TABLE subway_runner_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert for everyone (errors can be logged without auth)
CREATE POLICY "Anyone can insert errors" ON subway_runner_errors
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Only service role can read errors (for Claude API access)
CREATE POLICY "Only service role can read errors" ON subway_runner_errors
  FOR SELECT
  TO service_role
  USING (true);

-- Create a function to automatically delete old errors (30 days retention)
CREATE OR REPLACE FUNCTION delete_old_errors()
RETURNS void AS $$
BEGIN
  DELETE FROM subway_runner_errors
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule the cleanup function (requires pg_cron extension)
-- Note: You may need to enable pg_cron in Supabase dashboard
-- SELECT cron.schedule('delete-old-errors', '0 3 * * *', 'SELECT delete_old_errors();');
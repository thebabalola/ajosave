-- BaseSafe Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create pools table
CREATE TABLE IF NOT EXISTS pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('rotational', 'target', 'flexible')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  creator_address TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  total_saved NUMERIC(18, 8) DEFAULT 0,
  target_amount NUMERIC(18, 8),
  progress NUMERIC(5, 2) DEFAULT 0,
  members_count INTEGER DEFAULT 0,
  next_payout TIMESTAMPTZ,
  next_recipient TEXT,
  contribution_amount NUMERIC(18, 8),
  round_duration INTEGER,
  frequency TEXT,
  deadline TIMESTAMPTZ,
  minimum_deposit NUMERIC(18, 8),
  withdrawal_fee NUMERIC(18, 8),
  yield_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pool_members table
CREATE TABLE IF NOT EXISTS pool_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  member_address TEXT NOT NULL,
  contribution_amount NUMERIC(18, 8) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pool_id, member_address)
);

-- Create pool_activity table
CREATE TABLE IF NOT EXISTS pool_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  user_address TEXT,
  amount NUMERIC(18, 8),
  description TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pools_creator ON pools(creator_address);
CREATE INDEX IF NOT EXISTS idx_pools_status ON pools(status);
CREATE INDEX IF NOT EXISTS idx_pools_type ON pools(type);
CREATE INDEX IF NOT EXISTS idx_pool_members_pool_id ON pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_address ON pool_members(member_address);
CREATE INDEX IF NOT EXISTS idx_pool_activity_pool_id ON pool_activity(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_activity_created_at ON pool_activity(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_pools_updated_at 
  BEFORE UPDATE ON pools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (adjust based on your needs)
-- For pools: allow public read, authenticated write
CREATE POLICY "Allow public read access for pools" 
  ON pools FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated insert for pools" 
  ON pools FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update for pools" 
  ON pools FOR UPDATE 
  USING (true);

-- For pool_members: allow public read, authenticated write
CREATE POLICY "Allow public read access for pool_members" 
  ON pool_members FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated insert for pool_members" 
  ON pool_members FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update for pool_members" 
  ON pool_members FOR UPDATE 
  USING (true);

-- For pool_activity: allow public read, authenticated insert
CREATE POLICY "Allow public read access for pool_activity" 
  ON pool_activity FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated insert for pool_activity" 
  ON pool_activity FOR INSERT 
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE pools IS 'Stores information about savings pools/groups';
COMMENT ON TABLE pool_members IS 'Stores members of each pool';
COMMENT ON TABLE pool_activity IS 'Stores activity log for each pool';


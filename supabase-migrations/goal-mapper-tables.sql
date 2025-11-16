-- Goal Mapper App Tables Migration
-- Run this in your Supabase SQL Editor

-- Create goal_maps table (stores different goal maps a user can have)
CREATE TABLE IF NOT EXISTS goal_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  map_id TEXT NOT NULL,
  map_name TEXT NOT NULL DEFAULT 'My Goal Map',
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  backup_date TIMESTAMPTZ,
  UNIQUE(user_id, map_id)
);

-- Create goal_map_nodes table (stores all nodes: goals, milestones, requirements, notes)
CREATE TABLE IF NOT EXISTS goal_map_nodes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  map_id TEXT NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('goalCard', 'milestoneCard', 'requirementCard', 'noteCard')),

  -- Position
  position_x REAL NOT NULL,
  position_y REAL NOT NULL,

  -- Dimensions
  width INTEGER,
  height INTEGER,

  -- State
  selected BOOLEAN DEFAULT FALSE,
  dragging BOOLEAN DEFAULT FALSE,

  -- Node Data (stored as JSONB for flexibility)
  data JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  FOREIGN KEY (user_id, map_id) REFERENCES goal_maps(user_id, map_id) ON DELETE CASCADE
);

-- Create goal_map_edges table (stores connections between nodes)
CREATE TABLE IF NOT EXISTS goal_map_edges (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  map_id TEXT NOT NULL,

  -- Connection
  source TEXT NOT NULL,
  source_handle TEXT,
  target TEXT NOT NULL,
  target_handle TEXT,

  -- Edge type
  edge_type TEXT DEFAULT 'smoothstep',
  animated BOOLEAN DEFAULT TRUE,

  -- Style
  style JSONB,

  -- State
  selected BOOLEAN DEFAULT FALSE,

  -- Edge Data (relationship type, etc.)
  data JSONB,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  FOREIGN KEY (user_id, map_id) REFERENCES goal_maps(user_id, map_id) ON DELETE CASCADE
);

-- Create goal_map_viewports table (stores viewport state for each map)
CREATE TABLE IF NOT EXISTS goal_map_viewports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  map_id TEXT NOT NULL,

  -- Viewport position
  x REAL NOT NULL DEFAULT 0,
  y REAL NOT NULL DEFAULT 0,
  zoom REAL NOT NULL DEFAULT 1,

  -- Metadata
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, map_id),
  FOREIGN KEY (user_id, map_id) REFERENCES goal_maps(user_id, map_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS goal_maps_user_id_idx ON goal_maps(user_id);
CREATE INDEX IF NOT EXISTS goal_maps_map_id_idx ON goal_maps(map_id);

CREATE INDEX IF NOT EXISTS goal_map_nodes_user_id_idx ON goal_map_nodes(user_id);
CREATE INDEX IF NOT EXISTS goal_map_nodes_map_id_idx ON goal_map_nodes(map_id);
CREATE INDEX IF NOT EXISTS goal_map_nodes_node_type_idx ON goal_map_nodes(node_type);

CREATE INDEX IF NOT EXISTS goal_map_edges_user_id_idx ON goal_map_edges(user_id);
CREATE INDEX IF NOT EXISTS goal_map_edges_map_id_idx ON goal_map_edges(map_id);
CREATE INDEX IF NOT EXISTS goal_map_edges_source_idx ON goal_map_edges(source);
CREATE INDEX IF NOT EXISTS goal_map_edges_target_idx ON goal_map_edges(target);

CREATE INDEX IF NOT EXISTS goal_map_viewports_user_id_idx ON goal_map_viewports(user_id);
CREATE INDEX IF NOT EXISTS goal_map_viewports_map_id_idx ON goal_map_viewports(map_id);

-- Enable Row Level Security
ALTER TABLE goal_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_map_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_map_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_map_viewports ENABLE ROW LEVEL SECURITY;

-- Policies for goal_maps table
CREATE POLICY "Users can view their own goal maps"
  ON goal_maps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal maps"
  ON goal_maps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal maps"
  ON goal_maps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal maps"
  ON goal_maps FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for goal_map_nodes table
CREATE POLICY "Users can view their own goal map nodes"
  ON goal_map_nodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal map nodes"
  ON goal_map_nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal map nodes"
  ON goal_map_nodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal map nodes"
  ON goal_map_nodes FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for goal_map_edges table
CREATE POLICY "Users can view their own goal map edges"
  ON goal_map_edges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal map edges"
  ON goal_map_edges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal map edges"
  ON goal_map_edges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal map edges"
  ON goal_map_edges FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for goal_map_viewports table
CREATE POLICY "Users can view their own goal map viewports"
  ON goal_map_viewports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal map viewports"
  ON goal_map_viewports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal map viewports"
  ON goal_map_viewports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal map viewports"
  ON goal_map_viewports FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_goal_maps_updated_at
  BEFORE UPDATE ON goal_maps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goal_map_nodes_updated_at
  BEFORE UPDATE ON goal_map_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goal_map_edges_updated_at
  BEFORE UPDATE ON goal_map_edges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goal_map_viewports_updated_at
  BEFORE UPDATE ON goal_map_viewports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

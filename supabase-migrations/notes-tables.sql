-- Notes App Tables Migration
-- Run this in your Supabase SQL Editor

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT NOT NULL DEFAULT '',
  plain_text TEXT NOT NULL DEFAULT '',

  -- Organization
  notebook_id UUID,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Flags
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Stats
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,

  -- Drawing data (JSON)
  drawing_data JSONB DEFAULT '[]'::jsonb,

  -- Gamification
  points INTEGER DEFAULT 0,
  streak JSONB
);

-- Create notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0
);

-- Create tags table
CREATE TABLE IF NOT EXISTS note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note_count INTEGER DEFAULT 0,
  UNIQUE(user_id, name)
);

-- Create notes_settings table
CREATE TABLE IF NOT EXISTS notes_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  enable_gamification BOOLEAN DEFAULT TRUE,
  user_stats JSONB DEFAULT '{"totalPoints": 0, "level": 1, "badges": [], "notesCreated": 0, "totalWords": 0, "currentStreak": 0, "longestStreak": 0}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint for notebook_id (after notebooks table is created)
ALTER TABLE notes
  ADD CONSTRAINT fk_notebook
  FOREIGN KEY (notebook_id)
  REFERENCES notebooks(id)
  ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_notebook_id_idx ON notes(notebook_id);
CREATE INDEX IF NOT EXISTS notes_tags_idx ON notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS notes_is_favorite_idx ON notes(is_favorite);
CREATE INDEX IF NOT EXISTS notes_is_archived_idx ON notes(is_archived);
CREATE INDEX IF NOT EXISTS notes_is_pinned_idx ON notes(is_pinned);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes(updated_at);

CREATE INDEX IF NOT EXISTS notebooks_user_id_idx ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS note_tags_user_id_idx ON note_tags(user_id);
CREATE INDEX IF NOT EXISTS notes_settings_user_id_idx ON notes_settings(user_id);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_settings ENABLE ROW LEVEL SECURITY;

-- Policies for notes table
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for notebooks table
CREATE POLICY "Users can view their own notebooks"
  ON notebooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notebooks"
  ON notebooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notebooks"
  ON notebooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notebooks"
  ON notebooks FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for note_tags table
CREATE POLICY "Users can view their own tags"
  ON note_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
  ON note_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON note_tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON note_tags FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for notes_settings table
CREATE POLICY "Users can view their own settings"
  ON notes_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON notes_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON notes_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON notes_settings FOR DELETE
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
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notebooks_updated_at
  BEFORE UPDATE ON notebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_settings_updated_at
  BEFORE UPDATE ON notes_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Todo App Tables Migration
-- Run this in your Supabase SQL Editor

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  color TEXT,
  estimated_time INTEGER, -- in minutes
  time_spent INTEGER DEFAULT 0, -- in minutes
  subtasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  timer_running BOOLEAN DEFAULT FALSE,
  timer_started_at TIMESTAMPTZ,
  recurring JSONB,
  streak JSONB,
  points INTEGER DEFAULT 0
);

-- Create todo_settings table
CREATE TABLE IF NOT EXISTS todo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  background_type TEXT NOT NULL DEFAULT 'theme',
  background_theme TEXT NOT NULL DEFAULT 'default',
  background_image TEXT,
  color_scheme TEXT NOT NULL DEFAULT 'system',
  show_estimated_time BOOLEAN DEFAULT TRUE,
  show_timer BOOLEAN DEFAULT TRUE,
  enable_ai_suggestions BOOLEAN DEFAULT FALSE,
  enable_gamification BOOLEAN DEFAULT TRUE,
  user_stats JSONB DEFAULT '{"totalPoints": 0, "level": 1, "badges": [], "tasksCompleted": 0, "currentStreak": 0, "longestStreak": 0}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);
CREATE INDEX IF NOT EXISTS todos_status_idx ON todos(status);
CREATE INDEX IF NOT EXISTS todos_category_idx ON todos(category);
CREATE INDEX IF NOT EXISTS todos_due_date_idx ON todos(due_date);
CREATE INDEX IF NOT EXISTS todo_settings_user_id_idx ON todo_settings(user_id);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_settings ENABLE ROW LEVEL SECURITY;

-- Policies for todos table
CREATE POLICY "Users can view their own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for todo_settings table
CREATE POLICY "Users can view their own settings"
  ON todo_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON todo_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON todo_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON todo_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_todo_settings_updated_at
  BEFORE UPDATE ON todo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

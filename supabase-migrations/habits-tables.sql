-- Habits App Tables Migration
-- Run this in your Supabase SQL Editor

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'active',
  color TEXT,
  icon TEXT,

  -- Frequency and scheduling
  frequency TEXT NOT NULL DEFAULT 'daily',
  custom_days INTEGER[], -- For custom frequency (0-6, Sunday-Saturday)
  target_count INTEGER, -- How many times per period

  -- Progress tracking
  streak JSONB, -- StreakData
  total_completions INTEGER DEFAULT 0,

  -- Time tracking
  estimated_time INTEGER, -- in minutes
  total_time_spent INTEGER DEFAULT 0, -- in minutes

  -- Reminders (JSONB)
  reminder JSONB,

  -- Financial habits (JSONB)
  financial_goal JSONB,

  -- Gamification
  points INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,

  -- Privacy
  is_private BOOLEAN DEFAULT FALSE
);

-- Create habit_completions table (separate table for better querying)
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  time_spent INTEGER -- in minutes
);

-- Create habit_settings table
CREATE TABLE IF NOT EXISTS habit_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  background_type TEXT NOT NULL DEFAULT 'theme',
  background_theme TEXT NOT NULL DEFAULT 'default',
  background_image TEXT,
  color_scheme TEXT NOT NULL DEFAULT 'system',
  show_time_tracking BOOLEAN DEFAULT TRUE,
  show_reminders BOOLEAN DEFAULT TRUE,
  enable_gamification BOOLEAN DEFAULT TRUE,
  enable_financial_tracking BOOLEAN DEFAULT TRUE,
  user_stats JSONB, -- UserHabitStats
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS habits_category_idx ON habits(category);
CREATE INDEX IF NOT EXISTS habits_status_idx ON habits(status);
CREATE INDEX IF NOT EXISTS habits_frequency_idx ON habits(frequency);

CREATE INDEX IF NOT EXISTS habit_completions_user_id_idx ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS habit_completions_habit_id_idx ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS habit_completions_completed_at_idx ON habit_completions(completed_at);

CREATE INDEX IF NOT EXISTS habit_settings_user_id_idx ON habit_settings(user_id);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_settings ENABLE ROW LEVEL SECURITY;

-- Policies for habits table
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for habit_completions table
CREATE POLICY "Users can view their own habit completions"
  ON habit_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit completions"
  ON habit_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit completions"
  ON habit_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit completions"
  ON habit_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for habit_settings table
CREATE POLICY "Users can view their own habit settings"
  ON habit_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit settings"
  ON habit_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit settings"
  ON habit_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit settings"
  ON habit_settings FOR DELETE
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
CREATE TRIGGER update_habit_settings_updated_at
  BEFORE UPDATE ON habit_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

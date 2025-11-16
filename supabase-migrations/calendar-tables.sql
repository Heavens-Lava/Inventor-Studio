-- Calendar App Tables Migration
-- Run this in your Supabase SQL Editor

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  color TEXT,
  location TEXT,

  -- Recurring event settings (JSONB)
  recurring JSONB,

  -- Integration with other apps
  linked_todo_id TEXT,
  linked_habit_id TEXT,
  linked_journal_id TEXT,

  -- Reminders (JSONB array)
  reminders JSONB DEFAULT '[]'::jsonb,

  -- Attachments (JSONB array)
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Attendees/Collaboration (JSONB array)
  attendees JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create calendar_settings table
CREATE TABLE IF NOT EXISTS calendar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- View settings
  default_view TEXT NOT NULL DEFAULT 'month',
  week_starts_on INTEGER NOT NULL DEFAULT 0,
  working_hours_start TEXT NOT NULL DEFAULT '09:00',
  working_hours_end TEXT NOT NULL DEFAULT '17:00',

  -- Display settings
  show_weekends BOOLEAN DEFAULT TRUE,
  show_todo_widget BOOLEAN DEFAULT TRUE,
  show_finance_widget BOOLEAN DEFAULT FALSE,
  show_habits_widget BOOLEAN DEFAULT TRUE,
  show_journal_widget BOOLEAN DEFAULT FALSE,

  -- Theme
  background_type TEXT NOT NULL DEFAULT 'theme',
  background_theme TEXT NOT NULL DEFAULT 'default',
  background_image TEXT,
  color_scheme TEXT NOT NULL DEFAULT 'system',

  -- Integrations
  sync_with_todos BOOLEAN DEFAULT TRUE,
  sync_with_habits BOOLEAN DEFAULT TRUE,
  sync_with_journal BOOLEAN DEFAULT FALSE,
  show_todo_deadlines BOOLEAN DEFAULT TRUE,
  show_habit_streaks BOOLEAN DEFAULT TRUE,

  -- Notifications
  enable_reminders BOOLEAN DEFAULT TRUE,
  default_reminder_minutes INTEGER DEFAULT 15,

  -- Custom day colors (JSONB)
  day_colors JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS calendar_events_user_id_idx ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS calendar_events_start_date_idx ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS calendar_events_end_date_idx ON calendar_events(end_date);
CREATE INDEX IF NOT EXISTS calendar_events_category_idx ON calendar_events(category);
CREATE INDEX IF NOT EXISTS calendar_events_all_day_idx ON calendar_events(all_day);

CREATE INDEX IF NOT EXISTS calendar_settings_user_id_idx ON calendar_settings(user_id);

-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;

-- Policies for calendar_events table
CREATE POLICY "Users can view their own calendar events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for calendar_settings table
CREATE POLICY "Users can view their own calendar settings"
  ON calendar_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar settings"
  ON calendar_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar settings"
  ON calendar_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar settings"
  ON calendar_settings FOR DELETE
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
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_settings_updated_at
  BEFORE UPDATE ON calendar_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

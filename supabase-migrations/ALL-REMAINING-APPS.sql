-- ALL REMAINING APPS MIGRATION
-- This includes: Journal, Finance (Expenses/Budgets/Savings), Fitness, Ideas, Goals/Roadmap
-- Run this in your Supabase SQL Editor AFTER running the individual app migrations

-- ============================================
-- JOURNAL APP
-- ============================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT TRUE,
  weather TEXT,
  location TEXT,
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX journal_entries_user_id_idx ON journal_entries(user_id);
CREATE INDEX journal_entries_created_at_idx ON journal_entries(created_at);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own journal entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FINANCE APP (Expenses, Budgets, Savings)
-- ============================================

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  payment_method TEXT,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_config JSONB,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  alert_threshold INTEGER DEFAULT 80,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  deadline TIMESTAMPTZ,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX expenses_user_id_idx ON expenses(user_id);
CREATE INDEX expenses_date_idx ON expenses(date);
CREATE INDEX budgets_user_id_idx ON budgets(user_id);
CREATE INDEX savings_goals_user_id_idx ON savings_goals(user_id);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own savings goals" ON savings_goals FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FITNESS APP
-- ============================================

CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  duration INTEGER, -- minutes
  calories_burned INTEGER,
  distance DECIMAL(10, 2), -- km
  notes TEXT,
  exercises JSONB, -- Array of exercise details
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fitness_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  target_value DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2) DEFAULT 0,
  unit TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX workouts_user_id_idx ON workouts(user_id);
CREATE INDEX workouts_completed_at_idx ON workouts(completed_at);
CREATE INDEX fitness_goals_user_id_idx ON fitness_goals(user_id);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workouts" ON workouts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own fitness goals" ON fitness_goals FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- IDEAS APP
-- ============================================

CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other',
  status TEXT DEFAULT 'idea',
  priority TEXT DEFAULT 'medium',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  attachments JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  votes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ideas_user_id_idx ON ideas(user_id);
CREATE INDEX ideas_category_idx ON ideas(category);
CREATE INDEX ideas_status_idx ON ideas(status);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own ideas" ON ideas FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- GOALS/ROADMAP APP
-- ============================================

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'minor',
  category TEXT,
  status TEXT NOT NULL DEFAULT 'not-started',
  priority TEXT NOT NULL DEFAULT 'medium',
  progress INTEGER DEFAULT 0,
  timeframe TEXT,

  -- Dates
  start_date TIMESTAMPTZ,
  target_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,

  -- Nested data
  subgoals JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  feedback JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX goals_user_id_idx ON goals(user_id);
CREATE INDEX goals_status_idx ON goals(status);
CREATE INDEX goals_timeframe_idx ON goals(timeframe);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

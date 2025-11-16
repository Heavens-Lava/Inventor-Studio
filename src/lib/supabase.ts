import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database types based on Picture-recipes schema
export interface Recipe {
  id: string;
  user_id: string;
  recipe_name: string;
  title: string;
  ingredients: string[];
  instruction_ingredients?: string[];
  instruction_tools?: string[];
  instructions: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  rating?: number;
  availableIngredients?: number;
  totalIngredients?: number;
  image_url?: string;
  created_at?: string;
}

export interface GroceryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  needed: boolean;
  inCart: boolean;
}

export interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  photos_taken?: number;
  recipes_tried?: number;
  lists_created?: number;
  favorites_count?: number;
  has_premium?: boolean;
}

export interface Favorite {
  id: string;
  user_id: string;
  recipe_id: string;
}

// Todo App Types
export interface TodoTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  color?: string;
  estimated_time?: number;
  time_spent?: number;
  subtasks: any; // JSON field
  created_at: string;
  completed_at?: string;
  due_date?: string;
  tags?: string[];
  timer_running?: boolean;
  timer_started_at?: string;
  recurring?: any; // JSON field
  streak?: any; // JSON field
  points?: number;
}

export interface TodoUserSettings {
  id: string;
  user_id: string;
  background_type: string;
  background_theme: string;
  background_image?: string;
  color_scheme: string;
  show_estimated_time: boolean;
  show_timer: boolean;
  enable_ai_suggestions: boolean;
  enable_gamification: boolean;
  user_stats?: any; // JSON field
  updated_at: string;
}

// Notes App Types
export interface NoteDB {
  id: string;
  user_id: string;
  title: string;
  content: string;
  plain_text: string;
  notebook_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_pinned: boolean;
  word_count: number;
  character_count: number;
  drawing_data?: any; // JSON field
  points?: number;
  streak?: any; // JSON field
}

export interface NotebookDB {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  note_count: number;
  display_order: number;
}

export interface NoteTagDB {
  id: string;
  user_id: string;
  name: string;
  color?: string;
  created_at: string;
  note_count: number;
}

export interface NotesSettingsDB {
  id: string;
  user_id: string;
  enable_gamification: boolean;
  user_stats?: any; // JSON field
  updated_at: string;
}

// Goal Mapper App Types
export interface GoalMapDB {
  id: string;
  user_id: string;
  map_id: string;
  map_name: string;
  version: string;
  created_at: string;
  updated_at: string;
  backup_date?: string;
}

export interface GoalMapNodeDB {
  id: string;
  user_id: string;
  map_id: string;
  node_type: string;
  position_x: number;
  position_y: number;
  width?: number;
  height?: number;
  selected: boolean;
  dragging: boolean;
  data: any; // JSONB field
  created_at: string;
  updated_at: string;
}

export interface GoalMapEdgeDB {
  id: string;
  user_id: string;
  map_id: string;
  source: string;
  source_handle?: string;
  target: string;
  target_handle?: string;
  edge_type: string;
  animated: boolean;
  style?: any; // JSONB field
  selected: boolean;
  data?: any; // JSONB field
  created_at: string;
  updated_at: string;
}

export interface GoalMapViewportDB {
  id: string;
  user_id: string;
  map_id: string;
  x: number;
  y: number;
  zoom: number;
  updated_at: string;
}

// Calendar App Types
export interface CalendarEventDB {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  color?: string;
  location?: string;
  recurring?: any; // JSONB field
  linked_todo_id?: string;
  linked_habit_id?: string;
  linked_journal_id?: string;
  reminders?: any; // JSONB field
  attachments?: any; // JSONB field
  attendees?: any; // JSONB field
  created_at: string;
  updated_at: string;
}

export interface CalendarSettingsDB {
  id: string;
  user_id: string;
  default_view: string;
  week_starts_on: number;
  working_hours_start: string;
  working_hours_end: string;
  show_weekends: boolean;
  show_todo_widget: boolean;
  show_finance_widget: boolean;
  show_habits_widget: boolean;
  show_journal_widget: boolean;
  background_type: string;
  background_theme: string;
  background_image?: string;
  color_scheme: string;
  sync_with_todos: boolean;
  sync_with_habits: boolean;
  sync_with_journal: boolean;
  show_todo_deadlines: boolean;
  show_habit_streaks: boolean;
  enable_reminders: boolean;
  default_reminder_minutes: number;
  day_colors?: any; // JSONB field
  updated_at: string;
}

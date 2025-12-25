/*
  # Freelancer Proof-of-Work SaaS Schema

  ## Overview
  This migration creates the complete database schema for a proof-of-work tracking SaaS application.
  
  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `company_name` (text, optional) - Company/business name
  - `subscription_tier` (text) - free, pro, or enterprise
  - `sessions_this_month` (integer) - Counter for freemium limits
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update
  
  ### 2. projects
  - `id` (uuid, primary key) - Unique project identifier
  - `user_id` (uuid) - References profiles.id
  - `name` (text) - Project name
  - `client_name` (text) - Client name
  - `client_email` (text, optional) - Client email for sharing reports
  - `description` (text, optional) - Project description
  - `status` (text) - active, completed, or archived
  - `created_at` (timestamptz) - Project creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. work_sessions
  - `id` (uuid, primary key) - Unique session identifier
  - `project_id` (uuid) - References projects.id
  - `user_id` (uuid) - References profiles.id
  - `title` (text) - Session title/summary
  - `started_at` (timestamptz) - Session start time
  - `ended_at` (timestamptz, optional) - Session end time (null if in progress)
  - `duration_minutes` (integer) - Total duration in minutes
  - `status` (text) - in_progress, completed, or draft
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### 4. evidence_entries
  - `id` (uuid, primary key) - Unique evidence identifier
  - `session_id` (uuid) - References work_sessions.id
  - `user_id` (uuid) - References profiles.id
  - `timestamp` (timestamptz) - When evidence was created
  - `type` (text) - commit, task, note, or milestone
  - `title` (text) - Evidence title
  - `description` (text, optional) - Detailed description
  - `metadata` (jsonb, optional) - Additional structured data
  - `created_at` (timestamptz) - Record creation timestamp
  
  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE, and DELETE operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  company_name text,
  subscription_tier text NOT NULL DEFAULT 'free',
  sessions_this_month integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  client_name text NOT NULL,
  client_email text,
  description text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create work_sessions table
CREATE TABLE IF NOT EXISTS work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_minutes integer DEFAULT 0,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

-- Create evidence_entries table
CREATE TABLE IF NOT EXISTS evidence_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES work_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Work sessions policies
CREATE POLICY "Users can view own sessions"
  ON work_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON work_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON work_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON work_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Evidence entries policies
CREATE POLICY "Users can view own evidence"
  ON evidence_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own evidence"
  ON evidence_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evidence"
  ON evidence_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own evidence"
  ON evidence_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_project_id ON work_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_id ON work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_entries_session_id ON evidence_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_evidence_entries_user_id ON evidence_entries(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

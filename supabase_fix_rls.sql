-- Fix RLS policy for profiles insert
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Sometimes trigger-based creation is preferred, but for client-side creation:
-- Ensure the user is authenticated (which they are after signUp) and ID matches.
-- This policy looks correct, but sometimes Supabase Auth takes a moment to propagate session
-- or the insert happens before the session is fully established in the client.
-- However, typically the issue is that 'authenticated' role is required but
-- the client might be inserting using the anon key without the session token yet?
-- Ah, wait. After `supabase.auth.signUp`, if email confirmation is enabled, the user might not be 'authenticated' fully yet?
-- OR if email confirmation is disabled (default usually requires it?), they get a session.

-- Let's try to allow inserting a profile if the ID matches the auth.uid()
-- Another common issue: The `public` role cannot insert into `profiles`? No, we grant to authenticated.

-- Let's add a policy that allows insert if the user is inserting their own ID, 
-- even if we are not strictly "authenticated" via the RLS in the way we expect if sign-up flow is tricky.
-- But standard practice:
-- 1. SignUp returns session (if auto-confirm on)
-- 2. Client uses that session to insert.

-- If you are getting RLS violation, it might be that the user is not yet "logged in" in the eyes of RLS
-- immediately after signUp if the session isn't set on the client for the subsequent request?
-- `supabase.auth.signUp` returns a session. `createClient` should use it?
-- Actually, the client created with `createClient` in the component is a singleton-ish?
-- No, it's `createClient` from `@/lib/supabase/client`.

-- A safer pattern often used is a Database Trigger to create the profile automatically
-- when a user is created in auth.users. This avoids RLS issues on INSERT entirely
-- because the system (postgres) does it with full privileges.

-- Let's implement the Trigger approach which is much more robust.

-- 1. Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

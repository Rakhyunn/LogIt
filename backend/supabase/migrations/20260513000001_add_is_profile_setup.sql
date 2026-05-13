-- Add is_profile_setup column to profiles table
ALTER TABLE public.profiles
  ADD COLUMN is_profile_setup boolean NOT NULL DEFAULT false;

-- ============================================================================
-- SUPABASE STORAGE SETUP FOR PROFILE PICTURES
-- ============================================================================
-- This creates a storage bucket for user profile pictures with proper security
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Note: Storage buckets are created via the Supabase Dashboard, not SQL
-- But we can create the storage policies here

-- First, you need to manually create the bucket in Supabase Dashboard:
-- 1. Go to Storage in left sidebar
-- 2. Click "New bucket"
-- 3. Name: "avatars"
-- 4. Public bucket: YES (so profile pictures are publicly accessible)
-- 5. Click "Create bucket"

-- After creating the bucket, run these policies:

-- ============================================================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- ============================================================================

-- Policy: Anyone can view avatars (public read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- DONE!
-- ============================================================================
-- Now profile pictures will be stored in: avatars/{user_id}/avatar.jpg
-- And accessible via: https://your-project.supabase.co/storage/v1/object/public/avatars/{user_id}/avatar.jpg
-- ============================================================================

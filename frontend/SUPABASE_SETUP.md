# Supabase Setup Guide for Ajosave

This guide will help you set up your Supabase database for the Ajosave application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: Ajosave (or your preferred name)
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your API Credentials

1. Once your project is created, go to **Settings** → **API**
2. You'll find:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy this (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Set Up Environment Variables

1. In your project, create or update `.env.local` in the `frontend` directory
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace:**
- `your-project-id` with your actual Supabase project ID
- `your-anon-key-here` with your actual anon/public key

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the SQL from `supabase_schema.sql` (see below)
4. Click "Run" to execute the SQL
5. Wait for all tables to be created

## Step 5: Set Up Row Level Security (RLS)

After creating the tables, enable RLS policies:

1. Go to **Authentication** → **Policies** (or **Table Editor** → select table → **Policies**)
2. For each table (`pools`, `pool_members`, `pool_activity`), set up policies:

**For `pools` table:**
- Enable RLS: Yes
- Add policy: Allow all operations (SELECT, INSERT, UPDATE) for authenticated users
- Or allow public read access if you want anyone to view pools

**For `pool_members` table:**
- Enable RLS: Yes
- Add policy: Allow SELECT for public, INSERT/UPDATE for authenticated users

**For `pool_activity` table:**
- Enable RLS: Yes
- Add policy: Allow SELECT for public, INSERT for authenticated users

## Step 6: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see three tables:
   - `pools`
   - `pool_members`
   - `pool_activity`

3. Test your connection by running your Next.js app:
   ```bash
   cd frontend
   npm run dev
   ```


### "Table doesn't exist" error
- Make sure you ran the SQL schema successfully
- Check the Table Editor to confirm tables were created

### RLS blocking requests
- Temporarily disable RLS for testing, or add proper policies
- Go to Table Editor → select table → Settings → Toggle RLS

## Next Steps

Once your database 
1. Test creating a pool through your application
2. Check the Supabase Table Editor to see the data
3. Set up proper RLS policies for production
4. Consider setting up database backups


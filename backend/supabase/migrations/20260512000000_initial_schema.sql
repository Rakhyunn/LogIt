-- Contents
CREATE TABLE public.contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('movie', 'drama', 'book')),
  title text NOT NULL,
  description text,
  cover_image_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Profiles (auth.users 확장)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.contents ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, content_id)
);

-- Follows
CREATE TABLE public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- Bookmarks
CREATE TABLE public.bookmarks (
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.contents ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);

-- 신규 유저 가입 시 profiles 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS 활성화
ALTER TABLE public.contents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- contents RLS
CREATE POLICY "contents_select_all"   ON public.contents FOR SELECT USING (true);
CREATE POLICY "contents_insert_auth"  ON public.contents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "contents_update_auth"  ON public.contents FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "contents_delete_auth"  ON public.contents FOR DELETE USING (auth.uid() IS NOT NULL);

-- profiles RLS
CREATE POLICY "profiles_select_all"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- reviews RLS
CREATE POLICY "reviews_select_all"    ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own"    ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own"    ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own"    ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- follows RLS
CREATE POLICY "follows_select_all"    ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own"    ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own"    ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- bookmarks RLS
CREATE POLICY "bookmarks_select_own"  ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert_own"  ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete_own"  ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

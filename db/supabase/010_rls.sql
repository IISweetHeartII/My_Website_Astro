-- ============================================
-- Supabase RLS policies & helper
-- ============================================

-- 현재 요청 JWT에서 blog_id 추출
CREATE OR REPLACE FUNCTION public.get_current_blog_id()
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::json->>'blog_id', '0')::BIGINT
$$;

-- posts RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on posts"
  ON public.posts FOR SELECT
  USING (blog_id = public.get_current_blog_id());

CREATE POLICY "Allow authenticated users to insert posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    blog_id = public.get_current_blog_id()
  );

CREATE POLICY "Allow authors to update their own posts"
  ON public.posts FOR UPDATE
  USING (
    auth.uid() = author_id AND
    blog_id = public.get_current_blog_id()
  )
  WITH CHECK (
    auth.uid() = author_id AND
    blog_id = public.get_current_blog_id()
  );

CREATE POLICY "Allow authors to delete their own posts"
  ON public.posts FOR DELETE
  USING (
    auth.uid() = author_id AND
    blog_id = public.get_current_blog_id()
  );

-- comments RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on comments"
  ON public.comments FOR SELECT
  USING (blog_id = public.get_current_blog_id());

CREATE POLICY "Allow authenticated users to insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    blog_id = public.get_current_blog_id()
  );

CREATE POLICY "Allow authors to delete their own comments"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = author_id AND
    blog_id = public.get_current_blog_id()
  );



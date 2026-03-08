-- ============================================================
-- majiroom_comment_reactions テーブル
-- コメント単位のリアクション（👍like / 🔥fire / 💪muscle）
-- v17.1.0 追加
-- ============================================================

-- 1. テーブル作成
CREATE TABLE IF NOT EXISTS public.majiroom_comment_reactions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID        NOT NULL REFERENCES public.majiroom_comments(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN ('like', 'fire', 'muscle')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id, type)
);

-- 2. インデックス
CREATE INDEX IF NOT EXISTS comment_reactions_comment_id_idx ON public.majiroom_comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS comment_reactions_user_id_idx   ON public.majiroom_comment_reactions(user_id);

-- 3. RLS 有効化
ALTER TABLE public.majiroom_comment_reactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS ポリシー
-- 全員が閲覧可能
DROP POLICY IF EXISTS "Comment reactions select all" ON public.majiroom_comment_reactions;
CREATE POLICY "Comment reactions select all"
  ON public.majiroom_comment_reactions
  FOR SELECT USING (true);

-- 自分のリアクションのみ追加可能
DROP POLICY IF EXISTS "Comment reactions insert own" ON public.majiroom_comment_reactions;
CREATE POLICY "Comment reactions insert own"
  ON public.majiroom_comment_reactions
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- 自分のリアクションのみ削除可能
DROP POLICY IF EXISTS "Comment reactions delete own" ON public.majiroom_comment_reactions;
CREATE POLICY "Comment reactions delete own"
  ON public.majiroom_comment_reactions
  FOR DELETE USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- ============================================================
-- majiroom_participants に eliminated_at カラム追加
-- (daily-elimination Edge Function で使用)
-- ============================================================
ALTER TABLE public.majiroom_participants
  ADD COLUMN IF NOT EXISTS eliminated_at TIMESTAMPTZ;

-- ============================================================
-- 確認クエリ
-- ============================================================
-- SELECT tablename, policyname FROM pg_policies WHERE tablename = 'majiroom_comment_reactions';

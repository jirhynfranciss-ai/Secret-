-- ============================================================
-- Secret Admirer App — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE notification_type AS ENUM ('message', 'system', 'love', 'response');
CREATE TYPE question_type AS ENUM ('text', 'choice', 'scale');

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL DEFAULT 'text',
  options JSONB,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QUESTIONNAIRE RESPONSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ============================================================
-- CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_user ON public.questionnaire_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER questionnaire_responses_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: Get user role
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- RLS POLICIES: Profiles
-- ============================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Users can update their own profile (but NOT role)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Non-admins cannot change their own role
      public.get_user_role(auth.uid()) = 'admin'
      OR role = 'user'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Only system (trigger) can insert profiles
CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================
-- RLS POLICIES: Questions
-- ============================================================
-- Everyone can read active questions
CREATE POLICY "Anyone can read active questions"
  ON public.questions FOR SELECT
  USING (is_active = TRUE OR public.get_user_role(auth.uid()) = 'admin');

-- Only admins can modify questions
CREATE POLICY "Admins can manage questions"
  ON public.questions FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- RLS POLICIES: Questionnaire Responses
-- ============================================================
-- Users can view their own responses
CREATE POLICY "Users can view own responses"
  ON public.questionnaire_responses FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all responses
CREATE POLICY "Admins can view all responses"
  ON public.questionnaire_responses FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Users can insert their own responses
CREATE POLICY "Users can insert own responses"
  ON public.questionnaire_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own responses
CREATE POLICY "Users can update own responses"
  ON public.questionnaire_responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all responses
CREATE POLICY "Admins can manage responses"
  ON public.questionnaire_responses FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- RLS POLICIES: Conversations
-- ============================================================
-- Users can view their own conversation
CREATE POLICY "Users can view own conversation"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
  ON public.conversations FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Users can create their own conversation
CREATE POLICY "Users can create conversation"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update any conversation
CREATE POLICY "Admins can update conversations"
  ON public.conversations FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Users can update their own conversation
CREATE POLICY "Users can update own conversation"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES: Messages
-- ============================================================
-- Users can view messages in their conversation
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Users can send messages in their conversation
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      -- User can only send in their own conversation
      conversation_id IN (
        SELECT id FROM public.conversations WHERE user_id = auth.uid()
      )
      OR
      -- Admins can send in any conversation
      public.get_user_role(auth.uid()) = 'admin'
    )
  );

-- Users can mark messages as read in their conversations
CREATE POLICY "Users can mark messages read"
  ON public.messages FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
    OR public.get_user_role(auth.uid()) = 'admin'
  );

-- ============================================================
-- RLS POLICIES: Notifications
-- ============================================================
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Users can mark their notifications as read/delete
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can create notifications for any user
CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Users can create notifications for admins (from messaging)
CREATE POLICY "Users can create notifications for admins"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.get_user_role(user_id) = 'admin'
  );

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- SEED: Default questions
-- ============================================================
INSERT INTO public.questions (question_text, question_type, options, order_index, is_active)
VALUES
  ('What brings the warmest smile to your face?', 'text', NULL, 1, TRUE),
  ('If you could spend a perfect day anywhere in the world, where would it be?', 'text', NULL, 2, TRUE),
  ('What does love mean to you?', 'choice', '["Warmth & Safety", "Adventure & Growth", "Deep Connection", "Gentle Devotion", "Endless Laughter"]', 3, TRUE),
  ('How do you feel about receiving heartfelt letters?', 'choice', '["I absolutely adore them", "They''re wonderfully old-fashioned", "I find them touching", "I prefer messages", "It depends"]', 4, TRUE),
  ('What is something small that makes your day infinitely better?', 'text', NULL, 5, TRUE),
  ('On a scale of openness — how do you feel about unexpected romance?', 'scale', NULL, 6, TRUE)
ON CONFLICT DO NOTHING;

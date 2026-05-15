-- ============================================
-- PopCorn : watch together — Supabase Schema
-- Telegram Mini App — PostgreSQL
-- ============================================

-- -------------------------
-- 0. Extensions
-- -------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------
-- 1. Trigger: updated_at()
-- -------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------
-- 2. Tables
-- -------------------------

-- 2.1 profiles
CREATE TABLE profiles (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id bigint NOT NULL UNIQUE,
  username    text,
  first_name  text NOT NULL,
  last_name   text,
  avatar_url  text,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  language    text NOT NULL DEFAULT 'ar',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2.2 chat_conversations
CREATE TABLE chat_conversations (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type        text NOT NULL CHECK (type IN ('private', 'group', 'channel')),
  title       text,
  description text,
  avatar_url  text,
  created_by  uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.3 chat_members
CREATE TABLE chat_members (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, profile_id)
);

-- 2.4 chat_messages
CREATE TABLE chat_messages (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles(id),
  content         text NOT NULL,
  message_type    text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file', 'system')),
  reply_to        uuid REFERENCES chat_messages(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz,
  edited          boolean NOT NULL DEFAULT false
);

CREATE TRIGGER trg_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2.5 watch_party_rooms
CREATE TABLE watch_party_rooms (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  description  text,
  created_by   uuid NOT NULL REFERENCES profiles(id),
  is_private   boolean NOT NULL DEFAULT false,
  password_hash text,
  status       text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'playing', 'paused', 'ended')),
  media_url    text,
  media_title  text,
  playback_position double precision NOT NULL DEFAULT 0,
  is_playing   boolean NOT NULL DEFAULT false,
  max_members  int NOT NULL DEFAULT 50 CHECK (max_members >= 1 AND max_members <= 1000),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 2.6 watch_party_members
CREATE TABLE watch_party_members (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id    uuid NOT NULL REFERENCES watch_party_rooms(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id),
  role       text NOT NULL DEFAULT 'member' CHECK (role IN ('host', 'member')),
  joined_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, profile_id)
);

-- 2.7 user_favorites
CREATE TABLE user_favorites (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tmdb_id    int NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title      text NOT NULL,
  poster_url text,
  added_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, tmdb_id, media_type)
);

-- 2.8 watch_history
CREATE TABLE watch_history (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id),
  tmdb_id    int NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title      text NOT NULL,
  poster_url text,
  watched_at timestamptz NOT NULL DEFAULT now()
);

-- 2.9 typing_indicators
CREATE TABLE typing_indicators (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- -------------------------
-- 3. Indexes
-- -------------------------

-- profiles
CREATE INDEX idx_profiles_telegram_id ON profiles(telegram_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_username ON profiles(username);

-- chat_conversations
CREATE INDEX idx_conversations_created_by ON chat_conversations(created_by);
CREATE INDEX idx_conversations_type ON chat_conversations(type);

-- chat_members
CREATE INDEX idx_chat_members_conversation ON chat_members(conversation_id);
CREATE INDEX idx_chat_members_profile ON chat_members(profile_id);

-- chat_messages
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(conversation_id, created_at DESC);

-- watch_party_rooms
CREATE INDEX idx_watch_rooms_created_by ON watch_party_rooms(created_by);
CREATE INDEX idx_watch_rooms_status ON watch_party_rooms(status);
CREATE INDEX idx_watch_rooms_created_at ON watch_party_rooms(created_at DESC);

-- watch_party_members
CREATE INDEX idx_watch_members_room ON watch_party_members(room_id);
CREATE INDEX idx_watch_members_profile ON watch_party_members(profile_id);

-- user_favorites
CREATE INDEX idx_user_favorites_profile ON user_favorites(profile_id);
CREATE INDEX idx_user_favorites_tmdb ON user_favorites(tmdb_id);

-- typing_indicators
CREATE INDEX idx_typing_indicators_conversation ON typing_indicators(conversation_id);
CREATE INDEX idx_typing_indicators_profile ON typing_indicators(profile_id);

-- watch_history
CREATE INDEX idx_watch_history_profile ON watch_history(profile_id);
CREATE INDEX idx_watch_history_tmdb ON watch_history(tmdb_id);
CREATE INDEX idx_watch_history_watched_at ON watch_history(profile_id, watched_at DESC);

-- -------------------------
-- 4. Row Level Security
-- -------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_party_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- -------------------------
-- 5. RLS Policies
-- -------------------------

-- 5.1 profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 5.2 chat_conversations
CREATE POLICY "Conversation members can view conversations"
  ON chat_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.conversation_id = id
        AND chat_members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 5.3 chat_members
CREATE POLICY "Conversation members can view member list"
  ON chat_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members AS cm
      WHERE cm.conversation_id = conversation_id
        AND cm.profile_id = auth.uid()
    )
  );

-- 5.4 chat_messages
CREATE POLICY "Conversation members can read messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.conversation_id = conversation_id
        AND chat_members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Conversation members can insert messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.conversation_id = conversation_id
        AND chat_members.profile_id = auth.uid()
    )
  );

-- 5.5 watch_party_rooms
CREATE POLICY "Authenticated users can view public rooms"
  ON watch_party_rooms FOR SELECT
  USING (is_private = false OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create rooms"
  ON watch_party_rooms FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room creator can update their rooms"
  ON watch_party_rooms FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Room creator can delete their rooms"
  ON watch_party_rooms FOR DELETE
  USING (created_by = auth.uid());

-- 5.6 watch_party_members
CREATE POLICY "Room members can view other members"
  ON watch_party_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM watch_party_members AS wpm
      WHERE wpm.room_id = room_id
        AND wpm.profile_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can join rooms"
  ON watch_party_members FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- 5.7 user_favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own favorites"
  ON user_favorites FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (profile_id = auth.uid());

-- 5.9 typing_indicators
CREATE POLICY "Conversation members can view typing indicators"
  ON typing_indicators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.conversation_id = conversation_id
        AND chat_members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Conversation members can insert typing indicators"
  ON typing_indicators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.conversation_id = conversation_id
        AND chat_members.profile_id = auth.uid()
    )
  );

-- 5.10 watch_history
CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own watch history"
  ON watch_history FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own watch history"
  ON watch_history FOR DELETE
  USING (profile_id = auth.uid());

-- -------------------------
-- 6. Realtime Publications
-- -------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;

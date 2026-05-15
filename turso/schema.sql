-- PopCorn Mini: Telegram Mini App for watching movies/TV together
-- Turso (SQLite) schema migration

CREATE TABLE IF NOT EXISTS movies (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id         INTEGER UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    original_title  TEXT,
    overview        TEXT,
    poster_path     TEXT,
    backdrop_path   TEXT,
    release_date    TEXT,
    vote_average    REAL DEFAULT 0,
    vote_count      INTEGER DEFAULT 0,
    runtime         INTEGER,
    genres          TEXT,
    language        TEXT DEFAULT 'en',
    created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tv_shows (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id             INTEGER UNIQUE NOT NULL,
    name                TEXT NOT NULL,
    original_name       TEXT,
    overview            TEXT,
    poster_path         TEXT,
    backdrop_path       TEXT,
    first_air_date      TEXT,
    vote_average        REAL DEFAULT 0,
    vote_count          INTEGER DEFAULT 0,
    number_of_seasons   INTEGER,
    number_of_episodes  INTEGER,
    genres              TEXT,
    language            TEXT DEFAULT 'en',
    created_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media_files (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id               INTEGER NOT NULL,
    media_type            TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
    season_number         INTEGER,
    episode_number        INTEGER,
    file_name             TEXT NOT NULL,
    file_size             INTEGER,
    mime_type             TEXT,
    telegram_message_id   INTEGER NOT NULL,
    telegram_channel_id   INTEGER NOT NULL,
    stream_url            TEXT,
    quality               TEXT CHECK (quality IN ('480p', '720p', '1080p', '4K')),
    language              TEXT DEFAULT 'en',
    is_active             INTEGER DEFAULT 1,
    created_at            TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS archive_sources (
    id                        INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type               TEXT NOT NULL CHECK (source_type IN ('channel', 'group', 'bot')),
    source_id                 TEXT NOT NULL,
    title                     TEXT,
    is_active                 INTEGER DEFAULT 1,
    last_scraped_at           TEXT,
    scrape_interval_minutes   INTEGER DEFAULT 60,
    created_at                TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS archive_log (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id             INTEGER NOT NULL REFERENCES archive_sources(id),
    telegram_message_id   INTEGER NOT NULL,
    file_name             TEXT,
    file_size             INTEGER,
    tmdb_id               INTEGER,
    tmdb_match_score      REAL,
    status                TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'unmatched', 'error')),
    error_message         TEXT,
    created_at            TEXT DEFAULT (datetime('now')),
    UNIQUE (source_id, telegram_message_id)
);

CREATE TABLE IF NOT EXISTS genres (
    id              INTEGER PRIMARY KEY,
    tmdb_genre_id   INTEGER UNIQUE NOT NULL,
    name_en         TEXT NOT NULL,
    name_ar         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_activity (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id   INTEGER NOT NULL,
    action        TEXT NOT NULL CHECK (action IN ('search', 'view', 'stream', 'favorite', 'watch_party')),
    tmdb_id       INTEGER,
    metadata      TEXT,
    created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id    ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_title      ON movies(title);

CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_id  ON tv_shows(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_tv_shows_name     ON tv_shows(name);

CREATE INDEX IF NOT EXISTS idx_media_files_tmdb_id            ON media_files(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_media_files_telegram_msg_id    ON media_files(telegram_message_id);

CREATE INDEX IF NOT EXISTS idx_archive_sources_source_id      ON archive_sources(source_id);

CREATE INDEX IF NOT EXISTS idx_archive_log_source_id_status   ON archive_log(source_id, status);

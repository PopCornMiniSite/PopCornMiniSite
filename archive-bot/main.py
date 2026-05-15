#!/usr/bin/env python3
import asyncio
import logging
import re
import sys
from pathlib import Path
from typing import Any, Optional

import httpx

sys.path.insert(0, "/home/jamal/Desktop/PopCorn Mini/tg-harvest/src")
from tg_harvest.client.session import TelegramSession
from tg_harvest.config.settings import Settings

from telethon import TelegramClient
from telethon.tl.types import (
    DocumentAttributeFilename,
    Message,
    MessageMediaDocument,
    MessageMediaPhoto,
)

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

from config import config

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

scan_queue: asyncio.Queue[tuple[str, int, int]] = asyncio.Queue()


def _is_admin(update: Update) -> bool:
    return update.effective_user is not None and update.effective_user.id == config.ADMIN_ID


# ── Telegram Session ──────────────────────────────────────────────
async def get_session() -> TelegramSession:
    settings = Settings(
        api_id=config.API_ID,
        api_hash=config.API_HASH,
        session_name="user",
    )
    session = TelegramSession(settings)
    await session.connect()
    if not await session.ensure_authorized():
        await session.disconnect()
        raise RuntimeError(
            "Not authorized — mount a valid Telethon session at sessions/user.session"
        )
    return session


# ── Database (Turso) ──────────────────────────────────────────────
async def exec_db(sql: str, params: Optional[list[Any]] = None) -> Any:
    db_url = config.TURSO_URL.replace("libsql://", "https://")
    headers = {"Authorization": f"Bearer {config.TURSO_TOKEN}", "Content-Type": "application/json"}
    stmt = {"sql": sql}
    if params:
        stmt["args"] = [{"type": "text", "value": str(v)} for v in params]
    payload = {"requests": [{"type": "execute", "stmt": stmt}]}
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{db_url}/v2/pipeline", headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
        results = data.get("results", [])
        if results and results[0].get("type") == "error":
            raise RuntimeError(f"SQL error: {results[0].get('error',{}).get('message','?')}")
        return data


async def init_db() -> None:
    await exec_db(
        """CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            identifier TEXT UNIQUE NOT NULL,
            title TEXT,
            added_at TEXT DEFAULT (datetime('now'))
        )"""
    )
    await exec_db(
        """CREATE TABLE IF NOT EXISTS media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id INTEGER REFERENCES sources(id),
            message_id INTEGER,
            file_name TEXT,
            file_size INTEGER,
            media_type TEXT,
            forwarded_msg_id INTEGER,
            stream_url TEXT,
            tmdb_id INTEGER,
            tmdb_title TEXT,
            tmdb_year INTEGER,
            tmdb_type TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )"""
    )


# ── TMDB ──────────────────────────────────────────────────────────
async def search_tmdb(file_name: str) -> Optional[dict[str, Any]]:
    name = Path(file_name).stem
    name = re.sub(r"[._]\d{3,4}[pP].*", "", name)
    name = re.sub(r"[._]", " ", name).strip()
    if not name:
        return None
    async with httpx.AsyncClient(timeout=10) as c:
        for media_type in ("movie", "tv"):
            r = await c.get(
                f"https://api.themoviedb.org/3/search/{media_type}",
                params={"api_key": config.TMDB_KEY, "query": name},
            )
            if r.status_code != 200:
                continue
            results = r.json().get("results", [])
            if results:
                hit = results[0]
                date_field = hit.get("release_date") or hit.get("first_air_date") or ""
                return {
                    "tmdb_id": hit["id"],
                    "tmdb_title": hit.get("title") or hit.get("name"),
                    "tmdb_year": int(date_field[:4]) if len(date_field) >= 4 else None,
                    "tmdb_type": media_type,
                }
    return None


# ── Stream Bot ────────────────────────────────────────────────────
async def get_stream_link(chat_id: int, message_id: int) -> str:
    return f"{config.STREAM_BOT_URL}/stream/{message_id}?hash=arc"


# ── Scan ──────────────────────────────────────────────────────────
def get_file_name(msg: Message) -> Optional[str]:
    if isinstance(msg.media, MessageMediaDocument):
        for attr in msg.media.document.attributes:
            if isinstance(attr, DocumentAttributeFilename):
                return attr.file_name
    return None


async def process_scan(
    session: TelegramSession, bot, identifier: str, reply_chat: int, reply_msg: int
) -> None:
    client = session.client
    try:
        entity = await client.get_entity(identifier)
    except Exception as e:
        await bot.send_message(reply_chat, f"Error resolving {identifier}: {e}")
        return

    title = getattr(entity, "title", str(entity.id))
    await exec_db(
        "INSERT OR IGNORE INTO sources (identifier, title) VALUES (?, ?)",
        [identifier, title],
    )

    count = 0

    async for msg in client.iter_messages(entity, limit=200):
        if not isinstance(msg.media, (MessageMediaPhoto, MessageMediaDocument)):
            continue
        try:
            fwd = await client.forward_messages(config.LOG_CHANNEL, msg)
            fwd_id = fwd.id if hasattr(fwd, "id") else fwd[0].id

            file_name = get_file_name(msg)
            file_size = msg.media.document.size if isinstance(msg.media, MessageMediaDocument) else None
            media_type = "photo" if isinstance(msg.media, MessageMediaPhoto) else "document"

            stream_url = await get_stream_link(config.LOG_CHANNEL, fwd_id)

            tmdb = await search_tmdb(file_name or "") if file_name else None

            row = await exec_db("SELECT id FROM sources WHERE identifier = ?", [identifier])
            source_id = row.rows[0][0] if row and row.rows else None

            await exec_db(
                """INSERT INTO media
                   (source_id, message_id, file_name, file_size, media_type,
                    forwarded_msg_id, stream_url, tmdb_id, tmdb_title, tmdb_year, tmdb_type)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                [
                    source_id,
                    msg.id,
                    file_name,
                    file_size,
                    media_type,
                    fwd_id,
                    stream_url,
                    tmdb["tmdb_id"] if tmdb else None,
                    tmdb["tmdb_title"] if tmdb else None,
                    tmdb["tmdb_year"] if tmdb else None,
                    tmdb["tmdb_type"] if tmdb else None,
                ],
            )
            count += 1
        except Exception as e:
            logger.error("Failed to process msg %d: %s", msg.id, e)
        await asyncio.sleep(0.3)

    await bot.send_message(
        reply_chat,
        f"Done scanning {title}: {count} media files archived",
        reply_to_message_id=reply_msg,
    )


async def queue_worker(session: TelegramSession, bot) -> None:
    while True:
        identifier, chat_id, msg_id = await scan_queue.get()
        try:
            await process_scan(session, bot, identifier, chat_id, msg_id)
        except Exception as e:
            logger.error("Scan failed for %s: %s", identifier, e)


# ── Bot Handlers ──────────────────────────────────────────────────
async def cmd_start(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_admin(update):
        return
    await update.message.reply_text("Archive Bot running")

async def cmd_add(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_admin(update) or not context.args:
        return
    identifier = context.args[0]
    await exec_db("INSERT OR IGNORE INTO sources (identifier) VALUES (?)", [identifier])
    await update.message.reply_text(f"Added source: {identifier}")

async def cmd_scan(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_admin(update) or not context.args:
        return
    identifier = context.args[0]
    await scan_queue.put((identifier, update.effective_chat.id, update.message.id))
    await update.message.reply_text(f"Queued scan for {identifier}")

async def cmd_list(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_admin(update):
        return
    result = await exec_db(
        "SELECT identifier, title, added_at FROM sources ORDER BY added_at DESC"
    )
    if not result or not result.rows:
        await update.message.reply_text("No sources added yet.")
        return
    lines = []
    for r in result.rows:
        ident = r["identifier"] if isinstance(r, dict) else r[0]
        ttl = (r["title"] if isinstance(r, dict) else r[1]) or "N/A"
        lines.append(f"\u2022 {ident} ({ttl})")
    await update.message.reply_text("Sources:\n" + "\n".join(lines))

async def cmd_stats(update: Update, _: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_admin(update):
        return
    total = (await exec_db("SELECT COUNT(*) as c FROM media")).rows[0][0]
    srcs = (await exec_db("SELECT COUNT(*) as c FROM sources")).rows[0][0]
    await update.message.reply_text(f"Sources: {srcs}\nMedia archived: {total}")


# ── Main ──────────────────────────────────────────────────────────
async def main() -> None:
    session = await get_session()
    await init_db()

    app = (
        Application.builder()
        .token(config.BOT_TOKEN)
        .build()
    )
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("add", cmd_add))
    app.add_handler(CommandHandler("scan", cmd_scan))
    app.add_handler(CommandHandler("list", cmd_list))
    app.add_handler(CommandHandler("stats", cmd_stats))

    async with app:
        await app.start()
        await app.updater.start_polling()
        try:
            await queue_worker(session, app.bot)
        finally:
            await app.updater.stop()
            await app.stop()


if __name__ == "__main__":
    asyncio.run(main())

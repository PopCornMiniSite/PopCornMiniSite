from typing import Optional
"""Media type and metadata models."""

from enum import StrEnum

from pydantic import BaseModel


class MediaType(StrEnum):
    PHOTO = "photo"
    VIDEO = "video"
    DOCUMENT = "document"
    AUDIO = "audio"
    VOICE = "voice"
    VIDEO_NOTE = "video_note"
    STICKER = "sticker"
    GIF = "gif"
    POLL = "poll"
    GEO = "geo"
    CONTACT = "contact"
    WEB_PAGE = "web_page"
    NONE = "none"


class PollAnswer(BaseModel):
    text: str
    voter_count: int = 0


class MediaInfo(BaseModel):
    type: MediaType
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    duration: float | None = None
    width: Optional[int] = None
    height: Optional[int] = None
    title: Optional[str] = None
    performer: Optional[str] = None
    url: Optional[str] = None
    poll_answers: list[PollAnswer] | None = None
    latitude: float | None = None
    longitude: float | None = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    local_path: Optional[str] = None

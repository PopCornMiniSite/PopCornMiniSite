from typing import Optional
"""Message data models."""

from datetime import datetime

from pydantic import BaseModel, computed_field

from tg_harvest.models.media import MediaInfo
from tg_harvest.models.reaction import ReactionsInfo


class ForwardInfo(BaseModel):
    from_id: Optional[int] = None
    from_name: Optional[str] = None
    channel_post: Optional[int] = None
    date: datetime | None = None


class ReplyInfo(BaseModel):
    reply_to_msg_id: Optional[int] = None
    reply_to_top_id: Optional[int] = None


class SenderInfo(BaseModel):
    id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_bot: bool = False

    @computed_field  # type: ignore[prop-decorator]
    @property
    def display_name(self) -> str:
        parts = [self.first_name or "", self.last_name or ""]
        name = " ".join(p for p in parts if p).strip()
        return name or self.username or str(self.id)


class EntityInfo(BaseModel):
    type: str
    offset: int
    length: int
    url: Optional[str] = None
    user_id: Optional[int] = None


class ParsedMessage(BaseModel):
    id: int
    channel_id: int
    channel_username: Optional[str] = None
    date: datetime
    text: str = ""
    sender_id: Optional[int] = None
    post_author: Optional[str] = None
    sender: SenderInfo | None = None
    media: MediaInfo | None = None
    views: Optional[int] = None
    forwards: Optional[int] = None
    replies_count: Optional[int] = None
    reactions: ReactionsInfo | None = None
    forward_info: ForwardInfo | None = None
    reply_info: ReplyInfo | None = None
    grouped_id: Optional[int] = None
    is_pinned: bool = False
    is_edited: bool = False
    edit_date: datetime | None = None
    entities: list[EntityInfo] = []

    @computed_field  # type: ignore[prop-decorator]
    @property
    def url(self) -> str:
        if self.channel_username:
            return f"https://t.me/{self.channel_username}/{self.id}"
        return f"https://t.me/c/{self.channel_id}/{self.id}"

import os


class Config:
    API_ID: int = int(os.getenv("API_ID", "32360090"))
    API_HASH: str = os.getenv("API_HASH", "c7b022dcf0b1d3021197857e51be9375")
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "8608371919:AAGi6MkFqF3HX1nBkdNG-1AvtQifkI7Jd_M")
    ADMIN_ID: int = int(os.getenv("ADMIN_ID", "5703679073"))
    TMDB_KEY: str = os.getenv("TMDB_KEY", "0b3bb9e6526f3c318aa6f6ba40acf5f3")
    TURSO_URL: str = os.getenv("TURSO_URL", "libsql://popcorndb-melloukijamal.aws-eu-west-1.turso.io")
    TURSO_TOKEN: str = os.getenv(
        "TURSO_TOKEN",
        "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg2MDM2NTUsImlkIjoiMDE5ZTFkMDgtNWEwMS03NjFlLWJiZGYtZDk1N2IzY2FiMDZlIiwicmlkIjoiMDc1MWRlZGMtMjg0Zi00NDIxLThlNmItZTcyZmFlM2ZhZDI3In0.8tfGVph3eFdUsnBwpUghv_NOisJR-QIWqOfJR3RrHrDeF9SkFxrEzXw4Iy3srslCNtcrkagdXGnKZbyVBz3FCw",
    )
    LOG_CHANNEL: int = int(os.getenv("LOG_CHANNEL", "-1003745577594"))
    STREAM_BOT_URL: str = os.getenv("STREAM_BOT_URL", "http://stream-bot:8080")


config = Config()

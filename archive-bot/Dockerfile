# Build from parent directory:
#   docker build -t archive-bot -f archive-bot/Dockerfile .
FROM python:3.12-slim

WORKDIR /app

# Install tg-harvest from local source
COPY tg-harvest /app/tg-harvest
RUN pip install --no-cache-dir -e /app/tg-harvest

COPY archive-bot/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY archive-bot/config.py archive-bot/main.py ./
RUN mkdir -p sessions

CMD ["python", "main.py"]

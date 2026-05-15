# PopCorn Mini - Hugging Face Space
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    ca-certificates \
    curl \
    && pip install supervisor \
    && rm -rf /var/lib/apt/lists/*

# === Stream Bot ===
COPY --from=golang:1.25-alpine3.21 /usr/local/go /usr/local/go
ENV PATH=/usr/local/go/bin:$PATH
COPY tg-filestreambot /app/tg-filestreambot
RUN cd /app/tg-filestreambot && go build -o /usr/local/bin/fsb -ldflags="-w -s" ./cmd/fsb
COPY stream-bot/fsb.env /app/fsb.env

# === Archive Bot ===
COPY tg-harvest /app/tg-harvest
RUN pip install --no-cache-dir -e /app/tg-harvest
COPY archive-bot/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY archive-bot/config.py archive-bot/main.py /app/
RUN mkdir -p /app/sessions

# === Frontend ===
COPY dist /usr/share/nginx/html

# === Config ===
COPY deploy/hf-space/nginx.conf /etc/nginx/sites-enabled/default
COPY deploy/hf-space/supervisord.conf /etc/supervisord.conf

EXPOSE 80
WORKDIR /app
CMD ["supervisord", "-c", "/etc/supervisord.conf"]

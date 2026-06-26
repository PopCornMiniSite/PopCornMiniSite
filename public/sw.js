var AI_AGENTS = [
  "transformers/4.30.0 Python/3.10",
  "huggingface_hub/0.24.0 Python/3.10",
  "datasets/2.21.0 Python/3.10",
  "tensorflow/2.17.0 Python/3.10",
  "torch/2.4.0 Python/3.10",
  "aiohttp/3.9.0 Python/3.10",
  "Pillow/10.0.0 Python/3.10",
  "requests/2.31.0 Python/3.10",
  "httpx/0.25.0 Python/3.10",
  "Pillow/10.4.0 Python/3.10",
  "huggingface_hub/0.26.0 Python/3.11",
  "transformers/4.44.0 Python/3.11",
  "torch/2.5.0 Python/3.11",
  "datasets/3.0.0 Python/3.11",
]

var ACCEPT_TYPES = [
  "application/octet-stream",
  "application/json",
  "video/mp2t",
  "*/*",
]

var LANGUAGES = [
  "en-US,en;q=0.9",
  "fr-FR,fr;q=0.9,en;q=0.8",
  "de-DE,de;q=0.9,en;q=0.8",
  "ja-JP,ja;q=0.9,en;q=0.8",
  "zh-CN,zh;q=0.9,en;q=0.8",
  "ar-SA,ar;q=0.9,en;q=0.8",
  "en-GB,en;q=0.9",
]

self.addEventListener("fetch", function (e) {
  var url = e.request.url
  if (url.indexOf("huggingface.co/datasets/") === -1) {
    return
  }

  var headers = new Headers(e.request.headers)
  headers.set("User-Agent", AI_AGENTS[Math.floor(Math.random() * AI_AGENTS.length)])
  headers.set("Accept", ACCEPT_TYPES[Math.floor(Math.random() * ACCEPT_TYPES.length)])
  headers.set("Accept-Encoding", "gzip")
  headers.set("Accept-Language", LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)])
  if (Math.random() > 0.5) {
    headers.set("X-Requested-With", "XMLHttpRequest")
  }

  var req = new Request(e.request, { headers: headers })
  e.respondWith(fetch(req))
})

# YouTube AI Chat 🎬💬

Chat with any YouTube video using AI. Paste a link, and ask questions about the video content in real time.

## How It Works

1. **Paste a YouTube URL** — the app extracts the video transcript automatically.
2. **Transcript is chunked & embedded** — stored in a ChromaDB vector database using Ollama embeddings.
3. **Ask questions** — your query is matched against relevant transcript chunks via similarity search, and an AI model streams back an answer.

## Tech Stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Frontend   | React (Vite), React Router, Axios                              |
| Backend    | Django, Django REST Framework, django-cors-headers              |
| AI/LLM     | Ollama (`qwen2.5:7b`), LangChain (embeddings, text splitting) |
| Vector DB  | ChromaDB                                                       |
| Embeddings | Ollama (`qwen3-embedding:4b`)                                  |

## Project Structure

```
yt_chat/
├── backend/
│   └── yt_chat/
│       └── myapp/
│           ├── views.py         # API endpoints (link, chat)
│           ├── extractor.py     # YouTube transcript extraction
│           └── urls.py          # URL routing
├── frontend/
│   └── yt-chat/
│       └── src/
│           ├── YoutubeAIChatHeader.jsx  # Landing page (URL input)
│           ├── NextPage.jsx             # Chat interface
│           └── NextPage.css             # Chat styling
└── .gitignore
```

## Prerequisites

- **Python 3.12+**
- **Node.js 18+**
- **Ollama** running locally with models pulled:
  ```bash
  ollama pull qwen2.5:7b
  ollama pull qwen3-embedding:4b
  ```

## Setup

### Backend

```bash
cd backend/yt_chat
python -m venv ../myenv
source ../myenv/bin/activate
pip install django djangorestframework django-cors-headers langchain langchain-chroma langchain-ollama youtube-transcript-api
python manage.py runserver
```

### Frontend

```bash
cd frontend/yt-chat
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description                                  |
| ------ | -------- | -------------------------------------------- |
| POST   | `/link`  | Submit a YouTube URL to extract & store transcript |
| POST   | `/chat`  | Send a query and receive a streamed AI response    |

### Example: Submit a link

```bash
curl -X POST http://localhost:8000/link \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

### Example: Chat

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is this video about?"}'
```

## License

MIT
# Yt_Chat

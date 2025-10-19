# RAGnetic - Retrieval-Augmented Generation Chat Application

---

## Overview

RAGnetic is a powerful Retrieval-Augmented Generation (RAG) chat application built with Next.js, LangChain, OpenAI, and Qdrant vector search, designed to handle large documents (PDFs or text) with precise, context-grounded conversational responses.

### You can check the Delopyed version at 
[`Ragnetic Link`](https://ragnetic.priyanshucode.xyz)

Key features:
- Upload or paste large text or PDF documents for instant indexing (Later also allows us to index Docs and enitre Websites).
- Local or cloud-powered Qdrant vector database for efficient semantic search.
- OpenAI GPT-4.1-mini chat completions with retrieval-augmented context.
- Beautiful, responsive UI with chat history, message avatars, and Markdown rendering.
- Light/dark mode support using shadcn UI components and next-themes.
- Smooth document indexing and chat toggling with loading states and animations.

---

## Features

- **Document Upload:** Supports PDF uploads and direct text pasting.
- **Vector Indexing:** Uses OpenAI embeddings to index chunks in Qdrant.
- **Semantic Search:** Retrieves top relevant document chunks for queries.
- **Contextual Chat:** Uses LangChain and OpenAI LLMs for chat with document context.
- **Rich Markdown Response:** Chat responses support Markdown for better readability.
- **UI/UX:** Responsiveness, smooth animations, and user-friendly design.
- **Theme Toggle:** Switch easily between light and dark modes.
- **Auto Scrolling Chat:** Messages auto-scroll to the latest.
- **Robust API:** Separate API routes for indexing and chat queries.

---

## Environment Variables Setup

Create a `.env` file at the project root with the following keys:
```
OPENAI_API_KEY=your_openai_api_key_here
QDRANT_API_KEY=your_qdrant_api_key_here # Omit if using local Qdrant without authentication
QDRANT_URL=your_qdrant_cloud_url_or_local_url # e.g., http://localhost:6333 or https://mycluster.qdrant.cloud
```
**Note:** Keep your API keys secret. Do not commit `.env` to version control.

---

## Running Qdrant Locally with Docker Compose

To run a local Qdrant vector database, use Docker Compose:
1. Create a `docker-compose.yml` file with:
```
version: "3.8"
services:
qdrant:
image: qdrant/qdrant
ports:
- "6333:6333"
volumes:
- ./qdrant_data:/qdrant/storage # Persistent storage for data
restart: always
```
2. Start Qdrant server with:
```
docker compose up -d
```
3. Confirm Qdrant is running by visiting this link or test it on postman **Only** -> If setup using the Docker Setup for Qdrant
```
http://localhost:6333/collections
```

Web dashboard is available at `http://localhost:6333` as well.

---

## Project Setup & Run

1. Clone this repository.
2. Install dependencies:

npm install

3. Setup environment variables as above.
4. Run the Next.js app:

npm run dev

5. Access the app on `http://localhost:3000`.
6. Upload or paste documents to index.
7. Ask questions via chat, with context from your uploaded files.

---

## Production Deployment Recommendations

- Use Docker Compose to run Next.js and Qdrant together internally, connecting via Docker network with shared URLs.
- Or deploy Qdrant on managed cloud (e.g. [Qdrant Cloud](https://qdrant.tech/cloud)) and update `QDRANT_URL` and `QDRANT_API_KEY`.
- Protect API keys with environment variables and secret management.
- Use HTTPS endpoints for security on cloud deployment.
- Persist data storage if self-hosting Qdrant.

---

## Technologies Used

- Next.js 13 (App Router)
- TypeScript / React
- LangChain
- OpenAI API (GPT-4.1-mini)
- Qdrant Vector Database
- shadcn/ui & TailwindCSS
- React Markdown + remark-gfm for markdown rendering
- Framer Motion for smooth animations
- Docker & Docker Compose for local container orchestration

---

## License

MIT License

---

For any issues or pull requests, please contact the [`pianist22`](https://github.com/pianist22).

---

This README provides a concise yet detailed introduction, setup instructions, deployment recommendations, and a feature overview to get your RAGnetic app up and running smoothly!

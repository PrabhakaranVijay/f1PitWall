# PitWall Dashboard

PitWall is a production-grade, real-time Formula 1 analytics dashboard built for data-driven motorsport enthusiasts. It streams live telemetry, race positions, and session data directly from the [OpenF1 API](https://openf1.org) into a sleek, performant React web application.

![PitWall Dashboard](https://images.unsplash.com/photo-1541421715694-df0a24eb5ab4?auto=format&fit=crop&q=80&w=1200) *(concept aesthetic)*

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS V4, Recharts, Lucide React
- **Backend**: Python, FastAPI, Uvicorn, WebSockets (for live streaming)
- **Data Layer**: Redis (Pub/Sub & Caching), PostgreSQL (Async Data Storage)
- **Infrastructure**: Docker Compose

## Features
- **Live Leaderboard**: Real-time position tracking and gap times.
- **Car Telemetry**: Live speed, throttle/brake, and gear visualization charts.
- **Race Strategy**: Tyre stint tracking and visual timeline.
- **Race Control**: Log of real-time race events, flags, and penalties.
- **Weather Station**: Track conditions, temperatures, and wind metrics.

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js > 20 (if running frontend locally outside docker)
- Python > 3.12 (if running backend locally outside docker)

### Running with Docker (Recommended)
The easiest way to boot the entire stack is with Docker Compose. This spins up the Postgres Database, Redis cache, Python Backend, and Next.js Frontend.

```bash
cd pitwall-dashboard
docker compose up --build -d
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`

### Development Setup (Local)
If you wish to run the services bare-metal for development:

**1. Infrastructure**
Start Redis and Postgres via Docker:
```bash
docker compose up db redis -d
```

**2. Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Architecture Overview

1. **Ingestion Loop** (`worker/ingestion.py`): A continuous async loop queries OpenF1 safely without hitting rate limits.
2. **Redis Streams**: Incoming data is pushed rapidly to Redis Pub/Sub channels (e.g., `live_positions_channel`).
3. **WebSocket Hub** (`websocket/stream.py`): The FastAPI server bridges Redis events directly to connected web clients via WebSockets.
4. **React Dashboard**: The Next.js client consumes WebSockets utilizing custom hooks (`useWebSocket`) to re-render charts at 60fps immediately as data arrives.

## Contributing
Pull requests are welcome. Please adhere to the established `.eslintrc` conventions and use feature branches.

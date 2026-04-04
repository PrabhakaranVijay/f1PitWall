pitwall-dashboard/
├── .github/
│ └── workflows/
│ └── main.yml
├── backend/
│ ├── .env
│ ├── Dockerfile
│ ├── package-lock.json
│ ├── requirements.txt
│ └── app/
│ ├── api/
│ │ └── endpoints.py
│ ├── models/
│ │ └── race.py
│ ├── routes/
│ │ ├── championship.py
│ │ └── track.py
│ ├── services/
│ │ └── openf1.py
│ ├── websocket/
│ │ ├── race_stream.py
│ │ └── stream.py
│ ├── workers/
│ │ └── ingestion.py
│ ├── config.py
│ ├── database.py
│ ├── main.py
│ └── memory_store.py
├── data_pipeline/
├── frontend/
│ ├── .gitignore
│ ├── Dockerfile
│ ├── README.md
│ ├── eslint.config.mjs
│ ├── next-env.d.ts
│ ├── next.config.ts
│ ├── package-lock.json
│ ├── package.json
│ ├── postcss.config.mjs
│ ├── tsconfig.json
│ ├── public/
│ │ ├── file.svg
│ │ ├── globe.svg
│ │ ├── next.svg
│ │ ├── vercel.svg
│ │ └── window.svg
│ └── src/
│ ├── app/
│ │ ├── api/
│ │ │ └── f1-highlights/
│ │ │ └── route.ts
│ │ ├── race/
│ │ │ └── page.tsx
│ │ ├── race-control/
│ │ │ └── page.tsx
│ │ ├── strategy/
│ │ │ └── page.tsx
│ │ ├── telemetry/
│ │ │ └── page.tsx
│ │ ├── weather/
│ │ │ └── page.tsx
│ │ ├── favicon.ico
│ │ ├── globals.css
│ │ ├── layout.tsx
│ │ └── page.tsx
│ ├── components/
│ │ ├── liveRace/
│ │ │ ├── LapPanel.tsx
│ │ │ ├── RaceHighlightsPanel.tsx
│ │ │ ├── WeatherPanel.tsx
│ │ │ └── circuit.tsx
│ │ ├── ChampionshipCard.tsx
│ │ ├── Header.tsx
│ │ ├── Highlights.tsx
│ │ ├── RaceTimeline.tsx
│ │ ├── RaceTrack.tsx
│ │ ├── Sidebar.tsx
│ │ └── temp.tsx
│ ├── hooks/
│ │ ├── useRaceSocket.ts
│ │ └── useWebSocket.ts
│ ├── types/
│ │ └── race.ts
│ └── utils/
│ ├── eventEngine.ts
│ ├── mapWeatherData.ts
│ └── windDirection.ts
├── infrastructure/
│ ├── ci-cd/
│ └── docker/
├── docker-compose.yml
├── plain.md
└── README.md

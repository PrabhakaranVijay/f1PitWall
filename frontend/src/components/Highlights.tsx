"use client";

import { ExternalLink, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type Video = {
  videoId: string;
  title: string;
  thumbnail: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";
const HIGHLIGHTS_URL = `${API_BASE_URL}/api/f1/highlights`;

export default function Highlights() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(HIGHLIGHTS_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unable to load highlights.");
        }

        return res.json();
      })
      .then((data: Video[]) => {
        setVideos(Array.isArray(data) ? data : []);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setError("Highlights are unavailable right now.");
        }
      });

    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-dashed border-[#333] bg-[#111] px-6 text-center text-sm text-gray-400">
        {error}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-dashed border-[#333] bg-[#111] px-6 text-center text-sm text-gray-500">
        Loading highlights...
      </div>
    );
  }

  const video = videos[current];
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  const next = () => {
    setCurrent((prev) => (prev + 1) % videos.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + videos.length) % videos.length);
  };

  return (
    <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
      <article className="group relative h-[420px] overflow-hidden rounded-2xl border border-[#333] bg-[#111]">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ff6a3d]">
            <span className="h-2 w-2 rounded-full bg-[#ff6a3d]" />
            Race Highlights
          </div>

          <h3 className="max-w-xl text-xl font-semibold leading-tight text-white">
            {video.title}
          </h3>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#e10600] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff2a24]"
            >
              <Play className="h-4 w-4 fill-current" />
              Watch on YouTube
            </a>

            <div className="inline-flex items-center rounded-full border border-white/15 bg-black/30 p-1">
              <button
                onClick={prev}
                aria-label="Previous highlight"
                className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next highlight"
                className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </article>

      <div className="flex h-[420px] flex-col gap-3 overflow-y-auto pr-1">
        {videos.map((item, index) => {
          const isActive = index === current;

          return (
            <button
              key={item.videoId}
              onClick={() => setCurrent(index)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                isActive
                  ? "border-[#e10600] bg-[#221313]"
                  : "border-[#333] bg-[#141414] hover:border-[#555] hover:bg-[#191919]"
              }`}
            >
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-black">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-8 w-8 fill-white text-white" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Highlight {index + 1}
                </div>
                <p className="line-clamp-3 text-sm font-medium leading-5 text-white">
                  {item.title}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400">
                  Open on YouTube
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Video = {
  videoId: string;
  title: string;
  thumbnail: string;
};

export default function Highlights() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8000/api/f1/highlights")
      .then((res) => res.json())
      .then((data) => setVideos(data));
  }, []);

  if (videos.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-dashed border-[#333] bg-[#111] text-gray-500">
        Loading highlights...
      </div>
    );
  }

  const video = videos[current];

  const next = () => {
    setCurrent((prev) => (prev + 1) % videos.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + videos.length) % videos.length);
  };

  return (
    <div className="relative w-full h-[420px] bg-black rounded-xl overflow-hidden">
      {/* Video */}
      <iframe
        key={video.videoId}
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${video.videoId}`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Title */}
      <div className="absolute bottom-6 left-6 text-white text-xl font-semibold bg-black/40 px-4 py-2 rounded">
        {video.title}
      </div>

      {/* Left Arrow */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-2 rounded hover:bg-black"
      >
        ◀
      </button>

      {/* Right Arrow */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-2 rounded hover:bg-black"
      >
        ▶
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 w-full flex justify-center gap-2">
        {videos.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === current ? "bg-white" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

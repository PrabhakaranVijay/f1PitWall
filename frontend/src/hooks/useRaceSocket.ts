"use client";

import { useEffect, useState } from "react";

export function useRaceSocket<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as T;
      setData(msg);
    };

    ws.onclose = () => setConnected(false);

    return () => ws.close();
  }, [url]);

  return { data, connected };
}

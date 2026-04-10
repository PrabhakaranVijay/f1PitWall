"use client";

import { useEffect, useState, useRef } from "react";

export function useWebSocket<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isActive = true;

    const connect = () => {
      if (!isActive) return;

      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        console.log(`Connected to WS: ${url}`);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as T;
          setData(parsed);
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log(`Disconnected from WS: ${url}, retrying in 3s...`);
        if (!isActive) return;

        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WS Error:", err);
        ws.close();
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      isActive = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  return { data, isConnected };
}

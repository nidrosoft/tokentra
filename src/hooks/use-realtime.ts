"use client";

import { useEffect, useState, useCallback } from "react";

export interface RealtimeOptions {
  url: string;
  onMessage?: (data: unknown) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

export function useRealtime({ url, onMessage, onError, enabled = true }: RealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown>(null);

  useEffect(() => {
    if (!enabled) return;

    const eventSource = new EventSource(url);

    eventSource.onopen = () => setIsConnected(true);
    eventSource.onerror = (e) => {
      setIsConnected(false);
      onError?.(e);
    };
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setLastMessage(data);
      onMessage?.(data);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [url, enabled, onMessage, onError]);

  return { isConnected, lastMessage };
}

"use client";
import { useState, useCallback } from "react";
import clientFetch from "@/lib/client-fetch";

type UseClientFetchReturn<Data> = {
  data: Data | null;
  error: { status: number; message: string; code?: string } | null;
  loading: boolean;
  runFetch: (input: RequestInfo, init?: RequestInit) => Promise<void>;
};

/**
 * A custom hook for making API requests with automatic token refresh functionality.
 * @returns An object containing:
 *   - `data`: The fetched data
 *   - `error`: Error information if any
 *   - `loading`: Loading state
 *   - `runFetch`: The fetch function
 */
export function useClientFetch<Data>(): UseClientFetchReturn<Data> {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<{ status: number; message: string; code?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const runFetch = useCallback(
    async (input: RequestInfo, init?: RequestInit) => {
      setLoading(true);
      setError(null);

      try {
        const result = await clientFetch<Data>(input, init);

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError({
          status: 500,
          message: err instanceof Error ? err.message : String(err),
          code: "ClientFetchError",
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, error, loading, runFetch };
}

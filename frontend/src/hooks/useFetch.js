import { useState, useCallback, useRef } from 'react';

/**
 * Generic hook for async data fetching.
 * Handles loading / error / data states + deduplication of in-flight requests.
 *
 * @param {Function} fetcher - async function that returns data
 * @returns {{ data, loading, error, execute, reset }}
 */
export function useFetch(fetcher) {
  const [state, setState] = useState({ data: null, loading: false, error: null });
  const abortRef = useRef(null);

  const execute = useCallback(
    async (...args) => {
      // Cancel any previous in-flight call
      if (abortRef.current) clearTimeout(abortRef.current);

      setState({ data: null, loading: true, error: null });
      try {
        const data = await fetcher(...args);
        setState({ data, loading: false, error: null });
        return { ok: true, data };
      } catch (err) {
        const error = err?.message ?? 'Unknown error';
        setState({ data: null, loading: false, error });
        return { ok: false, error };
      }
    },
    [fetcher],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Auto-executing variant: runs immediately on mount and on manual refresh.
 */
import { useEffect } from 'react';

export function useAutoFetch(fetcher, deps = []) {
  const { data, loading, error, execute } = useFetch(fetcher);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refresh: execute };
}

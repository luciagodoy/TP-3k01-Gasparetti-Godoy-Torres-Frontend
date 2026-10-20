import { useCallback, useEffect, useRef, useState } from 'react';

export default function useQuery(key, fetcher, options) {
  const enabled = options?.enabled !== false;

  const initialDataRef = useRef(options?.initialData ?? null);
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);

  const [state, setState] = useState({
    data: initialDataRef.current,
    error: null,
    loading: enabled,
  });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = options;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const result = await fetcherRef.current();
        if (cancelled) return;
        setState({ data: result ?? initialDataRef.current, error: null, loading: false });
        optionsRef.current?.onSuccess?.(result);
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({ data: prev.data, error: err, loading: false }));
        optionsRef.current?.onError?.(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, enabled, reloadCount]);

  const refetch = useCallback(() => setReloadCount((n) => n + 1), []);

  return { ...state, refetch };
}

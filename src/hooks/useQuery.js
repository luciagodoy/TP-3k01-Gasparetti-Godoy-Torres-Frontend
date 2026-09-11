import { useCallback, useEffect, useRef, useState } from 'react';


export default function useQuery(key, fetcher, options) {
  const enabled = options?.enabled !== false;

  const initialDataRef = useRef(options?.initialData ?? null);
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);

  const [estado, setEstado] = useState({
    data: initialDataRef.current,
    error: null,
    loading: enabled,
  });
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = options;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelado = false;

    (async () => {
      try {
        const resultado = await fetcherRef.current();
        if (cancelado) return;
        setEstado({ data: resultado ?? initialDataRef.current, error: null, loading: false });
        optionsRef.current?.onSuccess?.(resultado);
      } catch (err) {
        if (cancelado) return;
        
        setEstado((prev) => ({ data: prev.data, error: err, loading: false }));
        optionsRef.current?.onError?.(err);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [key, enabled, recarga]);

  const refetch = useCallback(() => setRecarga((n) => n + 1), []);

  return { ...estado, refetch };
}

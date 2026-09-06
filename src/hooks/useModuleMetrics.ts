import { useEffect, useState, useCallback } from 'react';
import { fetchModuleMetrics, upsertModuleMetric } from '@/lib/api';

/**
 * Hook for loading and persisting module metric key-value pairs.
 * Metrics are stored in the module_metrics table and scoped by module name.
 */
export function useModuleMetrics(module: string) {
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchModuleMetrics(module);
      setMetrics(data);
    } catch (err) {
      console.error(`Failed to load metrics for ${module}:`, err);
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    load();
  }, [load]);

  const saveMetric = useCallback(async (key: string, value: string) => {
    await upsertModuleMetric(module, key, value);
    setMetrics((prev) => ({ ...prev, [key]: value }));
  }, [module]);

  return { metrics, loading, saveMetric, reload: load };
}

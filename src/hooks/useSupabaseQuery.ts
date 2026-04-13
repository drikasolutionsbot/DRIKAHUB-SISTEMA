import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export function useTenantQuery<T>(
  key: string,
  table: string,
  options?: { select?: string; orderBy?: string; ascending?: boolean; enabled?: boolean; limit?: number }
) {
  const { tenantId } = useTenant();
  const select = options?.select ?? "*";
  const orderBy = options?.orderBy ?? "created_at";
  const ascending = options?.ascending ?? false;

  return useQuery<T[]>({
    queryKey: [key, tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase.functions.invoke("query-tenant-data", {
        body: {
          tenant_id: tenantId,
          table,
          select,
          order_by: orderBy,
          ascending,
          limit: options?.limit ?? 1000,
        },
      });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId && (options?.enabled !== false),
  });
}

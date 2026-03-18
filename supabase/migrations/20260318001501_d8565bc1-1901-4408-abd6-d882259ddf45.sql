DROP POLICY IF EXISTS "Admins can manage ticket presets" ON public.saved_ticket_presets;
DROP POLICY IF EXISTS "Members can view ticket presets" ON public.saved_ticket_presets;
DROP POLICY IF EXISTS "Users can manage their tenant ticket presets" ON public.saved_ticket_presets;

CREATE POLICY "Tenant members can manage ticket presets"
ON public.saved_ticket_presets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.tenant_id = saved_ticket_presets.tenant_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.tenant_id = saved_ticket_presets.tenant_id
  )
);
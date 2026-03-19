import { Skeleton } from "@/components/ui/skeleton";
import { useTenant } from "@/contexts/TenantContext";
import SettingsBotCustomizationTab from "@/components/settings/SettingsBotCustomizationTab";

const BotCustomizationPage = () => {
  const { tenant, tenantId, refetch } = useTenant();

  if (!tenant) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden p-6 pb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
        <div className="absolute inset-0 border border-primary/10 rounded-2xl" />
        <div className="relative">
          <h1 className="font-display text-2xl font-bold">Personalização do Bot</h1>
          <p className="text-muted-foreground text-sm mt-1">Customize o nome e avatar do bot nas mensagens</p>
        </div>
      </div>

      <SettingsBotCustomizationTab tenant={tenant} tenantId={tenantId} refetchTenant={refetch} />
    </div>
  );
};

export default BotCustomizationPage;

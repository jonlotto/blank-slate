import { NotificationPermission } from "@/components/NotificationPermission";

export function SettingsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as preferências do seu app
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Notificações
        </h3>
        <NotificationPermission variant="card" />
      </div>
    </div>
  );
}

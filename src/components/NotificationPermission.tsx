import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOneSignal } from "@/hooks/useOneSignal";
import { useToast } from "@/hooks/use-toast";

interface NotificationPermissionProps {
  variant?: "button" | "switch" | "card";
  className?: string;
}

export function NotificationPermission({ 
  variant = "button", 
  className 
}: NotificationPermissionProps) {
  const { 
    permission, 
    isSubscribed, 
    isSupported, 
    isLoading, 
    requestPermission,
    toggleNotifications 
  } = useOneSignal();
  const { toast } = useToast();

  // Debug log
  console.log("[NotificationPermission] isSupported:", isSupported, "isLoading:", isLoading, "permission:", permission);

  if (!isSupported && !isLoading) {
    return (
      <div className={`flex items-center justify-between p-4 rounded-lg bg-muted ${className}`}>
        <p className="text-sm text-muted-foreground">
          Notificações não são suportadas neste navegador
        </p>
      </div>
    );
  }

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    
    if (result === "granted") {
      toast({
        title: "Notificações ativadas!",
        description: "Você receberá atualizações importantes.",
      });
    } else if (result === "denied") {
      toast({
        title: "Permissão negada",
        description: "Você pode ativar nas configurações do navegador.",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async () => {
    await toggleNotifications();
    
    if (!isSubscribed) {
      toast({
        title: "Notificações ativadas!",
        description: "Você receberá atualizações importantes.",
      });
    } else {
      toast({
        title: "Notificações desativadas",
        description: "Você não receberá mais notificações.",
      });
    }
  };

  if (variant === "button") {
    if (permission === "denied") {
      return (
        <Button 
          variant="outline" 
          disabled 
          className={className}
        >
          <BellOff className="h-4 w-4 mr-2" />
          Bloqueado
        </Button>
      );
    }

    if (isSubscribed) {
      return (
        <Button 
          variant="outline" 
          onClick={handleToggle}
          disabled={isLoading}
          className={className}
        >
          <Check className="h-4 w-4 mr-2 text-primary" />
          Notificações ativas
        </Button>
      );
    }

    return (
      <Button 
        onClick={handleRequestPermission}
        disabled={isLoading}
        className={className}
      >
        <Bell className="h-4 w-4 mr-2" />
        Ativar notificações
      </Button>
    );
  }

  // Card variant for settings page
  if (variant === "card") {
    return (
      <div className={`flex items-center justify-between p-4 rounded-lg bg-muted ${className}`}>
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium">Notificações push</p>
            <p className="text-sm text-muted-foreground">
              {permission === "denied" 
                ? "Bloqueado nas configurações do navegador"
                : isSubscribed 
                  ? "Você receberá atualizações"
                  : "Receba atualizações importantes"
              }
            </p>
          </div>
        </div>
        <Button
          variant={isSubscribed ? "outline" : "default"}
          size="sm"
          onClick={isSubscribed ? handleToggle : handleRequestPermission}
          disabled={isLoading || permission === "denied"}
        >
          {isSubscribed ? "Desativar" : "Ativar"}
        </Button>
      </div>
    );
  }

  return null;
}

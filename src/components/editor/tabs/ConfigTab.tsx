import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, ExternalLink, Copy, Check } from "lucide-react";
import { EditorProfile } from "@/hooks/useEditorState";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { buildSubdomainUrl } from "@/utils/subdomain";
import { NotificationPermission } from "@/components/NotificationPermission";

interface ConfigTabProps {
  profile: EditorProfile;
  onUpdate: (updates: Partial<EditorProfile>) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

export function ConfigTab({ profile, onUpdate, onSave, isDirty, isSaving }: ConfigTabProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const pageUrl = buildSubdomainUrl(profile.username || "");

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link da sua página foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleOpenPage = () => {
    if (profile.username) {
      window.open(buildSubdomainUrl(profile.username), "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>
            Configure o slug e publique sua página.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug da página</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">/@</span>
              <Input
                id="slug"
                value={profile.username}
                onChange={(e) => onUpdate({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                placeholder="seunome"
                className="flex-1"
              />
            </div>
          </div>

          {/* Page URL */}
          {profile.username && (
            <div className="space-y-2">
              <Label>Link da sua página</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="flex-1 text-sm truncate">{pageUrl}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={handleOpenPage}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>
            Gerencie suas preferências de notificação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPermission variant="card" />
        </CardContent>
      </Card>

      {/* Save Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            <Button
              onClick={onSave}
              disabled={!isDirty || isSaving}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>

            {isDirty && (
              <Badge variant="secondary" className="self-center">
                Você tem alterações não salvas
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

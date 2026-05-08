import { EditorProfile } from "@/hooks/useEditorState";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface FooterSectionProps {
  profile: EditorProfile;
  onUpdate: (updates: Partial<EditorProfile>) => void;
}

export function FooterSection({ profile, onUpdate }: FooterSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Rodapé</h3>
        <p className="text-sm text-muted-foreground">
          Configure as opções do rodapé da sua página
        </p>
      </div>

      {/* Branding Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Mostrar branding</Label>
          <p className="text-xs text-muted-foreground">
            Exibe "Feito com ❤️ no Link na Bio" no rodapé
          </p>
        </div>
        <Switch
          checked={true}
          disabled
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Mais opções de personalização em breve!
      </p>
    </div>
  );
}

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RotateCcw } from "lucide-react";
import { EditorProfile } from "@/hooks/useEditorState";
import { cn } from "@/lib/utils";

const BORDER_RADIUS_OPTIONS = [
  { value: "rounded-none", label: "Quadrado", preview: "rounded-none" },
  { value: "rounded-xl", label: "Arredondado", preview: "rounded-xl" },
  { value: "rounded-full", label: "Pílula", preview: "rounded-full" },
];

interface CustomizeTabProps {
  profile: EditorProfile;
  onUpdate: (updates: Partial<EditorProfile>) => void;
}

export function CustomizeTab({ profile, onUpdate }: CustomizeTabProps) {
  return (
    <div className="space-y-6">
      {/* Button Style */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Estilo dos Botões</Label>
        <RadioGroup
          value={profile.globalButtonStyle}
          onValueChange={(v) => onUpdate({ globalButtonStyle: v as "filled" | "outline" })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="filled" id="global-filled" />
            <Label htmlFor="global-filled" className="font-normal cursor-pointer">
              Preenchido
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="outline" id="global-outline" />
            <Label htmlFor="global-outline" className="font-normal cursor-pointer">
              Outline
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Button Format */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Formato dos Botões</Label>
        <div className="flex gap-2">
          {BORDER_RADIUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdate({ globalButtonBorderRadius: option.value })}
              className={cn(
                "flex-1 py-3 px-2 border-2 transition-all text-sm",
                option.preview,
                profile.globalButtonBorderRadius === option.value
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-muted-foreground/50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Cor de Fundo</Label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              type="color"
              value={profile.globalBackgroundColor || "#f5f5f5"}
              onChange={(e) => onUpdate({ globalBackgroundColor: e.target.value })}
              className="w-12 h-12 p-1 cursor-pointer rounded-lg border-2"
            />
          </div>
          <div className="flex-1">
            <Input
              type="text"
              value={profile.globalBackgroundColor || ""}
              onChange={(e) => onUpdate({ globalBackgroundColor: e.target.value })}
              placeholder="Ex: #ffffff ou usar seletor"
              className="font-mono text-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdate({ globalBackgroundColor: null })}
            title="Resetar para padrão do template"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Define a cor de fundo da sua página. Deixe vazio para usar o padrão do template.
        </p>
      </div>

      {/* Button Background Color */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Cor dos Botões</Label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              type="color"
              value={profile.globalButtonBgColor || "#000000"}
              onChange={(e) => onUpdate({ globalButtonBgColor: e.target.value })}
              className="w-12 h-12 p-1 cursor-pointer rounded-lg border-2"
            />
          </div>
          <div className="flex-1">
            <Input
              type="text"
              value={profile.globalButtonBgColor || ""}
              onChange={(e) => onUpdate({ globalButtonBgColor: e.target.value })}
              placeholder="Ex: #000000 ou usar seletor"
              className="font-mono text-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdate({ globalButtonBgColor: null })}
            title="Resetar para padrão do template"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Button Text Color */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Cor do Texto</Label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              type="color"
              value={profile.globalButtonTextColor || "#ffffff"}
              onChange={(e) => onUpdate({ globalButtonTextColor: e.target.value })}
              className="w-12 h-12 p-1 cursor-pointer rounded-lg border-2"
            />
          </div>
          <div className="flex-1">
            <Input
              type="text"
              value={profile.globalButtonTextColor || ""}
              onChange={(e) => onUpdate({ globalButtonTextColor: e.target.value })}
              placeholder="Ex: #ffffff ou usar seletor"
              className="font-mono text-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdate({ globalButtonTextColor: null })}
            title="Resetar para padrão do template"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
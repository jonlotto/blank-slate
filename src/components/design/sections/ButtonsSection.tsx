import { useState } from "react";
import { Check, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditorProfile } from "@/hooks/useEditorState";

interface ButtonsSectionProps {
  profile: EditorProfile;
  onUpdate: (updates: Partial<EditorProfile>) => void;
}

const BUTTON_STYLES = [
  { id: "filled", label: "Preenchido" },
  { id: "outline", label: "Outline" },
] as const;

const BUTTON_SHAPES = [
  { id: "rounded-none", label: "Quadrado", preview: "rounded-none" },
  { id: "rounded-xl", label: "Arredondado", preview: "rounded-xl" },
  { id: "rounded-full", label: "Pílula", preview: "rounded-full" },
] as const;

const PRESET_COLORS = [
  { name: "Coral", value: "#FF7F6B" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#22C55E" },
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Laranja", value: "#F97316" },
  { name: "Preto", value: "#1A1A1A" },
  { name: "Branco", value: "#FFFFFF" },
];

export function ButtonsSection({ profile, onUpdate }: ButtonsSectionProps) {
  const [customBgColor, setCustomBgColor] = useState(profile.globalButtonBgColor || "#FF7F6B");
  const [customTextColor, setCustomTextColor] = useState(profile.globalButtonTextColor || "#FFFFFF");

  const handleReset = () => {
    onUpdate({
      globalButtonBgColor: null,
      globalButtonTextColor: null,
      globalButtonStyle: "filled",
      globalButtonBorderRadius: "rounded-xl",
    });
  };

  const isCustomBgColorSelected = profile.globalButtonBgColor && 
    !PRESET_COLORS.some(c => c.value === profile.globalButtonBgColor);
  
  const isCustomTextColorSelected = profile.globalButtonTextColor && 
    !PRESET_COLORS.some(c => c.value === profile.globalButtonTextColor);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Botões</h3>
        <p className="text-sm text-muted-foreground">
          Personalize o estilo dos seus botões
        </p>
      </div>

      {/* Button Preview */}
      <div className="p-4 bg-muted/50 rounded-xl">
        <Label className="text-xs text-muted-foreground mb-3 block">Preview</Label>
        <button
          className={cn(
            "w-full py-3 px-4 font-medium transition-all",
            profile.globalButtonBorderRadius || "rounded-xl",
            profile.globalButtonStyle === "outline" 
              ? "bg-transparent border-2" 
              : ""
          )}
          style={{
            backgroundColor: profile.globalButtonStyle === "filled" 
              ? (profile.globalButtonBgColor || "#FF7F6B") 
              : "transparent",
            color: profile.globalButtonTextColor || "#FFFFFF",
            borderColor: profile.globalButtonStyle === "outline" 
              ? (profile.globalButtonBgColor || "#FF7F6B") 
              : undefined,
          }}
        >
          Exemplo de botão
        </button>
      </div>

      {/* Button Style */}
      <div className="space-y-3">
        <Label>Estilo</Label>
        <div className="grid grid-cols-2 gap-2">
          {BUTTON_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onUpdate({ globalButtonStyle: style.id })}
              className={cn(
                "py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all",
                profile.globalButtonStyle === style.id
                  ? "border-primary bg-white"
                  : "border-gray-200 bg-gray-50 text-muted-foreground hover:border-gray-300"
              )}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Button Shape */}
      <div className="space-y-3">
        <Label>Formato</Label>
        <div className="grid grid-cols-3 gap-2">
          {BUTTON_SHAPES.map((shape) => (
            <button
              key={shape.id}
              onClick={() => onUpdate({ globalButtonBorderRadius: shape.id })}
              className={cn(
                "py-3 px-3 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-2",
                profile.globalButtonBorderRadius === shape.id
                  ? "border-primary bg-white"
                  : "border-gray-200 bg-gray-50 text-muted-foreground hover:border-gray-300"
              )}
            >
              <div 
                className={cn("w-full h-4 bg-primary/40", shape.preview)} 
              />
              <span className="text-xs">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-3">
        <Label>Cor de fundo</Label>
        <div className="flex flex-wrap gap-3">
          {PRESET_COLORS.map((color) => {
            const isSelected = profile.globalButtonBgColor === color.value;
            
            return (
              <button
                key={color.value}
                onClick={() => {
                  setCustomBgColor(color.value);
                  onUpdate({ globalButtonBgColor: color.value });
                }}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all relative shadow-sm",
                  isSelected 
                    ? "border-primary ring-2 ring-primary/30 scale-110" 
                    : "border-gray-200 hover:border-gray-300 hover:scale-105"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {isSelected && (
                  <Check 
                    className={cn(
                      "absolute inset-0 m-auto h-4 w-4",
                      color.value === "#FFFFFF" ? "text-gray-700" : "text-white"
                    )} 
                  />
                )}
              </button>
            );
          })}
          
          {/* Custom Color Picker */}
          <div className="relative">
            <button
              className={cn(
                "w-10 h-10 rounded-full border-2 border-dashed transition-all flex items-center justify-center shadow-sm",
                isCustomBgColorSelected
                  ? "border-primary ring-2 ring-primary/30 scale-110"
                  : "border-gray-300 hover:border-gray-400 hover:scale-105"
              )}
              style={{ 
                backgroundColor: isCustomBgColorSelected ? customBgColor : "transparent" 
              }}
              title="Cor personalizada"
            >
              {isCustomBgColorSelected ? (
                <Check className="h-4 w-4 text-white mix-blend-difference" />
              ) : (
                <Pencil className="h-4 w-4 text-gray-400" />
              )}
            </button>
            <input
              type="color"
              value={customBgColor}
              onChange={(e) => {
                setCustomBgColor(e.target.value);
                onUpdate({ globalButtonBgColor: e.target.value });
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Color Value Display */}
        <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
          <div 
            className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner"
            style={{ backgroundColor: profile.globalButtonBgColor || "#FF7F6B" }}
          />
          <input
            type="text"
            value={(profile.globalButtonBgColor || "#FF7F6B").toUpperCase()}
            onChange={(e) => {
              const value = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                setCustomBgColor(value);
                if (value.length === 7) {
                  onUpdate({ globalButtonBgColor: value });
                }
              }
            }}
            className="flex-1 bg-transparent text-sm font-mono text-muted-foreground"
          />
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-3">
        <Label>Cor do texto</Label>
        <div className="flex flex-wrap gap-3">
          {PRESET_COLORS.map((color) => {
            const isSelected = profile.globalButtonTextColor === color.value;
            
            return (
              <button
                key={color.value}
                onClick={() => {
                  setCustomTextColor(color.value);
                  onUpdate({ globalButtonTextColor: color.value });
                }}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all relative shadow-sm",
                  isSelected 
                    ? "border-primary ring-2 ring-primary/30 scale-110" 
                    : "border-gray-200 hover:border-gray-300 hover:scale-105"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {isSelected && (
                  <Check 
                    className={cn(
                      "absolute inset-0 m-auto h-4 w-4",
                      color.value === "#FFFFFF" ? "text-gray-700" : "text-white"
                    )} 
                  />
                )}
              </button>
            );
          })}
          
          {/* Custom Color Picker */}
          <div className="relative">
            <button
              className={cn(
                "w-10 h-10 rounded-full border-2 border-dashed transition-all flex items-center justify-center shadow-sm",
                isCustomTextColorSelected
                  ? "border-primary ring-2 ring-primary/30 scale-110"
                  : "border-gray-300 hover:border-gray-400 hover:scale-105"
              )}
              style={{ 
                backgroundColor: isCustomTextColorSelected ? customTextColor : "transparent" 
              }}
              title="Cor personalizada"
            >
              {isCustomTextColorSelected ? (
                <Check className="h-4 w-4 text-white mix-blend-difference" />
              ) : (
                <Pencil className="h-4 w-4 text-gray-400" />
              )}
            </button>
            <input
              type="color"
              value={customTextColor}
              onChange={(e) => {
                setCustomTextColor(e.target.value);
                onUpdate({ globalButtonTextColor: e.target.value });
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Color Value Display */}
        <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
          <div 
            className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner"
            style={{ backgroundColor: profile.globalButtonTextColor || "#FFFFFF" }}
          />
          <input
            type="text"
            value={(profile.globalButtonTextColor || "#FFFFFF").toUpperCase()}
            onChange={(e) => {
              const value = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                setCustomTextColor(value);
                if (value.length === 7) {
                  onUpdate({ globalButtonTextColor: value });
                }
              }
            }}
            className="flex-1 bg-transparent text-sm font-mono text-muted-foreground"
          />
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        className="w-full"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Restaurar padrões
      </Button>
    </div>
  );
}
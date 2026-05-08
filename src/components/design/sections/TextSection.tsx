import { useState } from "react";
import { Check, ChevronDown, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorProfile } from "@/hooks/useEditorState";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRESET_TEXT_COLORS = [
  { name: "Branco", value: "#FFFFFF" },
  { name: "Preto", value: "#1A1A1A" },
  { name: "Cinza", value: "#6B7280" },
  { name: "Coral", value: "#FF7F6B" },
  { name: "Azul", value: "#3B82F6" },
];

interface TextSectionProps {
  profile: EditorProfile;
  onUpdate: (updates: Partial<EditorProfile>) => void;
}

const FONTS = [
  // Sans Serif
  { id: "Inter", label: "Inter", category: "Sans Serif" },
  { id: "Poppins", label: "Poppins", category: "Sans Serif" },
  { id: "Roboto", label: "Roboto", category: "Sans Serif" },
  { id: "Montserrat", label: "Montserrat", category: "Sans Serif" },
  { id: "Lato", label: "Lato", category: "Sans Serif" },
  { id: "Raleway", label: "Raleway", category: "Sans Serif" },
  { id: "Nunito", label: "Nunito", category: "Sans Serif" },
  { id: "Space Grotesk", label: "Space Grotesk", category: "Sans Serif" },
  { id: "DM Sans", label: "DM Sans", category: "Sans Serif" },
  // Serif
  { id: "Playfair Display", label: "Playfair Display", category: "Serif" },
  { id: "Merriweather", label: "Merriweather", category: "Serif" },
  { id: "Lora", label: "Lora", category: "Serif" },
  { id: "Crimson Text", label: "Crimson Text", category: "Serif" },
  // Display
  { id: "Oswald", label: "Oswald", category: "Display" },
  { id: "Bebas Neue", label: "Bebas Neue", category: "Display" },
  { id: "Righteous", label: "Righteous", category: "Display" },
  { id: "Archivo Black", label: "Archivo Black", category: "Display" },
  { id: "Lobster", label: "Lobster", category: "Display" },
  // Handwritten
  { id: "Pacifico", label: "Pacifico", category: "Handwritten" },
  { id: "Dancing Script", label: "Dancing Script", category: "Handwritten" },
  { id: "Caveat", label: "Caveat", category: "Handwritten" },
  { id: "Satisfy", label: "Satisfy", category: "Handwritten" },
];

export function TextSection({ profile, onUpdate }: TextSectionProps) {
  const selectedFont = FONTS.find(f => f.id === profile.titleFont) || FONTS[0];
  const [customTextColor, setCustomTextColor] = useState(profile.titleColor || "#1A1A1A");

  const isCustomTextColorSelected = profile.titleColor && 
    !PRESET_TEXT_COLORS.some(c => c.value === profile.titleColor);

  const handleResetText = () => {
    onUpdate({
      titleFont: "Inter",
      titleSize: "large",
      titleColor: null,
    });
    setCustomTextColor("#1A1A1A");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Texto</h3>
        <p className="text-sm text-muted-foreground">
          Edite as informações e estilo do seu perfil
        </p>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Nome de exibição</Label>
        <Input
          id="displayName"
          value={profile.displayName}
          onChange={(e) => onUpdate({ displayName: e.target.value })}
          placeholder="Seu nome"
        />
      </div>


      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={profile.bio}
          onChange={(e) => onUpdate({ bio: e.target.value })}
          placeholder="Uma breve descrição sobre você..."
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {profile.bio.length}/150 caracteres
        </p>
      </div>

      {/* Typography Section */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Tipografia
        </h4>

        {/* Font Selector */}
        <div className="space-y-3">
          <Label>Fonte</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full py-3 px-4 bg-muted/50 rounded-xl flex justify-between items-center hover:bg-muted transition-colors">
                <span className="text-sm text-muted-foreground">Fonte</span>
                <span className="font-medium flex items-center gap-1" style={{ fontFamily: selectedFont.id }}>
                  {selectedFont.label}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-60 overflow-y-auto bg-background">
              {FONTS.map((font) => (
                <DropdownMenuItem
                  key={font.id}
                  onClick={() => onUpdate({ titleFont: font.id })}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span style={{ fontFamily: font.id }}>{font.label}</span>
                  {profile.titleFont === font.id && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title Size */}
        <div className="space-y-3 mt-4">
          <Label>Tamanho do título</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdate({ titleSize: "small" })}
              className={cn(
                "py-3 rounded-xl border-2 font-medium transition-all",
                profile.titleSize === "small"
                  ? "border-primary bg-white"
                  : "border-gray-200 bg-gray-50 text-muted-foreground hover:border-gray-300"
              )}
            >
              Pequeno
            </button>
            <button
              onClick={() => onUpdate({ titleSize: "large" })}
              className={cn(
                "py-3 rounded-xl border-2 font-medium transition-all",
                profile.titleSize === "large"
                  ? "border-primary bg-white"
                  : "border-gray-200 bg-gray-50 text-muted-foreground hover:border-gray-300"
              )}
            >
              Grande
            </button>
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-3 mt-4">
          <Label>Cor do texto</Label>
          <div className="flex flex-wrap gap-3">
            {PRESET_TEXT_COLORS.map((color) => {
              const isSelected = profile.titleColor === color.value;
              
              return (
                <button
                  key={color.value}
                  onClick={() => {
                    setCustomTextColor(color.value);
                    onUpdate({ titleColor: color.value });
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
                        color.value === "#FFFFFF" || color.value === "#6B7280" ? "text-gray-700" : "text-white"
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
                  onUpdate({ titleColor: e.target.value });
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Color Value Display */}
          <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner"
              style={{ backgroundColor: profile.titleColor || "#1A1A1A" }}
            />
            <input
              type="text"
              value={(profile.titleColor || "#1A1A1A").toUpperCase()}
              onChange={(e) => {
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setCustomTextColor(value);
                  if (value.length === 7) {
                    onUpdate({ titleColor: value });
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
          onClick={handleResetText}
          className="w-full mt-4"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar padrões
        </Button>
      </div>
    </div>
  );
}
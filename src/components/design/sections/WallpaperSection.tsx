import { useState, useRef } from "react";
import { Check, Pencil, RotateCcw, Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorProfile } from "@/hooks/useEditorState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface WallpaperSectionProps {
  profile: EditorProfile;
  onUpdate: (updates: Partial<EditorProfile>) => void;
}

const PRESET_COLORS = [
  { name: "Coral", value: "#FF7F6B" },
  { name: "Pêssego", value: "#FFBE9D" },
  { name: "Rosa", value: "#FFB5D0" },
  { name: "Lavanda", value: "#D4BBFF" },
  { name: "Azul", value: "#89CFF0" },
  { name: "Menta", value: "#98FB98" },
  { name: "Amarelo", value: "#FFFACD" },
  { name: "Branco", value: "#FFFFFF" },
  { name: "Cinza Claro", value: "#F5F5F5" },
  { name: "Cinza", value: "#E0E0E0" },
  { name: "Cinza Escuro", value: "#424242" },
  { name: "Preto", value: "#1A1A1A" },
];

const PRESET_GRADIENTS = [
  { name: "Sunset", value: "linear-gradient(135deg, #FF6B6B, #FFE66D)" },
  { name: "Ocean", value: "linear-gradient(135deg, #667eea, #764ba2)" },
  { name: "Forest", value: "linear-gradient(135deg, #11998e, #38ef7d)" },
  { name: "Rose", value: "linear-gradient(135deg, #ee9ca7, #ffdde1)" },
  { name: "Night", value: "linear-gradient(135deg, #2c3e50, #4ca1af)" },
  { name: "Peach", value: "linear-gradient(135deg, #FFBE9D, #FFB5D0)" },
  { name: "Lavender", value: "linear-gradient(135deg, #a18cd1, #fbc2eb)" },
  { name: "Mint", value: "linear-gradient(135deg, #96fbc4, #f9f586)" },
  { name: "Fire", value: "linear-gradient(135deg, #f83600, #f9d423)" },
  { name: "Sky", value: "linear-gradient(135deg, #56CCF2, #2F80ED)" },
  { name: "Purple", value: "linear-gradient(135deg, #7F00FF, #E100FF)" },
  { name: "Warm", value: "linear-gradient(135deg, #FF512F, #F09819)" },
];

export function WallpaperSection({ profile, onUpdate }: WallpaperSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customColor, setCustomColor] = useState(profile.globalBackgroundColor || "#FFFFFF");
  const [isUploading, setIsUploading] = useState(false);

  // Determine current active tab
  const getCurrentTab = () => {
    if (profile.globalBackgroundImage) return "image";
    if (profile.globalBackgroundColor?.startsWith("linear-gradient")) return "gradient";
    return "color";
  };

  const handleColorSelect = (color: string) => {
    setCustomColor(color);
    onUpdate({ 
      globalBackgroundColor: color,
      globalBackgroundImage: null 
    });
  };

  const handleGradientSelect = (gradient: string) => {
    onUpdate({ 
      globalBackgroundColor: gradient,
      globalBackgroundImage: null 
    });
  };

  const handleReset = () => {
    setCustomColor("#FFFFFF");
    onUpdate({ 
      globalBackgroundColor: null,
      globalBackgroundImage: null 
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/background-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      onUpdate({ 
        globalBackgroundImage: urlData.publicUrl,
        globalBackgroundColor: null 
      });

      toast({
        title: "Imagem enviada",
        description: "Sua imagem de fundo foi atualizada.",
      });
    } catch (error) {
      console.error("Error uploading background:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    onUpdate({ globalBackgroundImage: null });
  };

  const isCustomColorSelected = profile.globalBackgroundColor && 
    !PRESET_COLORS.some(c => c.value === profile.globalBackgroundColor) &&
    !profile.globalBackgroundColor.startsWith("linear-gradient");

  const isGradient = profile.globalBackgroundColor?.startsWith("linear-gradient");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Fundo</h3>
        <p className="text-sm text-muted-foreground">
          Personalize o fundo da sua página
        </p>
      </div>

      <Tabs defaultValue={getCurrentTab()} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="color">Cor</TabsTrigger>
          <TabsTrigger value="gradient">Gradiente</TabsTrigger>
          <TabsTrigger value="image">Imagem</TabsTrigger>
        </TabsList>

        {/* Solid Colors Tab */}
        <TabsContent value="color" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label>Cores</Label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map((color) => {
                const isSelected = profile.globalBackgroundColor === color.value;
                const isDark = color.value === "#1A1A1A" || color.value === "#424242";
                
                return (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
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
                          isDark ? "text-white" : "text-gray-700"
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
                    isCustomColorSelected
                      ? "border-primary ring-2 ring-primary/30 scale-110"
                      : "border-gray-300 hover:border-gray-400 hover:scale-105"
                  )}
                  style={{ 
                    backgroundColor: isCustomColorSelected ? customColor : "transparent" 
                  }}
                  title="Cor personalizada"
                >
                  {isCustomColorSelected ? (
                    <Check className="h-4 w-4 text-white mix-blend-difference" />
                  ) : (
                    <Pencil className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner"
              style={{ backgroundColor: !isGradient ? (profile.globalBackgroundColor || "#FFFFFF") : "#FFFFFF" }}
            />
            <input
              type="text"
              value={(!isGradient ? (profile.globalBackgroundColor || "#FFFFFF") : "#FFFFFF").toUpperCase()}
              onChange={(e) => {
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setCustomColor(value);
                  if (value.length === 7) {
                    onUpdate({ globalBackgroundColor: value, globalBackgroundImage: null });
                  }
                }
              }}
              className="flex-1 bg-transparent text-sm font-mono text-muted-foreground"
              placeholder="#FFFFFF"
            />
          </div>
        </TabsContent>

        {/* Gradients Tab */}
        <TabsContent value="gradient" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label>Gradientes</Label>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_GRADIENTS.map((gradient) => {
                const isSelected = profile.globalBackgroundColor === gradient.value;
                
                return (
                  <button
                    key={gradient.name}
                    onClick={() => handleGradientSelect(gradient.value)}
                    className={cn(
                      "aspect-square rounded-xl border-2 transition-all relative shadow-sm",
                      isSelected 
                        ? "border-primary ring-2 ring-primary/30 scale-105" 
                        : "border-gray-200 hover:border-gray-300 hover:scale-105"
                    )}
                    style={{ background: gradient.value }}
                    title={gradient.name}
                  >
                    {isSelected && (
                      <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Image Tab */}
        <TabsContent value="image" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label>Imagem de Fundo</Label>
            
            {profile.globalBackgroundImage ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                <img 
                  src={profile.globalBackgroundImage} 
                  alt="Background" 
                  className="w-full aspect-video object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all",
                  isUploading && "opacity-50 pointer-events-none"
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                      <p className="text-sm text-muted-foreground">Enviando...</p>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-muted rounded-full">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Clique para enviar</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {profile.globalBackgroundImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Trocar imagem
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Button */}
      {(profile.globalBackgroundColor || profile.globalBackgroundImage) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar padrão do tema
        </Button>
      )}
    </div>
  );
}
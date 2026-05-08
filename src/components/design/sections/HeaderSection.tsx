import { useState } from "react";
import { ImageIcon, Upload, X, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditorProfile } from "@/hooks/useEditorState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BannerCropModal } from "@/components/editor/BannerCropModal";

interface HeaderSectionProps {
  profile: EditorProfile;
  onUpdate: (updates: Partial<EditorProfile>) => void;
}

export function HeaderSection({ profile, onUpdate }: HeaderSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [initialCropOffsetY, setInitialCropOffsetY] = useState(0);

  const handleImageUpload = async (
    file: File,
    type: "avatar" | "banner"
  ) => {
    if (!user) return;

    const setUploading = type === "avatar" ? setIsUploadingAvatar : setIsUploadingBanner;
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      if (type === "avatar") {
        onUpdate({ avatarUrl: urlData.publicUrl });
        toast({
          title: "Upload concluído",
          description: "Avatar atualizado com sucesso!",
        });
      } else {
        // Save as original and open crop modal
        onUpdate({ bannerOriginalUrl: urlData.publicUrl });
        setImageToCrop(urlData.publicUrl);
        setInitialCropOffsetY(0);
        setCropModalOpen(true);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob, offsetY: number) => {
    if (!user) return;

    setCropModalOpen(false);
    setIsUploadingBanner(true);

    try {
      const fileName = `${user.id}/banner-cropped-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, croppedBlob, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      onUpdate({
        bannerUrl: `${urlData.publicUrl}?t=${Date.now()}`,
        bannerCropOffsetY: offsetY,
      });

      toast({
        title: "Banner atualizado",
        description: "Imagem de capa salva com sucesso!",
      });
    } catch (error) {
      console.error("Error saving cropped banner:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o banner.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleEditBanner = () => {
    const imageUrl = profile.bannerOriginalUrl || profile.bannerUrl;
    if (imageUrl) {
      setImageToCrop(imageUrl);
      setInitialCropOffsetY(profile.bannerCropOffsetY || 0);
      setCropModalOpen(true);
    }
  };

  const removeImage = (type: "avatar" | "banner") => {
    if (type === "avatar") {
      onUpdate({ avatarUrl: null });
    } else {
      onUpdate({ bannerUrl: null, bannerOriginalUrl: null });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Header</h3>
        <p className="text-sm text-muted-foreground">
          Configure seu avatar e banner
        </p>
      </div>

      {/* Avatar Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Foto de perfil</label>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-2 border-border">
              <AvatarImage src={profile.avatarUrl || undefined} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {profile.displayName?.charAt(0) || profile.username?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            {profile.avatarUrl && (
              <button
                onClick={() => removeImage("avatar")}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground 
                           rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 
                           transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, "avatar");
              }}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={isUploadingAvatar}
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploadingAvatar ? "Enviando..." : "Alterar foto"}
            </Button>
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Banner</label>
        <div 
          className="relative aspect-[8/5] rounded-lg border-2 border-dashed border-border 
                     bg-muted/50 overflow-hidden group cursor-pointer hover:border-primary/50 
                     transition-colors"
          onClick={() => document.getElementById("banner-upload")?.click()}
        >
          {profile.bannerUrl ? (
            <>
              <img 
                src={profile.bannerUrl} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                              transition-opacity flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage("banner");
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground 
                           rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 
                           transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2" />
              <span className="text-sm">Clique para adicionar um banner</span>
            </div>
          )}
        </div>
        <input
          type="file"
          id="banner-upload"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, "banner");
          }}
        />
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground flex-1">
            Recomendado: 1200x750px (proporção 8:5)
          </p>
          {profile.bannerUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditBanner();
              }}
            >
              <Crop className="h-4 w-4 mr-2" />
              Ajustar
            </Button>
          )}
        </div>
      </div>

      <BannerCropModal
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        imageSrc={imageToCrop || ""}
        initialOffsetY={initialCropOffsetY}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}

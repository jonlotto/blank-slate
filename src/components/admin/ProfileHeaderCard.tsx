import { ComponentType, SVGProps, useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditorProfile, EditorLink } from "@/hooks/useEditorState";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { X, Copy, Check, Pencil } from "lucide-react";
import { toast } from "sonner";
import { buildSubdomainUrl } from "@/utils/subdomain";
interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  urlTemplate: string;
  isPhone?: boolean;
}

interface ProfileHeaderCardProps {
  profile: EditorProfile;
  socials: EditorLink[];
  platforms: SocialPlatform[];
  onSelectPlatform: (platform: SocialPlatform, existingSocial?: EditorLink) => void;
  onDeleteSocial: (linkId: string) => void;
  onUpdateUsername: (username: string) => void;
  onUpdateHandle?: (handle: string) => void;
}

export function ProfileHeaderCard({ 
  profile, 
  socials, 
  platforms, 
  onSelectPlatform, 
  onDeleteSocial,
  onUpdateUsername,
  onUpdateHandle
}: ProfileHeaderCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [usernameValue, setUsernameValue] = useState(profile.username || "");
  const [handleValue, setHandleValue] = useState(profile.handle || profile.username || "");
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const handleInputRef = useRef<HTMLInputElement>(null);
  
  // Sync values when profile changes - only when NOT editing
  useEffect(() => {
    if (!isEditingUsername) {
      setUsernameValue(profile.username || "");
    }
    if (!isEditingHandle) {
      setHandleValue(profile.handle || profile.username || "");
    }
  }, [profile.username, profile.handle, isEditingUsername, isEditingHandle]);

  // Focus inputs when editing starts
  useEffect(() => {
    if (isEditingUsername && usernameInputRef.current) {
      usernameInputRef.current.focus();
      usernameInputRef.current.select();
    }
  }, [isEditingUsername]);

  useEffect(() => {
    if (isEditingHandle && handleInputRef.current) {
      handleInputRef.current.focus();
      handleInputRef.current.select();
    }
  }, [isEditingHandle]);
  
  // Create a map of platform id -> existing social link
  const existingSocialsMap = new Map<string, EditorLink>();
  socials.forEach(s => {
    const platform = platforms.find(p => 
      s.icon === p.icon || 
      s.icon?.includes(p.id) ||
      s.title?.toLowerCase() === p.name.toLowerCase()
    );
    if (platform) {
      existingSocialsMap.set(platform.id, s);
    }
  });

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = buildSubdomainUrl(profile.username || "");
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUsername = () => {
    const trimmedValue = usernameValue.trim();
    if (trimmedValue && trimmedValue !== profile.username) {
      onUpdateUsername(trimmedValue);
      toast.success("Username atualizado!");
    } else {
      setUsernameValue(profile.username || "");
    }
    setIsEditingUsername(false);
  };

  const handleSaveHandle = () => {
    const trimmedValue = handleValue.trim();
    const currentHandle = profile.handle || profile.username;
    if (trimmedValue && trimmedValue !== currentHandle) {
      if (onUpdateHandle) {
        onUpdateHandle(trimmedValue);
        toast.success("@ atualizado!");
      } else {
        toast.error("Não foi possível salvar o @");
        setHandleValue(currentHandle || "");
      }
    } else {
      setHandleValue(currentHandle || "");
    }
    setIsEditingHandle(false);
  };

  const handleUsernameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveUsername();
    } else if (e.key === 'Escape') {
      setUsernameValue(profile.username || "");
      setIsEditingUsername(false);
    }
  };

  const handleHandleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveHandle();
    } else if (e.key === 'Escape') {
      setHandleValue(profile.handle || profile.username || "");
      setIsEditingHandle(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-8 px-4 bg-card rounded-2xl border border-border mb-6">
      {/* Avatar */}
      <div className="mb-4">
        <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
          <AvatarImage src={profile.avatarUrl || undefined} />
          <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
            {profile.displayName?.charAt(0) || profile.username?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Handle Display - Editable */}
      {isEditingHandle ? (
        <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-lg ring-2 ring-primary/50 transition-all">
          <span className="text-primary text-sm font-medium">@</span>
          <input
            ref={handleInputRef}
            type="text"
            value={handleValue}
            onChange={(e) => setHandleValue(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
            onBlur={handleSaveHandle}
            onKeyDown={handleHandleKeyDown}
            className="bg-transparent border-none outline-none text-sm font-medium text-foreground w-28 focus:ring-0"
            maxLength={30}
          />
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-sm">@</span>
          <span 
            className="text-muted-foreground text-sm cursor-pointer hover:underline"
            onClick={() => setIsEditingHandle(true)}
          >
            {profile.handle || profile.username || "usuario"}
          </span>
          <button
            onClick={() => setIsEditingHandle(true)}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            title="Editar @"
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Bio Link - Editable */}
      {isEditingUsername ? (
        <div className="flex items-center gap-1 mt-3 px-4 py-2 bg-primary/10 rounded-full ring-2 ring-primary/50 transition-all">
          <input
            ref={usernameInputRef}
            type="text"
            value={usernameValue}
            onChange={(e) => setUsernameValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            onBlur={handleSaveUsername}
            onKeyDown={handleUsernameKeyDown}
            className="bg-transparent border-none outline-none text-sm font-medium text-foreground w-28 focus:ring-0 text-right"
            maxLength={30}
          />
          <span className="text-sm font-medium text-primary">.biobr.site</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 mt-3 px-4 py-2 bg-muted/50 rounded-full">
          <span 
            className="text-sm font-medium text-foreground cursor-pointer hover:underline"
            onClick={() => setIsEditingUsername(true)}
          >
            {profile.username || "usuario"}
          </span>
          <span className="text-sm text-muted-foreground">.biobr.site</span>
          <button
            onClick={() => setIsEditingUsername(true)}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            title="Editar username"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            title="Copiar link"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      )}

      {/* Social Platform Icons Row */}
      <TooltipProvider delayDuration={100}>
        <div className="flex items-center gap-2 mt-6">
          {platforms.map((platform) => {
            const existingSocial = existingSocialsMap.get(platform.id);
            const isAdded = !!existingSocial;
            const Icon = platform.Icon;
            
            return (
              <Tooltip key={platform.id}>
                <TooltipTrigger asChild>
                  <div className="relative group">
                    {/* Delete button (appears on hover for added socials) */}
                    {isAdded && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSocial(existingSocial.id);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground 
                                   rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                                   flex items-center justify-center z-10 hover:bg-destructive/90"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => onSelectPlatform(platform, existingSocial)}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all
                        ${isAdded 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isAdded ? `Editar ${platform.name}` : `Adicionar ${platform.name}`}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}

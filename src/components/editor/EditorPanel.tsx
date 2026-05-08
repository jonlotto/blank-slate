import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Link2, Share2, Settings, Palette } from "lucide-react";
import { ProfileTab } from "./tabs/ProfileTab";
import { ButtonsTab } from "./tabs/ButtonsTab";
import { SocialsTab } from "./tabs/SocialsTab";
import { ConfigTab } from "./tabs/ConfigTab";
import { CustomizeTab } from "./tabs/CustomizeTab";
import { EditorProfile, EditorLink } from "@/hooks/useEditorState";
import { Badge } from "@/components/ui/badge";

interface EditorPanelProps {
  profile: EditorProfile;
  links: EditorLink[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  onUpdateProfile: (updates: Partial<EditorProfile>) => void;
  onAddLink: (link: Omit<EditorLink, "id" | "order">) => string;
  onUpdateLink: (id: string, updates: Partial<EditorLink>) => void;
  onDeleteLink: (id: string) => void;
  onDuplicateLink: (id: string) => void;
  onReorderLinks: (newOrder: string[]) => void;
  onSave: () => void;
  selectedLinkId: string | null;
  onSelectLink: (id: string | null) => void;
  focusField?: "avatar" | "username" | "bio" | null;
}

export function EditorPanel({
  profile,
  links,
  isDirty,
  isSaving,
  lastSaved,
  onUpdateProfile,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onDuplicateLink,
  onReorderLinks,
  onSave,
  selectedLinkId,
  onSelectLink,
  focusField,
}: EditorPanelProps) {
  const buttons = links.filter((l) => l.linkType === "button");
  const socials = links.filter((l) => l.linkType === "social");

  return (
    <div className="space-y-4">
      {/* Save Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="secondary" className="animate-pulse">
              Alterações não salvas
            </Badge>
          )}
          {isSaving && (
            <Badge variant="outline">Salvando...</Badge>
          )}
          {!isDirty && !isSaving && lastSaved && (
            <Badge variant="outline" className="text-muted-foreground">
              Salvo às {lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="buttons" className="flex items-center gap-1.5">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Botões</span>
          </TabsTrigger>
          <TabsTrigger value="socials" className="flex items-center gap-1.5">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Ícones</span>
          </TabsTrigger>
          <TabsTrigger value="customize" className="flex items-center gap-1.5">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Personalizar</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-1.5">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab
            profile={profile}
            onUpdate={onUpdateProfile}
            focusField={focusField}
          />
        </TabsContent>

        <TabsContent value="buttons" className="mt-4">
          <ButtonsTab
            links={buttons}
            onAdd={(link) => onAddLink({ ...link, linkType: "button" })}
            onUpdate={onUpdateLink}
            onDelete={onDeleteLink}
            onDuplicate={onDuplicateLink}
            onReorder={(ids) => {
              const socialIds = socials.map((s) => s.id);
              onReorderLinks([...ids, ...socialIds]);
            }}
            selectedLinkId={selectedLinkId}
            onSelectLink={onSelectLink}
          />
        </TabsContent>

        <TabsContent value="socials" className="mt-4">
          <SocialsTab
            links={socials}
            onAdd={(link) => onAddLink({ ...link, linkType: "social" })}
            onUpdate={onUpdateLink}
            onDelete={onDeleteLink}
            onReorder={(ids) => {
              const buttonIds = buttons.map((b) => b.id);
              onReorderLinks([...buttonIds, ...ids]);
            }}
          />
        </TabsContent>

        <TabsContent value="customize" className="mt-4">
          <CustomizeTab
            profile={profile}
            onUpdate={onUpdateProfile}
          />
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <ConfigTab
            profile={profile}
            onUpdate={onUpdateProfile}
            onSave={onSave}
            isDirty={isDirty}
            isSaving={isSaving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

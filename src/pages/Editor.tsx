import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEditorState } from "@/hooks/useEditorState";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { EditorPreview } from "@/components/editor/EditorPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { templates } from "@/data/templates";
import { NotificationWelcomeModal } from "@/components/NotificationWelcomeModal";

export default function Editor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const templateSlug = searchParams.get("template") || "starter";
  
  const [focusField, setFocusField] = useState<"avatar" | "username" | "bio" | null>(null);

  const {
    profile,
    links,
    isDirty,
    isSaving,
    lastSaved,
    isLoading,
    updateProfile,
    addLink,
    updateLink,
    deleteLink,
    duplicateLink,
    reorderLinks,
    save,
    selectedLinkId,
    setSelectedLinkId,
  } = useEditorState(templateSlug);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Handle click on preview elements
  const handlePreviewClick = (type: "avatar" | "username" | "bio" | "link", linkId?: string) => {
    if (type === "link" && linkId) {
      setSelectedLinkId(linkId);
    } else {
      setFocusField(type as "avatar" | "username" | "bio");
      // Reset focus field after a short delay
      setTimeout(() => setFocusField(null), 100);
    }
  };


  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentTemplate = templates.find((t) => t.slug === profile.templateSlug) || templates[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold">Editor</h1>
              <p className="text-xs text-muted-foreground">
                Template: {currentTemplate.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                Alterações não salvas
              </span>
            )}
            <Button
              size="sm"
              onClick={save}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        <EditorLayout
          panel={
            <EditorPanel
              profile={profile}
              links={links}
              isDirty={isDirty}
              isSaving={isSaving}
              lastSaved={lastSaved}
              onUpdateProfile={updateProfile}
              onAddLink={addLink}
              onUpdateLink={updateLink}
              onDeleteLink={deleteLink}
              onDuplicateLink={duplicateLink}
              onReorderLinks={reorderLinks}
              onSave={save}
              selectedLinkId={selectedLinkId}
              onSelectLink={setSelectedLinkId}
              focusField={focusField}
            />
          }
          preview={
            <EditorPreview
              profile={profile}
              links={links}
              onClickElement={handlePreviewClick}
            />
          }
        />
      </main>

      {/* Notification Permission Modal - shows on first login */}
      <NotificationWelcomeModal userId={user?.id} />
    </div>
  );
}

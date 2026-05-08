import { useState, useRef, ComponentType, SVGProps } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEditorState, EditorLink } from "@/hooks/useEditorState";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProfileHeaderCard } from "@/components/admin/ProfileHeaderCard";
import { AdminLinksList } from "@/components/admin/AdminLinksList";
import { DesignSidebar, SECTIONS } from "@/components/design/DesignSidebar";
import { EditorPreview } from "@/components/editor/EditorPreview";
import { ButtonEditDrawer } from "@/components/editor/ButtonEditDrawer";
import { SocialAddModal } from "@/components/editor/SocialAddModal";
import { HeaderSection } from "@/components/design/sections/HeaderSection";
import { ThemeSection } from "@/components/design/sections/ThemeSection";
import { WallpaperSection } from "@/components/design/sections/WallpaperSection";
import { TextSection } from "@/components/design/sections/TextSection";
import { ButtonsSection } from "@/components/design/sections/ButtonsSection";
import { FooterSection } from "@/components/design/sections/FooterSection";
import { SettingsSection } from "@/components/design/sections/SettingsSection";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Save, Loader2, Check, Cloud, Menu } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { YouTubeIcon } from "@/components/icons/YouTubeIcon";
import { TwitterIcon } from "@/components/icons/TwitterIcon";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import { EmailIcon } from "@/components/icons/EmailIcon";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import biobrLogo from "@/assets/biobr-logo.png";
import { cn } from "@/lib/utils";

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  urlTemplate: string;
  isPhone?: boolean;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: "instagram", name: "Instagram", icon: "instagram-icon", Icon: InstagramIcon, urlTemplate: "https://instagram.com/{username}" },
  { id: "tiktok", name: "TikTok", icon: "tiktok-icon", Icon: TikTokIcon, urlTemplate: "https://tiktok.com/@{username}" },
  { id: "youtube", name: "YouTube", icon: "youtube-icon", Icon: YouTubeIcon, urlTemplate: "https://youtube.com/@{username}" },
  { id: "twitter", name: "Twitter/X", icon: "twitter-icon", Icon: TwitterIcon, urlTemplate: "https://twitter.com/{username}" },
  { id: "whatsapp", name: "WhatsApp", icon: "whatsapp-icon", Icon: WhatsAppIcon, urlTemplate: "https://wa.me/{phone}", isPhone: true },
  { id: "linkedin", name: "LinkedIn", icon: "linkedin-icon", Icon: LinkedInIcon, urlTemplate: "https://linkedin.com/in/{username}" },
  { id: "email", name: "Email", icon: "email-icon", Icon: EmailIcon, urlTemplate: "mailto:{email}" },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);

export type AdminView = "links" | "design" | "settings";

export default function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Determine initial view based on URL
  const getInitialView = (): AdminView => {
    if (location.pathname === "/design") return "design";
    if (location.pathname === "/settings") return "settings";
    return "links";
  };
  const [activeView, setActiveView] = useState<AdminView>(getInitialView());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    profile,
    links,
    isLoading,
    isSaving,
    isDirty,
    lastSaved,
    updateProfile,
    addLink,
    updateLink,
    deleteLink,
    duplicateLink,
    reorderLinks,
    save,
    selectedLinkId,
    setSelectedLinkId,
  } = useEditorState();

  // Design section scroll spy
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSection = useScrollSpy(SECTION_IDS, containerRef, { offset: 80 });

  // Links state
  const [showAddSocial, setShowAddSocial] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);

  // Handle view change - update URL without full navigation
  const handleViewChange = (view: AdminView) => {
    setActiveView(view);
    // Update URL without reload
    const paths = { links: "/admin", design: "/design", settings: "/settings" };
    window.history.replaceState(null, "", paths[view]);
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Links helpers
  const buttons = links.filter((l) => l.linkType === "button");
  const socials = links.filter((l) => l.linkType === "social");
  const selectedLink = links.find((l) => l.id === selectedLinkId);

  const handleAddLink = () => {
    const newId = addLink({
      title: "Novo Link",
      url: "https://",
      icon: null,
      thumbnailUrl: null,
      linkType: "button",
      style: "filled",
      isActive: true,
      buttonBgColor: null,
      buttonTextColor: null,
      buttonBorderRadius: "rounded-xl",
    });
    setSelectedLinkId(newId);
  };

  const handleAddSocial = (username: string) => {
    if (!selectedPlatform) return;
    
    let url = selectedPlatform.urlTemplate;
    if (selectedPlatform.isPhone) {
      url = url.replace("{phone}", username.replace(/\D/g, ""));
    } else {
      url = url.replace("{username}", username);
    }

    addLink({
      title: selectedPlatform.name,
      url,
      icon: selectedPlatform.icon,
      thumbnailUrl: null,
      linkType: "social",
      style: "filled",
      isActive: true,
      buttonBgColor: null,
      buttonTextColor: null,
      buttonBorderRadius: "rounded-full",
    });
    setShowAddSocial(false);
    setSelectedPlatform(null);
  };

  const handleToggleLink = (id: string, isActive: boolean) => {
    updateLink(id, { isActive });
  };

  const handleSaveLink = (data: Pick<EditorLink, "title" | "url" | "icon" | "isActive"> & { thumbnailUrl?: string | null }) => {
    if (selectedLinkId) {
      updateLink(selectedLinkId, { ...data, thumbnailUrl: data.thumbnailUrl ?? null });
      setSelectedLinkId(null);
    }
  };

  const handlePreviewClick = (type: string, linkId?: string) => {
    if (type === "link" && linkId) {
      setSelectedLinkId(linkId);
    } else if (type === "avatar" || type === "username" || type === "bio") {
      navigate("/editor");
    }
  };

  const handleDesignNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-black border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-black border-white/10">
                <AdminSidebar 
                  activeSection={activeView} 
                  username={profile.username}
                  onNavigate={(view) => {
                    handleViewChange(view);
                    setSidebarOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
            <img src={biobrLogo} alt="BioBR" className="h-6" />
          </div>
          {isDirty && (
            <Button
              onClick={save}
              disabled={isSaving}
              size="sm"
              className="rounded-xl"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          )}
        </header>
      )}

      {/* Desktop Main Navigation Sidebar */}
      {!isMobile && (
        <AdminSidebar 
          activeSection={activeView} 
          username={profile.username}
          onNavigate={handleViewChange}
        />
      )}

      {/* Design Sections Sidebar - only show on design view (desktop only) */}
      {activeView === "design" && !isMobile && (
        <div className="w-56 border-r border-border flex-shrink-0">
          <DesignSidebar 
            activeSection={activeSection} 
            onNavigate={handleDesignNavigate} 
          />
        </div>
      )}

      {/* Main Content */}
      {activeView === "links" ? (
        <main key="links" className={cn("flex-1 overflow-auto animate-fade-in", isMobile && "pt-14")}>
          <div className="max-w-2xl mx-auto py-8 px-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-display font-bold">Seus Links</h1>
              {isDirty && (
                <Button
                  onClick={save}
                  disabled={isSaving}
                  size="sm"
                  className="rounded-xl"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
              )}
            </div>

            {/* Profile Header Card */}
            <ProfileHeaderCard
              profile={profile}
              socials={socials}
              platforms={SOCIAL_PLATFORMS}
              onSelectPlatform={(platform) => {
                setSelectedPlatform(platform);
                setShowAddSocial(true);
              }}
              onDeleteSocial={(linkId) => {
                deleteLink(linkId);
              }}
              onUpdateUsername={(newUsername) => updateProfile({ username: newUsername })}
              onUpdateHandle={(newHandle) => updateProfile({ handle: newHandle })}
            />

            {/* Add Link Button */}
            <Button
              onClick={handleAddLink}
              className="w-full rounded-xl h-14 text-lg font-medium mb-6 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Link
            </Button>

            {/* Links List */}
            {buttons.length > 0 ? (
              <AdminLinksList
                links={buttons}
                onReorder={reorderLinks}
                onToggle={handleToggleLink}
                onEdit={setSelectedLinkId}
                onDelete={deleteLink}
                onDuplicate={duplicateLink}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Você ainda não tem links.</p>
                <p className="text-sm">Clique em "Adicionar Link" para começar.</p>
              </div>
            )}
          </div>
        </main>
      ) : activeView === "design" ? (
        <main 
          key="design"
          ref={containerRef}
          className={cn("flex-1 overflow-y-auto scroll-smooth animate-fade-in", isMobile && "pt-14")}
        >
          {/* Save Status Bar */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Personalizar Design</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isSaving ? (
                  <>
                    <Cloud className="h-4 w-4 animate-pulse" />
                    <span>Salvando...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Salvo</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Design Sections */}
          <div className="max-w-xl mx-auto py-8 px-6 space-y-16">
            <section id="header" className="scroll-mt-20">
              <HeaderSection profile={profile} onUpdate={updateProfile} />
            </section>

            <section id="theme" className="scroll-mt-20">
              <ThemeSection profile={profile} onUpdate={updateProfile} />
            </section>

            <section id="wallpaper" className="scroll-mt-20">
              <WallpaperSection profile={profile} onUpdate={updateProfile} />
            </section>

            <section id="text" className="scroll-mt-20">
              <TextSection profile={profile} onUpdate={updateProfile} />
            </section>

            <section id="buttons" className="scroll-mt-20">
              <ButtonsSection profile={profile} onUpdate={updateProfile} />
            </section>

            <section id="footer" className="scroll-mt-20 pb-8">
              <FooterSection profile={profile} onUpdate={updateProfile} />
            </section>
          </div>
        </main>
      ) : (
        <main 
          key="settings"
          className={cn("flex-1 overflow-y-auto animate-fade-in", isMobile && "pt-14")}
        >
          <div className="max-w-xl mx-auto py-8 px-6">
            <SettingsSection />
          </div>
        </main>
      )}

      {/* Preview Panel */}
      <aside className="w-[380px] border-l border-border bg-muted/30 flex-shrink-0 p-6 flex items-center justify-center hidden lg:flex">
        <EditorPreview 
          profile={profile} 
          links={links} 
          onClickElement={activeView === "links" ? handlePreviewClick : undefined}
        />
      </aside>

      {/* Button Edit Drawer - only for links view */}
      <ButtonEditDrawer
        open={!!selectedLinkId}
        onClose={() => setSelectedLinkId(null)}
        onSave={handleSaveLink}
        initialData={selectedLink || null}
      />

      {/* Social Add Modal */}
      <SocialAddModal
        open={showAddSocial}
        onClose={() => {
          setShowAddSocial(false);
          setSelectedPlatform(null);
        }}
        onSave={handleAddSocial}
        platform={selectedPlatform}
      />
    </div>
  );
}

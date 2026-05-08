import { cn } from "@/lib/utils";
import { 
  ImageIcon, 
  Palette, 
  Layers, 
  Type, 
  RectangleHorizontal
} from "lucide-react";

interface DesignSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: DesignSection[] = [
  { id: "header", label: "Header", icon: ImageIcon },
  { id: "theme", label: "Tema", icon: Palette },
  { id: "wallpaper", label: "Fundo", icon: Layers },
  { id: "text", label: "Texto", icon: Type },
  { id: "buttons", label: "Botões", icon: RectangleHorizontal },
];

interface DesignSidebarProps {
  activeSection: string | null;
  onNavigate: (sectionId: string) => void;
}

export function DesignSidebar({ activeSection, onNavigate }: DesignSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Design</h2>
        <p className="text-sm text-muted-foreground">Personalize sua página</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
              )}
              <Icon className="h-4 w-4" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export { SECTIONS };

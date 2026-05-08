import { Template } from "@/data/templates";
import TemplatePreview from "./TemplatePreview";
import { Badge } from "@/components/ui/badge";

interface TemplateCardProps {
  template: Template;
  onClick: (template: Template) => void;
}

const TemplateCard = ({ template, onClick }: TemplateCardProps) => {
  return (
    <button
      onClick={() => onClick(template)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {/* Preview Container */}
      <div className="relative aspect-[9/16] w-full overflow-hidden">
        <TemplatePreview template={template} />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Info */}
      <div className="p-3 text-left border-t border-border/30">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground">{template.name}</h3>
          {template.slug === "starter" && (
            <Badge variant="secondary" className="text-[10px]">
              Básico
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {template.description}
        </p>
      </div>
    </button>
  );
};

export default TemplateCard;

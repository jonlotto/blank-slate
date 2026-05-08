import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Template } from "@/data/templates";

interface TemplateThumbCardProps {
  template: Template;
  isSelected: boolean;
  onClick: () => void;
}

export function TemplateThumbCard({ template, isSelected, onClick }: TemplateThumbCardProps) {
  const { styles, isPremium } = template;
  
  // Get background style for image backgrounds
  const getBackgroundStyle = () => {
    if (styles.backgroundType === "image" && styles.backgroundImage) {
      return {
        backgroundImage: `url(${styles.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {};
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center transition-all duration-200",
        "group"
      )}
    >
      {/* Card Preview - Phone-like proportion */}
      <div
        className={cn(
          "relative w-full aspect-[5/6] rounded-2xl overflow-hidden border-2 transition-all duration-200",
          isSelected
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary/50",
          styles.backgroundType !== "image" && styles.background
        )}
        style={getBackgroundStyle()}
      >
        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-between py-5 px-3">
          {/* Font Preview "Aa" - Large and prominent */}
          <span
            className={cn(
              "text-3xl font-semibold",
              styles.textColor
            )}
            style={{ fontFamily: styles.font }}
          >
            Aa
          </span>
          
          {/* Single Button Preview - Just shape, no text */}
          <div
            className={cn(
              "w-full h-7",
              styles.buttonStyle,
              styles.buttonBg
            )}
          />
        </div>

        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        )}

        {/* Premium Indicator - Top right, dark style */}
        {isPremium && !isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-gray-800/70 rounded-full flex items-center justify-center">
            <Zap className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Template Name */}
      <span className={cn(
        "mt-2 text-xs font-medium transition-colors",
        isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      )}>
        {template.name}
      </span>
    </button>
  );
}

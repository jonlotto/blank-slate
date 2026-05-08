import { Template } from "@/data/templates";
import { Instagram, Twitter, Youtube } from "lucide-react";

interface TemplatePreviewProps {
  template: Template;
}

const TemplatePreview = ({ template }: TemplatePreviewProps) => {
  const { styles } = template;

  return (
    <div
      className={`w-full h-full ${styles.background} p-3 flex flex-col items-center justify-center`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full bg-gray-300 ${styles.avatarBorder} mb-2`}
      />

      {/* Name */}
      <div className={`text-xs font-semibold ${styles.textColor} mb-0.5`}>
        @usuario
      </div>

      {/* Bio */}
      <div className={`text-[8px] ${styles.textColor} opacity-70 mb-2`}>
        Sua bio aqui
      </div>

      {/* Links */}
      <div className="w-full space-y-1.5 px-2">
        {["Meu Site", "Portfolio", "Contato"].map((link) => (
          <div
            key={link}
            className={`w-full py-1.5 text-center text-[8px] font-medium ${styles.buttonStyle} ${styles.buttonBg} ${styles.buttonText} transition-all`}
          >
            {link}
          </div>
        ))}
      </div>

      {/* Social Icons */}
      <div className="flex gap-2 mt-2">
        {[Instagram, Twitter, Youtube].map((Icon, i) => (
          <Icon
            key={i}
            className={`w-3 h-3 ${styles.textColor} opacity-60`}
          />
        ))}
      </div>
    </div>
  );
};

export default TemplatePreview;

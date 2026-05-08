import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { LinkIcon } from "@/components/icons/LinkIcon";
import { CartIcon } from "@/components/icons/CartIcon";
import { StoreIcon } from "@/components/icons/StoreIcon";
import { StarIcon } from "@/components/icons/StarIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { YouTubeIcon } from "@/components/icons/YouTubeIcon";
import { TwitterIcon } from "@/components/icons/TwitterIcon";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import { EmailIcon } from "@/components/icons/EmailIcon";

const WHATSAPP_ICON_VALUE = "whatsapp-icon";
const LINK_ICON_VALUE = "link-icon";
const CART_ICON_VALUE = "cart-icon";
const STORE_ICON_VALUE = "store-icon";
const STAR_ICON_VALUE = "star-icon";
const LOCATION_ICON_VALUE = "location-icon";
const INSTAGRAM_ICON_VALUE = "instagram-icon";
const TIKTOK_ICON_VALUE = "tiktok-icon";
const YOUTUBE_ICON_VALUE = "youtube-icon";
const TWITTER_ICON_VALUE = "twitter-icon";
const LINKEDIN_ICON_VALUE = "linkedin-icon";
const EMAIL_ICON_VALUE = "email-icon";

export const renderIcon = (icon: string | undefined, className = "w-5 h-5 shrink-0") => {
  if (!icon) return null;
  if (icon === WHATSAPP_ICON_VALUE) {
    return <WhatsAppIcon className={className} title="WhatsApp" />;
  }
  if (icon === LINK_ICON_VALUE) {
    return <LinkIcon className={className} title="Link" />;
  }
  if (icon === CART_ICON_VALUE) {
    return <CartIcon className={className} title="Carrinho" />;
  }
  if (icon === STORE_ICON_VALUE) {
    return <StoreIcon className={className} title="Loja" />;
  }
  if (icon === STAR_ICON_VALUE) {
    return <StarIcon className={className} title="Estrela" />;
  }
  if (icon === LOCATION_ICON_VALUE) {
    return <LocationIcon className={className} title="Localização" />;
  }
  if (icon === INSTAGRAM_ICON_VALUE) {
    return <InstagramIcon className={className} title="Instagram" />;
  }
  if (icon === TIKTOK_ICON_VALUE) {
    return <TikTokIcon className={className} title="TikTok" />;
  }
  if (icon === YOUTUBE_ICON_VALUE) {
    return <YouTubeIcon className={className} title="YouTube" />;
  }
  if (icon === TWITTER_ICON_VALUE) {
    return <TwitterIcon className={className} title="Twitter" />;
  }
  if (icon === LINKEDIN_ICON_VALUE) {
    return <LinkedInIcon className={className} title="LinkedIn" />;
  }
  if (icon === EMAIL_ICON_VALUE) {
    return <EmailIcon className={className} title="Email" />;
  }
  return <span className="text-xl shrink-0">{icon}</span>;
};

interface LinkCardProps {
  title: string;
  url: string;
  icon?: string;
  thumbnailUrl?: string | null;
  delay?: number;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;
  buttonStyle?: "filled" | "outline";
  fontFamily?: string;
}

const LinkCard = ({ 
  title, 
  url, 
  icon, 
  thumbnailUrl,
  delay = 0,
  buttonBgColor,
  buttonTextColor,
  buttonBorderRadius = "rounded-2xl",
  buttonStyle = "filled",
  fontFamily = "Inter"
}: LinkCardProps) => {
  const hasCustomColors = buttonBgColor || buttonTextColor;
  const hasMedia = thumbnailUrl || icon;
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full animate-slide-up opacity-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className={cn(
          "relative flex items-center justify-center px-6 py-4 transition-all duration-300 hover:scale-[1.02]",
          buttonBorderRadius,
          !hasCustomColors && "glass shadow-glow hover:shadow-glow-lg",
          buttonStyle === "outline" && hasCustomColors && "bg-transparent border-2",
          hasMedia && "pl-14"
        )}
        style={{
          fontFamily,
          ...(hasCustomColors ? {
            backgroundColor: buttonStyle === "filled" ? (buttonBgColor || undefined) : "transparent",
            color: buttonTextColor || undefined,
            borderColor: buttonStyle === "outline" ? (buttonBgColor || undefined) : undefined,
          } : {})
        }}
      >
        {thumbnailUrl ? (
          <div className="absolute left-2 w-10 h-10 rounded-full bg-black/10 flex items-center justify-center overflow-hidden">
            <img 
              src={thumbnailUrl} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : icon && (
          <span className="absolute left-4">
            {renderIcon(icon)}
          </span>
        )}
        <span className={cn("font-medium text-sm", !hasCustomColors && "text-foreground")}>{title}</span>
      </div>
    </a>
  );
};

export default LinkCard;

import {
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import { eventConfig, socialLinks } from "@/lib/event-config";

const platforms = [
  { icon: InstagramLogo, href: socialLinks.instagram, label: "Instagram", hover: "hover:bg-accent" },
  { icon: FacebookLogo, href: socialLinks.facebook, label: "Facebook", hover: "hover:bg-secondary" },
  { icon: TiktokLogo, href: socialLinks.tiktok, label: "TikTok", hover: "hover:bg-foreground" },
  { icon: YoutubeLogo, href: socialLinks.youtube, label: "YouTube", hover: "hover:bg-gold" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-row flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="min-w-0">
          <p className="truncate font-display text-xs font-extrabold uppercase tracking-tight sm:text-base">
            {eventConfig.edition} {eventConfig.name} · {eventConfig.organizer}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground sm:text-sm">
            © {eventConfig.year} {eventConfig.organizer}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {platforms.map((platform) => (
            <a
              key={platform.label}
              href={platform.href}
              aria-label={platform.label}
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-transparent hover:text-white sm:h-10 sm:w-10 ${platform.hover}`}
            >
              <platform.icon size={16} weight="regular" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

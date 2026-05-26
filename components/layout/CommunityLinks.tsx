'use client'

/**
 * components/layout/CommunityLinks.tsx
 *
 * Inline social media links rendered at the bottom of the desktop sidebar.
 * Displays X, GitHub, and Discord icons horizontally.
 *
 * Layout & Architecture:
 * - Matches the exact group label typography used in SidebarNavGroup
 * ("COMMUNITY" — 10px, uppercase, tracking-widest, muted text).
 * - Uses a custom inline layout (flex-row) rather than the standard 
 * full-width SidebarNavItem layout.
 * - Rendered statically at the bottom of Sidebar.tsx to keep the primary
 * config/site.ts routing clean and strictly for in-app navigation.
 * * Interactive States:
 * - Icons use shared hover and focus-visible classes to match the 
 * fade-in behaviour of standard sidebar navigation items.
 */

export function CommunityLinks() {
  // Shared hover and focus states for the social icons
  const linkClass = "text-muted-foreground/80 hover:text-foreground transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-ring rounded-sm outline-none"

  return (
    <div className="flex flex-col gap-0.5">
      {/* Exactly matches your SidebarNavGroup label styling */}
      <p className="px-3 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 select-none">
        Community
      </p>

      {/* Inline layout for the icons */}
      <div className="flex items-center gap-4 px-4 py-2">
        
        {/* X (Twitter) */}
        <a 
          href="https://x.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className={linkClass}
          aria-label="Follow us on X"
        >
          <svg viewBox="0 0 24 24" className={"size-4"} fill="currentColor">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
          </svg>
        </a>

        {/* GitHub */}
        <a 
          href="https://github.com/Aeternumlabs" 
          target="_blank" 
          rel="noopener noreferrer"
          className={linkClass}
          aria-label="View our GitHub"
        >
          <svg viewBox="0 0 24 24" className={"size-5"} fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>

        {/* Discord */}
        <a 
          href="https://discord.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className={linkClass}
          aria-label="Join our Discord"
        >
          <svg viewBox="0 0 24 24" className={"size-5"} fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
          </svg>
        </a>

      </div>
    </div>
  )
}
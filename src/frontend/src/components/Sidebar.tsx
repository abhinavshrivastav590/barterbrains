import { NotificationBadge } from "@/components/ui/NotificationBadge";
import { useNotificationBadgeCount } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarCheck,
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  Settings,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "My Matches", href: "/matches", icon: Users },
  { label: "Skill Requests", href: "/sessions", icon: CalendarCheck },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Community", href: "/community", icon: MessagesSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const { data: badgeCount } = useNotificationBadgeCount();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display font-bold text-lg text-sidebar-foreground"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            B
          </div>
          BarterBrains
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? currentPath === "/" : currentPath.startsWith(href);
          return (
            <Link
              key={href}
              to={href}
              data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "-")}.link`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {label === "Messages" &&
                  badgeCount &&
                  Number(badgeCount) > 0 && (
                    <NotificationBadge count={badgeCount} />
                  )}
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[11px] text-sidebar-foreground/40 leading-relaxed">
          Skill exchange — zero cost, infinite value.
        </p>
      </div>
    </aside>
  );
}

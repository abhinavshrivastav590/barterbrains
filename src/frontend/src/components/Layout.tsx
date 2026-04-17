import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarCheck,
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "My Matches", href: "/matches", icon: Users },
  { label: "Skill Requests", href: "/sessions", icon: CalendarCheck },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Community", href: "/community", icon: MessagesSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      {isAuthenticated && <Sidebar />}

      {/* Mobile nav overlay */}
      {isAuthenticated && mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileNavOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close navigation"
          />
          <aside className="relative w-64 h-full bg-sidebar flex flex-col shadow-xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border">
              <Link
                to="/"
                className="flex items-center gap-2.5 font-display font-bold text-sidebar-foreground"
              >
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  B
                </div>
                BarterBrains
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-smooth"
                aria-label="Close navigation"
                data-ocid="mobile_nav.close.button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-0.5">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const isActive =
                  href === "/"
                    ? currentPath === "/"
                    : currentPath.startsWith(href);
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar onMenuOpen={() => setMobileNavOpen(true)} />
        <main className="flex-1 bg-background">{children}</main>
        <footer className="bg-card border-t border-border py-4 px-6">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined"
                  ? window.location.hostname
                  : "barterbriains",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

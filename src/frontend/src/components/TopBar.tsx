import { NotificationBadge } from "@/components/ui/NotificationBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useBackend";
import { useNotificationBadgeCount } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  Search,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TopBarProps {
  onMenuOpen?: () => void;
}

export function TopBar({ onMenuOpen }: TopBarProps) {
  const { isAuthenticated, login, logout, isLoggingIn } = useAuth();
  const { data: profile } = useMyProfile();
  const { data: badgeCount } = useNotificationBadgeCount();
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30 shadow-xs">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuOpen}
        className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
        aria-label="Open navigation"
        data-ocid="topbar.menu.button"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile logo */}
      <Link
        to="/"
        className="lg:hidden flex items-center gap-2 font-display font-bold text-foreground"
      >
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
          B
        </div>
        <span className="text-sm">BarterBrains</span>
      </Link>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills, users, or keywords..."
          className="pl-9 bg-muted/50 border-input focus:bg-card"
          data-ocid="topbar.search_input"
        />
      </div>

      <div className="flex-1 lg:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
              data-ocid="topbar.notifications.link"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {badgeCount && Number(badgeCount) > 0 && (
                <NotificationBadge count={badgeCount} />
              )}
            </Link>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-smooth"
                data-ocid="topbar.user_menu.button"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar} alt={profile?.name} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                  {profile?.name ?? "My Account"}
                </span>
                <ChevronDown
                  className={cn(
                    "hidden sm:block w-3.5 h-3.5 text-muted-foreground transition-transform",
                    userMenuOpen && "rotate-180",
                  )}
                />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-md py-1 z-50"
                  data-ocid="topbar.user_menu.popover"
                >
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                    onClick={() => setUserMenuOpen(false)}
                    data-ocid="topbar.profile.link"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                    onClick={() => setUserMenuOpen(false)}
                    data-ocid="topbar.settings.link"
                  >
                    <User className="w-4 h-4" />
                    Settings
                  </Link>
                  <hr className="my-1 border-border" />
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-smooth w-full text-left"
                    data-ocid="topbar.logout.button"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="sm"
            data-ocid="topbar.login.button"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </Button>
        )}
      </div>
    </header>
  );
}

import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import BookingPageComponent from "@/pages/BookingPage";
import ChatPage from "@/pages/ChatPage";
import DashboardPageComponent from "@/pages/DashboardPage";
import HomePageComponent from "@/pages/HomePage";
import LoginPageComponent from "@/pages/LoginPage";
import MatchesPageComponent from "@/pages/MatchesPage";
import NotificationsPageComponent from "@/pages/NotificationsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import ProfileSetupPageComponent from "@/pages/ProfileSetupPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// ─── Placeholder pages (stubs until page tasks write them) ───────────────────

function MessagesPage() {
  return <ChatPage />;
}

function CommunityPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">
        Community
      </h1>
      <p className="text-muted-foreground">
        Connect with the BarterBrains community.
      </p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">
        Settings
      </h1>
      <p className="text-muted-foreground">
        Configure your BarterBrains preferences.
      </p>
    </div>
  );
}

function NotificationsPage() {
  return <NotificationsPageComponent />;
}

// ─── Root layout component ────────────────────────────────────────────────────

function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-muted-foreground text-sm animate-pulse">
          Loading...
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <HomePageComponent />;
  }
  return <>{children}</>;
}

// ─── Router ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <AuthGate>
      <DashboardPageComponent />
    </AuthGate>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <AuthGate>
      <DashboardPageComponent />
    </AuthGate>
  ),
});

const matchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matches",
  component: () => (
    <AuthGate>
      <MatchesPageComponent />
    </AuthGate>
  ),
});

const sessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sessions",
  component: () => (
    <AuthGate>
      <BookingPageComponent />
    </AuthGate>
  ),
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking",
  component: () => (
    <AuthGate>
      <BookingPageComponent />
    </AuthGate>
  ),
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: () => (
    <AuthGate>
      <MessagesPage />
    </AuthGate>
  ),
});

const communityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community",
  component: () => (
    <AuthGate>
      <CommunityPage />
    </AuthGate>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <AuthGate>
      <ProfilePage />
    </AuthGate>
  ),
});

const profileUserRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$userId",
  component: () => (
    <AuthGate>
      <ProfilePage />
    </AuthGate>
  ),
});

const profileSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/setup",
  component: () => <ProfileSetupPageComponent />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => <LoginPageComponent />,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <AuthGate>
      <SettingsPage />
    </AuthGate>
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: () => (
    <AuthGate>
      <NotificationsPage />
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  loginRoute,
  profileSetupRoute,
  profileUserRoute,
  matchesRoute,
  sessionsRoute,
  bookingRoute,
  messagesRoute,
  communityRoute,
  profileRoute,
  settingsRoute,
  notificationsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}

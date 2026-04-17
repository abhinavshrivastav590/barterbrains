import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useBackend";
import { useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Star, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

const FEATURES = [
  {
    icon: Zap,
    title: "Skill Matching",
    desc: "Instantly matched with users who want what you offer — and offer what you want.",
  },
  {
    icon: Users,
    title: "Peer-to-Peer Learning",
    desc: "One-on-one sessions with real people. No courses, no fees.",
  },
  {
    icon: Star,
    title: "Trust Scores",
    desc: "Community ratings build your reputation with every exchange.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Identity",
    desc: "Powered by Internet Identity — no passwords, no data leaks.",
  },
];

export default function LoginPage() {
  const { login, isLoggingIn, isAuthenticated, isInitializing } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || profileLoading || isInitializing) return;
    if (profile?.name) {
      navigate({ to: "/" });
    } else {
      navigate({ to: "/profile" });
    }
  }, [isAuthenticated, profile, profileLoading, isInitializing, navigate]);

  const loading = isInitializing || (isAuthenticated && profileLoading);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left hero panel */}
      <div className="relative flex flex-col justify-center px-8 py-16 lg:w-1/2 bg-card border-r border-border overflow-hidden">
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md mx-auto lg:mx-0"
        >
          {/* Logo mark */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-subtle">
              <span className="text-primary-foreground font-display font-bold text-xl">
                B
              </span>
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              BarterBrains
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-4">
            Exchange skills,
            <br />
            <span className="text-primary">not money.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10">
            Connect with people who want to learn what you know — and teach what
            you want to learn. Zero cost, infinite value.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-background border border-border"
              >
                <f.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {f.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right sign-in panel */}
      <div className="flex flex-col items-center justify-center px-8 py-16 lg:w-1/2 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl border border-border bg-card p-8 shadow-subtle">
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Sign in with your Internet Identity to continue.
            </p>

            {loading ? (
              <div className="space-y-3" data-ocid="login.loading_state">
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3 mx-auto rounded" />
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  type="button"
                  size="lg"
                  className="w-full font-semibold text-base gap-2 transition-smooth"
                  onClick={login}
                  disabled={isLoggingIn}
                  data-ocid="login.sign_in_button"
                >
                  {isLoggingIn ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Sign in with Internet Identity
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  New to BarterBrains? Signing in creates your account
                  automatically.
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            No passwords. No email. Just your Internet Identity.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

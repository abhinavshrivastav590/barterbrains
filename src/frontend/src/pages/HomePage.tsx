import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  MessageSquare,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

// ─── Feature card data ────────────────────────────────────────────────────────

const features = [
  {
    icon: Repeat2,
    title: "Bidirectional Matching",
    description:
      "Our algorithm finds users where your skills match their needs and their skills match yours — perfectly complementary exchanges every time.",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description:
      "Message your matches directly in-app. Discuss skill exchange details, set expectations, and build rapport before your first session.",
    accent: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: CalendarDays,
    title: "Session Booking",
    description:
      "Propose, accept, and schedule skill sessions with a simple booking flow. Track upcoming and completed sessions in your dashboard.",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description:
      "After every session, leave honest feedback. Build your trust score and help others make informed decisions about skill exchanges.",
    accent: "text-accent",
    bg: "bg-accent/10",
  },
];

// ─── How-it-works steps ───────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "List the skills you can teach — Python, guitar, photography, Spanish, whatever you're good at. Then add what you want to learn.",
  },
  {
    number: "02",
    title: "Get Matched",
    description:
      "BarterBrains finds people who want what you offer and offer what you want. View compatibility scores and browse their profiles.",
  },
  {
    number: "03",
    title: "Chat & Schedule",
    description:
      "Message your match, agree on a skill exchange plan, and book a session directly in the app. No emails, no confusion.",
  },
  {
    number: "04",
    title: "Learn & Teach",
    description:
      "Run your sessions, exchange knowledge, and leave ratings. Watch your trust score grow with every successful swap.",
  },
];

// ─── Social proof stats ───────────────────────────────────────────────────────

const stats = [
  { value: "12,400+", label: "Active learners" },
  { value: "860+", label: "Skills available" },
  { value: "98%", label: "Satisfaction rate" },
  { value: "Zero", label: "Cost to join" },
];

// ─── Trust badges ─────────────────────────────────────────────────────────────

const trustItems = [
  { icon: ShieldCheck, text: "No money, ever" },
  { icon: Users, text: "Real community" },
  { icon: Zap, text: "Instant matching" },
  { icon: Brain, text: "Any skill welcome" },
];

// ─── Sample skill tags ────────────────────────────────────────────────────────

const skillTags = [
  "Python",
  "Guitar",
  "Spanish",
  "Watercolor",
  "React",
  "Yoga",
  "Photography",
  "SQL",
  "Piano",
  "Figma",
  "Public Speaking",
  "Cooking",
  "Video Editing",
  "Machine Learning",
  "French",
  "Drawing",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { login, isLoggingIn } = useAuth();

  function handleLogin() {
    login();
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-card border-b border-border"
        data-ocid="home.hero.section"
      >
        {/* Background decoration */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-[400px] h-[400px] rounded-full bg-accent/5 blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge
                  variant="secondary"
                  className="mb-4 gap-1.5 px-3 py-1 text-sm font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Skills. No money. Just learning.
                </Badge>

                <h1 className="text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.1] tracking-tight">
                  Swap skills,
                  <br />
                  <span className="text-primary">not cash.</span>
                </h1>

                <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
                  BarterBrains connects people who want to teach and learn — for
                  free. Trade your expertise, grow your knowledge, build real
                  connections.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button
                  size="lg"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="gap-2 font-semibold text-base px-8 h-12"
                  data-ocid="home.hero.primary_button"
                >
                  {isLoggingIn ? (
                    "Connecting…"
                  ) : (
                    <>
                      Start Swapping Free
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="gap-2 font-semibold text-base h-12"
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  data-ocid="home.hero.secondary_button"
                >
                  See How It Works
                </Button>
              </motion.div>

              {/* Trust items */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-wrap gap-4"
              >
                {trustItems.map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className="trust-badge text-muted-foreground"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    {text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative lg:pl-4"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <img
                  src="/assets/generated/hero-skill-exchange.dim_1200x600.jpg"
                  alt="Two people exchanging skills over BarterBrains"
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                {/* Floating skill tags overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent flex items-end p-6">
                  <div className="flex flex-wrap gap-2">
                    {skillTags.slice(0, 8).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-card/80 backdrop-blur-sm text-foreground text-xs font-medium border border-border/60 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating match score card */}
              <div className="absolute -top-4 -right-4 hidden lg:block">
                <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                    <Repeat2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Match Score
                    </p>
                    <p className="text-lg font-bold text-foreground font-display">
                      94%
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <section
        className="bg-primary py-10 border-b border-primary/20"
        data-ocid="home.stats.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <p className="text-3xl font-display font-bold text-primary-foreground">
                  {value}
                </p>
                <p className="text-sm text-primary-foreground/70 mt-1 font-medium">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────────── */}
      <section
        id="features"
        className="bg-background py-20 lg:py-28"
        data-ocid="home.features.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <Badge variant="secondary" className="mb-4 gap-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Everything you need
            </Badge>
            <h2 className="text-4xl font-display font-bold text-foreground tracking-tight mb-4">
              A complete skill exchange platform
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              From finding the right match to running sessions and leaving
              reviews — everything happens inside BarterBrains.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(
              ({ icon: Icon, title, description, accent, bg }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  data-ocid={`home.features.item.${i + 1}`}
                >
                  <Card className="h-full border border-border bg-card hover:shadow-md transition-smooth group">
                    <CardContent className="p-6 space-y-4">
                      <div
                        className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-smooth`}
                      >
                        <Icon className={`w-5 h-5 ${accent}`} />
                      </div>
                      <h3 className="font-display font-semibold text-foreground text-lg leading-snug">
                        {title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── Skills Cloud Section ──────────────────────────────────────────── */}
      <section
        className="bg-muted/30 border-y border-border py-16"
        data-ocid="home.skills.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">
              Skills being exchanged right now
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {skillTags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-smooth hover:scale-105 cursor-default ${
                    i % 3 === 0
                      ? "bg-primary/10 border-primary/25 text-primary"
                      : i % 3 === 1
                        ? "bg-accent/10 border-accent/25 text-accent-foreground"
                        : "bg-card border-border text-foreground"
                  }`}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="bg-background py-20 lg:py-28"
        data-ocid="home.how_it_works.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <Badge variant="secondary" className="mb-4 gap-1.5 text-sm">
              <CalendarDays className="w-3.5 h-3.5 text-accent" />
              Simple process
            </Badge>
            <h2 className="text-4xl font-display font-bold text-foreground tracking-tight mb-4">
              How BarterBrains works
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              From sign-up to your first skill exchange in four easy steps.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div
              className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-border hidden lg:block"
              aria-hidden="true"
            />

            {steps.map(({ number, title, description }, i) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="relative text-center"
                data-ocid={`home.steps.item.${i + 1}`}
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border-2 border-border mb-6 mx-auto shadow-sm">
                  <span className="text-xl font-display font-bold text-primary">
                    {number}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-3">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────────── */}
      <section
        className="bg-muted/40 border-t border-border py-20 lg:py-28"
        data-ocid="home.cta.section"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground tracking-tight">
                Ready to start
                <br />
                <span className="text-primary">exchanging skills?</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Join thousands of learners and teachers. No subscriptions, no
                fees — just pure knowledge exchange.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gap-2 font-semibold text-base px-10 h-12"
                data-ocid="home.cta.primary_button"
              >
                {isLoggingIn ? (
                  "Connecting…"
                ) : (
                  <>
                    Join BarterBrains Free
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Secured by Internet Identity — no passwords, no data sold.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import { SkillBadge } from "@/components/ui/SkillBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddSkill,
  useMyProfile,
  useSaveProfile,
  useSkills,
} from "@/hooks/useBackend";
import { Proficiency, type SaveProfileInput, type SkillEntry } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Plus, Search, User, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Skill Selector ──────────────────────────────────────────────────────────

interface SkillSelectorProps {
  label: string;
  variant: "offered" | "wanted";
  selected: SkillEntry[];
  onAdd: (entry: SkillEntry) => void;
  onRemove: (skillId: bigint) => void;
  ocidPrefix: string;
}

function SkillSelector({
  label,
  variant,
  selected,
  onAdd,
  onRemove,
  ocidPrefix,
}: SkillSelectorProps) {
  const [query, setQuery] = useState("");
  const [proficiency, setProficiency] = useState<Proficiency>(
    Proficiency.beginner,
  );
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: allSkills = [] } = useSkills();
  const addSkillMutation = useAddSkill();

  const filtered = allSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) &&
      !selected.some((e) => e.skillId === s.id),
  );

  const exactMatch = allSkills.find(
    (s) => s.name.toLowerCase() === query.trim().toLowerCase(),
  );

  async function handleSelect(skillId: bigint, skillName: string) {
    onAdd({ skillId, name: skillName, proficiency });
    setQuery("");
    setOpen(false);
  }

  async function handleCreateAndAdd() {
    const name = query.trim();
    if (!name) return;
    try {
      const created = await addSkillMutation.mutateAsync(name);
      onAdd({ skillId: created.id, name: created.name, proficiency });
      setQuery("");
      setOpen(false);
    } catch {
      toast.error("Failed to create skill");
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current !== e.target
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-3">
      <Label className="font-semibold text-foreground text-sm">{label}</Label>

      {/* Selected badges */}
      {selected.length > 0 && (
        <div
          className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border border-border"
          data-ocid={`${ocidPrefix}.list`}
        >
          {selected.map((entry, i) => (
            <div
              key={`skill-${String(entry.skillId)}-${i}`}
              className="flex items-center gap-1"
              data-ocid={`${ocidPrefix}.item.${i + 1}`}
            >
              <SkillBadge
                name={entry.name}
                proficiency={entry.proficiency}
                variant={variant}
              />
              <button
                type="button"
                onClick={() => onRemove(entry.skillId)}
                className="w-4 h-4 rounded-full bg-muted-foreground/20 hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                aria-label={`Remove ${entry.name}`}
                data-ocid={`${ocidPrefix}.remove_button.${i + 1}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search or type a skill…"
            className="pl-9"
            data-ocid={`${ocidPrefix}.search_input`}
          />
          {/* Dropdown */}
          {open && (query.length > 0 || filtered.length > 0) && (
            <div
              ref={dropdownRef}
              className="absolute z-20 top-full mt-1 left-0 right-0 rounded-lg border border-border bg-card shadow-md max-h-48 overflow-y-auto"
            >
              {filtered.slice(0, 8).map((skill) => (
                <button
                  key={String(skill.id)}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground first:rounded-t-lg last:rounded-b-lg"
                  onMouseDown={() => handleSelect(skill.id, skill.name)}
                >
                  {skill.name}
                </button>
              ))}
              {!exactMatch && query.trim().length > 0 && (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/5 transition-colors flex items-center gap-2 border-t border-border"
                  onMouseDown={handleCreateAndAdd}
                  disabled={addSkillMutation.isPending}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create &quot;{query.trim()}&quot;
                </button>
              )}
              {filtered.length === 0 && !query.trim() && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Type to search skills…
                </p>
              )}
            </div>
          )}
        </div>

        {/* Proficiency (only for offered skills) */}
        {variant === "offered" && (
          <Select
            value={proficiency}
            onValueChange={(v) => setProficiency(v as Proficiency)}
          >
            <SelectTrigger
              className="w-36"
              data-ocid={`${ocidPrefix}.proficiency_select`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Proficiency.beginner}>Beginner</SelectItem>
              <SelectItem value={Proficiency.intermediate}>
                Intermediate
              </SelectItem>
              <SelectItem value={Proficiency.expert}>Expert</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

// ─── Profile Setup Page ───────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  const { isAuthenticated, isInitializing } = useAuth();
  const { data: existingProfile, isLoading: profileLoading } = useMyProfile();
  const saveProfile = useSaveProfile();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [skillsOffered, setSkillsOffered] = useState<SkillEntry[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<SkillEntry[]>([]);
  const [nameError, setNameError] = useState("");

  // Pre-fill if editing existing profile
  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name ?? "");
      setBio(existingProfile.bio ?? "");
      setAvatar(existingProfile.avatar ?? "");
      setSkillsOffered(existingProfile.skillsOffered ?? []);
      setSkillsWanted(existingProfile.skillsWanted ?? []);
    }
  }, [existingProfile]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  function addOffered(entry: SkillEntry) {
    setSkillsOffered((prev) => [...prev, entry]);
  }
  function removeOffered(id: bigint) {
    setSkillsOffered((prev) => prev.filter((e) => e.skillId !== id));
  }
  function addWanted(entry: SkillEntry) {
    setSkillsWanted((prev) => [...prev, entry]);
  }
  function removeWanted(id: bigint) {
    setSkillsWanted((prev) => prev.filter((e) => e.skillId !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError("");
    if (!name.trim()) {
      setNameError("Name is required.");
      return;
    }
    const input: SaveProfileInput = {
      name: name.trim(),
      bio: bio.trim(),
      avatar: avatar.trim() || undefined,
      skillsOffered,
      skillsWanted,
    };
    try {
      await saveProfile.mutateAsync(input);
      toast.success("Profile saved!");
      navigate({ to: "/profile" });
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  }

  const loading = isInitializing || profileLoading;
  const isEditing = !!existingProfile?.name;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        data-ocid="profile_setup.loading_state"
      >
        <div className="w-full max-w-lg space-y-4 px-4">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left sidebar context */}
      <div className="hidden lg:flex flex-col justify-center px-10 py-16 lg:w-2/5 bg-card border-r border-border relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-primary/8 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute bottom-10 right-0 w-48 h-48 rounded-full bg-accent/8 blur-3xl pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-xs"
        >
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-8 shadow-subtle">
            <span className="text-primary-foreground font-display font-bold text-xl">
              B
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl text-foreground mb-3">
            {isEditing ? "Update your profile" : "Set up your profile"}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Tell the community what you can teach and what you want to learn.
            Better profiles get better matches.
          </p>
          <div className="space-y-4">
            {[
              {
                icon: User,
                text: "Add your name and a short bio",
              },
              {
                icon: GraduationCap,
                text: "List skills you can teach",
              },
              {
                icon: BookOpen,
                text: "List skills you want to learn",
              },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 lg:py-16 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-xl"
        >
          {/* Mobile header */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold font-display text-sm">
                  B
                </span>
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                BarterBrains
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              {isEditing ? "Update your profile" : "Complete your profile"}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            data-ocid="profile_setup.form"
          >
            {/* Basic info card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-subtle space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">
                  Basic Info
                </span>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-semibold text-sm">
                  Display Name{" "}
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  placeholder="e.g. Alex Rivera"
                  maxLength={80}
                  data-ocid="profile_setup.name_input"
                  aria-required="true"
                  aria-describedby={nameError ? "name-error" : undefined}
                />
                {nameError && (
                  <p
                    id="name-error"
                    className="text-xs text-destructive"
                    data-ocid="profile_setup.name_field_error"
                  >
                    {nameError}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label htmlFor="bio" className="font-semibold text-sm">
                  Bio{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community about yourself, your background, and what drives you to learn…"
                  rows={3}
                  maxLength={500}
                  data-ocid="profile_setup.bio_textarea"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/500
                </p>
              </div>

              {/* Avatar URL */}
              <div className="space-y-1.5">
                <Label htmlFor="avatar" className="font-semibold text-sm">
                  Profile Picture URL{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <div className="flex gap-3 items-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar preview"
                      className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0 bg-muted"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-border bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    type="url"
                    data-ocid="profile_setup.avatar_input"
                  />
                </div>
              </div>
            </div>

            {/* Skills Offered card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-subtle space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">
                  Skills I Can Teach
                </span>
                {skillsOffered.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {skillsOffered.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground -mt-1">
                Add skills you&apos;re confident teaching. Select your
                proficiency level before adding.
              </p>
              <SkillSelector
                label="Search or add a skill you offer"
                variant="offered"
                selected={skillsOffered}
                onAdd={addOffered}
                onRemove={removeOffered}
                ocidPrefix="profile_setup.skills_offered"
              />
            </div>

            {/* Skills Wanted card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-subtle space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-foreground" />
                <span className="font-semibold text-sm text-foreground">
                  Skills I Want to Learn
                </span>
                {skillsWanted.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {skillsWanted.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground -mt-1">
                What do you want to learn? The more specific, the better your
                matches.
              </p>
              <SkillSelector
                label="Search or add a skill you want"
                variant="wanted"
                selected={skillsWanted}
                onAdd={addWanted}
                onRemove={removeWanted}
                ocidPrefix="profile_setup.skills_wanted"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold text-base transition-smooth"
              disabled={saveProfile.isPending}
              data-ocid="profile_setup.submit_button"
            >
              {saveProfile.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  Saving…
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Complete Setup & Find Matches"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

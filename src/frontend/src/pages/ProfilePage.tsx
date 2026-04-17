import { SkillBadge } from "@/components/ui/SkillBadge";
import { TrustScore } from "@/components/ui/TrustScore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddSkill,
  useMyProfile,
  useReviewsForUser,
  useSaveProfile,
  useSkills,
  useUserProfile,
} from "@/hooks/useBackend";
import {
  Proficiency,
  type SaveProfileInput,
  type SkillEntry,
  type UserId,
} from "@/types";
import { Principal } from "@icp-sdk/core/principal";
import { useParams } from "@tanstack/react-router";
import {
  BookOpen,
  Camera,
  CheckCircle,
  Lightbulb,
  Loader2,
  Plus,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const STAR_POSITIONS = [0, 1, 2, 3, 4] as const;

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(Number(rating));
  return (
    <span className="flex items-center gap-0.5">
      {STAR_POSITIONS.map((pos) => (
        <Star
          key={`star-pos-${pos}`}
          className={
            pos < filled
              ? "w-3.5 h-3.5 fill-accent text-accent"
              : "w-3.5 h-3.5 fill-muted text-muted-foreground"
          }
        />
      ))}
    </span>
  );
}

// ─── Proficiency selector ─────────────────────────────────────────────────────

const PROFICIENCY_OPTIONS = [
  { value: Proficiency.beginner, label: "Beginner" },
  { value: Proficiency.intermediate, label: "Intermediate" },
  { value: Proficiency.expert, label: "Expert" },
];

function ProficiencyPill({
  value,
  selected,
  onSelect,
}: {
  value: Proficiency;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? "px-2.5 py-1 rounded-md text-xs font-semibold bg-primary text-primary-foreground transition-smooth"
          : "px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/70 transition-smooth"
      }
      data-ocid={`proficiency.${value}.toggle`}
    >
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </button>
  );
}

// ─── Skill row inside edit form ───────────────────────────────────────────────

function SkillRow({
  entry,
  index,
  onRemove,
  onProficiencyChange,
  ocidPrefix,
}: {
  entry: SkillEntry;
  index: number;
  onRemove: () => void;
  onProficiencyChange: (p: Proficiency) => void;
  ocidPrefix: string;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-border bg-card"
      data-ocid={`${ocidPrefix}.item.${index + 1}`}
    >
      <span className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">
        {entry.name}
      </span>
      <div className="flex gap-1">
        {PROFICIENCY_OPTIONS.map((opt) => (
          <ProficiencyPill
            key={opt.value}
            value={opt.value}
            selected={entry.proficiency === opt.value}
            onSelect={() => onProficiencyChange(opt.value)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
        aria-label={`Remove ${entry.name}`}
        data-ocid={`${ocidPrefix}.delete_button.${index + 1}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Add skill inline ─────────────────────────────────────────────────────────

function AddSkillInline({
  existing,
  onAdd,
  ocidPrefix,
}: {
  existing: SkillEntry[];
  onAdd: (entry: SkillEntry) => void;
  ocidPrefix: string;
}) {
  const { data: allSkills = [] } = useSkills();
  const addSkillMutation = useAddSkill();
  const [query, setQuery] = useState("");
  const [proficiency, setProficiency] = useState<Proficiency>(
    Proficiency.beginner,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const existingIds = new Set(existing.map((e) => e.skillId));
  const filtered = allSkills.filter(
    (s) =>
      !existingIds.has(s.id) &&
      s.name.toLowerCase().includes(query.toLowerCase()),
  );

  async function handleSelectOrCreate(name: string, skillId?: bigint) {
    let finalId = skillId;
    if (finalId === undefined) {
      const created = await addSkillMutation.mutateAsync(name);
      finalId = created.id;
    }
    onAdd({ skillId: finalId, name, proficiency });
    setQuery("");
    setShowDropdown(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Search or add a skill..."
            className="h-9 text-sm"
            data-ocid={`${ocidPrefix}.search_input`}
          />
          {showDropdown && (query.length > 0 || filtered.length > 0) && (
            <div
              ref={dropdownRef}
              className="absolute z-20 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-md overflow-hidden"
            >
              {filtered.slice(0, 6).map((skill) => (
                <button
                  key={String(skill.id)}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                  onMouseDown={() => handleSelectOrCreate(skill.name, skill.id)}
                >
                  {skill.name}
                </button>
              ))}
              {query.trim() &&
                !filtered.some(
                  (s) => s.name.toLowerCase() === query.trim().toLowerCase(),
                ) && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-primary font-medium"
                    onMouseDown={() => handleSelectOrCreate(query.trim())}
                  >
                    <Plus className="inline w-3.5 h-3.5 mr-1" />
                    Add &quot;{query.trim()}&quot;
                  </button>
                )}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {PROFICIENCY_OPTIONS.map((opt) => (
            <ProficiencyPill
              key={opt.value}
              value={opt.value}
              selected={proficiency === opt.value}
              onSelect={() => setProficiency(opt.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Own Profile (editable) ───────────────────────────────────────────────────

function OwnProfileView() {
  const { data: profile, isLoading } = useMyProfile();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();
  const [skillsOffered, setSkillsOffered] = useState<SkillEntry[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<SkillEntry[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio);
      setAvatar(profile.avatar);
      setSkillsOffered(profile.skillsOffered);
      setSkillsWanted(profile.skillsWanted);
      setIsDirty(false);
    }
  }, [profile]);

  function markDirty() {
    setIsDirty(true);
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target?.result as string);
      markDirty();
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    const input: SaveProfileInput = {
      name: name.trim(),
      bio: bio.trim(),
      avatar,
      skillsOffered,
      skillsWanted,
    };
    await saveProfile.mutateAsync(input);
    setIsDirty(false);
    toast.success("Profile saved successfully!");
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const displayName = name || profile?.name || "Your Profile";

  return (
    <div
      className="max-w-3xl mx-auto p-6 md:p-8 space-y-6"
      data-ocid="profile.page"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your skills and how others see you
          </p>
        </div>
        {isDirty && (
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveProfile.isPending}
            className="gap-2"
            data-ocid="profile.save_button"
          >
            {saveProfile.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      {/* Avatar + basic info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative group">
              <Avatar className="w-20 h-20 ring-2 ring-border">
                <AvatarImage src={avatar} alt={displayName} />
                <AvatarFallback className="text-xl font-display font-bold bg-primary/10 text-primary">
                  {displayName ? (
                    initials(displayName)
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-smooth"
                aria-label="Change avatar"
                data-ocid="profile.avatar.upload_button"
              >
                <Camera className="w-5 h-5 text-primary-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarFile}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-3 w-full">
              <div className="space-y-1">
                <Label htmlFor="profile-name" className="text-sm font-medium">
                  Display Name
                </Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    markDirty();
                  }}
                  placeholder="Your name"
                  className="h-9"
                  data-ocid="profile.name.input"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="profile-bio" className="text-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    markDirty();
                  }}
                  placeholder="Tell others what you're passionate about..."
                  rows={3}
                  className="resize-none text-sm"
                  data-ocid="profile.bio.textarea"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Offered */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="w-4 h-4 text-primary" />
            Skills I Can Teach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2" data-ocid="profile.skills_offered.list">
            {skillsOffered.length === 0 ? (
              <p
                className="text-sm text-muted-foreground py-2"
                data-ocid="profile.skills_offered.empty_state"
              >
                No skills added yet. Add skills you can teach below.
              </p>
            ) : (
              skillsOffered.map((entry, i) => (
                <SkillRow
                  key={`offered-${entry.skillId}`}
                  entry={entry}
                  index={i}
                  ocidPrefix="profile.skills_offered"
                  onRemove={() => {
                    setSkillsOffered((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    );
                    markDirty();
                  }}
                  onProficiencyChange={(p) => {
                    setSkillsOffered((prev) =>
                      prev.map((e, idx) =>
                        idx === i ? { ...e, proficiency: p } : e,
                      ),
                    );
                    markDirty();
                  }}
                />
              ))
            )}
          </div>
          <AddSkillInline
            existing={skillsOffered}
            ocidPrefix="profile.skills_offered"
            onAdd={(entry) => {
              setSkillsOffered((prev) => [...prev, entry]);
              markDirty();
            }}
          />
        </CardContent>
      </Card>

      {/* Skills Wanted */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="w-4 h-4 text-accent" />
            Skills I Want to Learn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2" data-ocid="profile.skills_wanted.list">
            {skillsWanted.length === 0 ? (
              <p
                className="text-sm text-muted-foreground py-2"
                data-ocid="profile.skills_wanted.empty_state"
              >
                No skills added yet. Add skills you want to learn below.
              </p>
            ) : (
              skillsWanted.map((entry, i) => (
                <SkillRow
                  key={`wanted-${entry.skillId}`}
                  entry={entry}
                  index={i}
                  ocidPrefix="profile.skills_wanted"
                  onRemove={() => {
                    setSkillsWanted((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    );
                    markDirty();
                  }}
                  onProficiencyChange={(p) => {
                    setSkillsWanted((prev) =>
                      prev.map((e, idx) =>
                        idx === i ? { ...e, proficiency: p } : e,
                      ),
                    );
                    markDirty();
                  }}
                />
              ))
            )}
          </div>
          <AddSkillInline
            existing={skillsWanted}
            ocidPrefix="profile.skills_wanted"
            onAdd={(entry) => {
              setSkillsWanted((prev) => [...prev, entry]);
              markDirty();
            }}
          />
        </CardContent>
      </Card>

      {/* Sticky save bar */}
      {isDirty && (
        <div className="sticky bottom-4 flex justify-end">
          <div className="bg-card border border-border shadow-md rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              You have unsaved changes
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saveProfile.isPending}
              className="gap-2"
              data-ocid="profile.sticky_save_button"
            >
              {saveProfile.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Other user's profile (read-only) ────────────────────────────────────────

function UserProfileView({ userId }: { userId: string }) {
  const principalId: UserId | null = (() => {
    try {
      return Principal.fromText(userId);
    } catch {
      return null;
    }
  })();

  const { data: profile, isLoading } = useUserProfile(principalId);
  const { data: reviews = [], isLoading: reviewsLoading } =
    useReviewsForUser(principalId);

  if (isLoading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <div
        className="max-w-3xl mx-auto p-8 text-center"
        data-ocid="profile.error_state"
      >
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-2">
          Profile Not Found
        </h2>
        <p className="text-sm text-muted-foreground">
          This user profile doesn&apos;t exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto p-6 md:p-8 space-y-6"
      data-ocid="profile.page"
    >
      {/* Hero card */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/20 via-secondary/30 to-accent/20" />
        <CardContent className="pt-0 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end -mt-10">
            <Avatar className="w-20 h-20 ring-4 ring-card shadow-md">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-xl font-display font-bold bg-primary/10 text-primary">
                {initials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1 pt-2 sm:pt-0">
              <h1 className="text-2xl font-display font-bold text-foreground truncate">
                {profile.name}
              </h1>
              {profile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted"
                data-ocid="profile.trust_score"
              >
                <TrustScore score={profile.trustScore} compact />
                <span className="text-xs text-muted-foreground">trust</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {Number(profile.completedSessions)}
                </span>
                <span className="text-xs text-muted-foreground">sessions</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills section */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Offered */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="w-4 h-4 text-primary" />
              Can Teach
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.skillsOffered.length === 0 ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="profile.skills_offered.empty_state"
              >
                No skills listed yet.
              </p>
            ) : (
              <div
                className="flex flex-wrap gap-2"
                data-ocid="profile.skills_offered.list"
              >
                {profile.skillsOffered.map((s) => (
                  <SkillBadge
                    key={String(s.skillId)}
                    name={s.name}
                    proficiency={s.proficiency}
                    variant="offered"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wanted */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="w-4 h-4 text-accent" />
              Wants to Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.skillsWanted.length === 0 ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="profile.skills_wanted.empty_state"
              >
                No skills listed yet.
              </p>
            ) : (
              <div
                className="flex flex-wrap gap-2"
                data-ocid="profile.skills_wanted.list"
              >
                {profile.skillsWanted.map((s) => (
                  <SkillBadge
                    key={String(s.skillId)}
                    name={s.name}
                    proficiency={s.proficiency}
                    variant="wanted"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviews */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="w-4 h-4 text-accent fill-accent" />
            Reviews
            {reviews.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {reviews.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div
              className="space-y-3"
              data-ocid="profile.reviews.loading_state"
            >
              {[1, 2].map((n) => (
                <div key={`r-skel-${n}`} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p
              className="text-sm text-muted-foreground py-2"
              data-ocid="profile.reviews.empty_state"
            >
              No reviews yet. Complete a session to receive your first review.
            </p>
          ) : (
            <div className="space-y-4" data-ocid="profile.reviews.list">
              {reviews.map((review, i) => (
                <div key={String(review.id)}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div
                    className="space-y-1.5"
                    data-ocid={`profile.reviews.item.${i + 1}`}
                  >
                    <div className="flex items-center justify-between">
                      <StarRating rating={Number(review.rating)} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          Number(review.createdAt) / 1_000_000,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-foreground leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div
      className="max-w-3xl mx-auto p-6 md:p-8 space-y-6"
      data-ocid="profile.loading_state"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}

// ─── ProfilePage router entry ─────────────────────────────────────────────────

export function ProfilePage() {
  const params = useParams({ strict: false }) as { userId?: string };
  const userId = params.userId;

  if (userId) {
    return <UserProfileView userId={userId} />;
  }
  return <OwnProfileView />;
}

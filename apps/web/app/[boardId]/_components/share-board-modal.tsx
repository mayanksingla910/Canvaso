"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Check, Copy, Link2, Loader2, Share2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import {
  useShareBoard,
  type ShareCollaborator,
  type ShareRole,
} from "@/hooks/useShareBoard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function buildShareUrl(boardId: string, token: string) {
  return `${typeof window !== "undefined" ? window.location.origin : ""}/${boardId}?token=${token}`;
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

const roleBadgeClass: Record<ShareRole | "owner", string> = {
  owner: "bg-secondary text-secondary-foreground",
  editor:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  viewer: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

function RoleBadge({ role }: { role: ShareRole | "owner" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        roleBadgeClass[role],
      )}
    >
      {role}
    </span>
  );
}

// ─── Collaborator Row ─────────────────────────────────────────────────────────

function CollaboratorRow({
  collab,
  isOwner,
  onRoleChange,
  onRemove,
  role = "viewer",
}: {
  collab: ShareCollaborator;
  isOwner?: boolean;
  onRoleChange: (userId: string, role: ShareRole) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  role: "owner" | "editor" | "viewer";
}) {
  const [roleLoading, setRoleLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  const handleRoleChange = async (role: ShareRole) => {
    setRoleLoading(true);
    try {
      await onRoleChange(collab.userId, role);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleRemove = async () => {
    setRemoveLoading(true);
    try {
      await onRemove(collab.userId);
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50">
      <Avatar className="size-8 shrink-0">
        {collab.user.image && (
          <AvatarImage src={collab.user.image} alt={collab.user.name} />
        )}
        <AvatarFallback className="text-xs font-medium">
          {getInitials(collab.user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">
          {collab.user.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {collab.user.email}
        </p>
      </div>

      {isOwner ? (
        <RoleBadge role="owner" />
      ) : (
        <>
          {/* Shown at rest */}
          <div className="transition-opacity group-hover:opacity-0">
            <RoleBadge role={collab.role} />
          </div>

          {/* Shown on hover */}
          {role === "owner" && (
            <div className="absolute right-5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {roleLoading ? (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
              ) : (
                <Select
                  value={collab.role}
                  onValueChange={(v) => handleRoleChange(v as ShareRole)}
                >
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="editor" className="text-xs">
                        editor
                      </SelectItem>
                      <SelectItem value="viewer" className="text-xs">
                        viewer
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={handleRemove}
                disabled={removeLoading}
                aria-label={`Remove ${collab.user.name}`}
              >
                {removeLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <X className="size-3.5" />
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ShareModalSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Separator />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
      <Separator />
      <Skeleton className="h-4 w-32" />
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ShareBoardModalProps {
  boardId: string;
  boardName?: string;
  role: "owner" | "editor" | "viewer";
}

export function ShareBoardModal({
  boardId,
  boardName = "Untitled Board",
  role = "viewer",
}: ShareBoardModalProps) {
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading,
    enableLink,
    toggleLink,
    updateLinkRole,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
  } = useShareBoard(boardId, open);

  // ── Local UI state (not persisted until action fires)
  const [copied, setCopied] = useState(false);
  const [linkActionLoading, setLinkActionLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ShareRole>("editor");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const link = data?.link ?? null;
  const shareUrl = link ? buildShareUrl(boardId, link.token) : "";

  // ── Copy link
  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Toggle — first time calls POST, after that PATCH
  const handleToggle = async (checked: boolean) => {
    setLinkActionLoading(true);
    try {
      if (!link) {
        // No link row yet — create it
        await enableLink(inviteRole);
      } else {
        await toggleLink(checked);
      }
    } finally {
      setLinkActionLoading(false);
    }
  };

  // ── Link role change
  const handleLinkRoleChange = async (role: ShareRole) => {
    if (!link) return;
    setLinkActionLoading(true);
    try {
      await updateLinkRole(role);
    } finally {
      setLinkActionLoading(false);
    }
  };

  // ── Invite
  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Enter a valid email address.");
      return;
    }
    if (data?.collaborators.some((c) => c.user.email.toLowerCase() === email)) {
      setInviteError("This person already has access.");
      return;
    }
    if (data?.owner.email.toLowerCase() === email) {
      setInviteError("This person is already the owner.");
      return;
    }

    setInviteLoading(true);
    setInviteError("");
    try {
      await inviteCollaborator(email, inviteRole);
      setInviteEmail("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to invite. Try again.";
      setInviteError(msg);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Share2 className="size-4" />
          Share
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] w-full max-w-md flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-5 pt-5 pb-4">
          <DialogTitle className="text-base font-semibold">
            Share &ldquo;{boardName}&rdquo;
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <ShareModalSkeleton />
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* ── Share Link */}
            <section className="px-5 pb-4">
              <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Share link
              </p>

              <div className="mb-3 flex gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                  <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    {link?.isActive ? shareUrl : "Link disabled"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "shrink-0 gap-1.5 transition-all",
                    copied &&
                      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                  )}
                  onClick={handleCopy}
                  disabled={!link?.isActive}
                >
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              {role === "owner" && (
                <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    {linkActionLoading ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Switch
                        id="link-enabled"
                        checked={link?.isActive ?? false}
                        onCheckedChange={handleToggle}
                      />
                    )}
                    <div>
                      <label
                        htmlFor="link-enabled"
                        className="cursor-pointer text-sm font-medium"
                      >
                        Enable share link
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Anyone with the link can
                      </p>
                    </div>
                  </div>

                  <Select
                    value={link?.role ?? "viewer"}
                    onValueChange={(v) => handleLinkRoleChange(v as ShareRole)}
                    disabled={!link?.isActive || linkActionLoading}
                  >
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="viewer" className="text-xs">
                          view
                        </SelectItem>
                        <SelectItem value="editor" className="text-xs">
                          edit
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </section>

            <Separator />

            {/* ── Invite */}
            {role === "owner" && (
              <section className="px-5 py-4">
                <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Invite people
                </p>

                <div className="flex gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <Input
                      type="email"
                      placeholder="name@email.com"
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setInviteError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                      className={cn(
                        "h-9 text-sm",
                        inviteError &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    {inviteError && (
                      <p className="text-xs text-destructive">{inviteError}</p>
                    )}
                  </div>

                  <Select
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole(v as ShareRole)}
                  >
                    <SelectTrigger className="h-9 w-24 shrink-0 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="editor" className="text-xs">
                          editor
                        </SelectItem>
                        <SelectItem value="viewer" className="text-xs">
                          viewer
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 shrink-0 gap-1.5"
                    onClick={handleInvite}
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="size-3.5" />
                    )}
                    Invite
                  </Button>
                </div>
              </section>
            )}
            <Separator />

            {/* ── People with access */}
            <section className="relative px-5 py-4">
              <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                People with access
              </p>

              <div className="flex flex-col">
                {/* Owner — always first, never removable */}
                {data?.owner && (
                  <CollaboratorRow
                    collab={{
                      id: "owner",
                      userId: data.owner.id,
                      role: "editor",
                      user: data.owner,
                    }}
                    isOwner
                    onRoleChange={async () => {}}
                    onRemove={async () => {}}
                    role = {role}
                  />
                )}

                {data?.collaborators.length === 0 && (
                  <p className="py-3 text-center text-sm text-muted-foreground">
                    No collaborators yet
                  </p>
                )}

                {data?.collaborators.map((c) => (
                  <CollaboratorRow
                    key={c.id}
                    collab={c}
                    onRoleChange={updateCollaboratorRole}
                    onRemove={removeCollaborator}
                    role={role}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        <div className="shrink-0 border-t bg-muted/20 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Changes are saved automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareBoardModal;

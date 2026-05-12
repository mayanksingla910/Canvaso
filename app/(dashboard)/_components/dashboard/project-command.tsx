"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjects } from "@/hooks/useBoards";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Check, FolderDot, FolderMinus, FolderOpen } from "lucide-react";
import { cloneElement, isValidElement, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

interface ProjectCommandProps {
  boardId: string;
  boardName: string;
  currentProjectId: string | null;
  revalidationKeys: string[];
  trigger: React.ReactNode;
}

export function ProjectCommand({
  boardId,
  boardName,
  currentProjectId,
  revalidationKeys,
  trigger,
}: ProjectCommandProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { projects } = useProjects();

  const revalidate = (affectedProjectId?: string | null) => {
    revalidationKeys.forEach((k) => mutate(k));
    mutate("/api/boards");
    if (currentProjectId) mutate(`/api/projects/${currentProjectId}`);
    if (affectedProjectId) mutate(`/api/projects/${affectedProjectId}`);
  };

  const handleSelect = async (projectId: string | null) => {
    if (projectId === currentProjectId) {
      setOpen(false);
      return;
    }

    setLoading(projectId ?? "remove");
    try {
      await axios.patch(`/api/boards/${boardId}`, { projectId });
      if (projectId === null) {
        toast.success(
          <span>
            <strong>{boardName}</strong> removed from project
          </span>,
        );
      } else {
        const project = projects.find((p) => p.id === projectId);
        toast.success(
          <span>
            <strong>{boardName}</strong> moved to{" "}
            <strong>{project?.name}</strong>
          </span>,
        );
      }
      revalidate(projectId);
      setOpen(false);
    } catch {
      toast.error("Failed to update project");
    } finally {
      setLoading(null);
    }
  };

  const triggerWithHandler = isValidElement(trigger)
    ? cloneElement(
        trigger as React.ReactElement<{ onClick?: React.MouseEventHandler }>,
        {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            setOpen(true);
          },
        },
      )
    : trigger;

  return (
    <>
      {triggerWithHandler}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        onClick={(e) => e.stopPropagation()}
      >
        <CommandInput placeholder="Search projects…" />
        <CommandList>
          <CommandEmpty>No projects found.</CommandEmpty>

          {projects.length > 0 ? (
            <CommandGroup heading="Projects">
              <ScrollArea className="h-48 overflow-y-auto">
                {projects.map((project) => {
                  const isActive = project.id === currentProjectId;
                  const isLoading = loading === project.id;
                  return (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => handleSelect(project.id)}
                      disabled={isLoading}
                    >
                      <FolderOpen
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          "flex-1 truncate",
                          isActive ? "font-bold" : "",
                        )}
                      >
                        {project.name}
                      </span>
                      {isLoading ? (
                        <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                      ) : isActive ? (
                        <Check className="size-4 text-primary shrink-0" />
                      ) : null}
                    </CommandItem>
                  );
                })}
              </ScrollArea>
            </CommandGroup>
          ) : (
            <CommandGroup>
              <CommandItem disabled>
                <FolderDot className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Create a project first
                </span>
              </CommandItem>
            </CommandGroup>
          )}

          {currentProjectId && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  value="__remove__"
                  onSelect={() => handleSelect(null)}
                  disabled={loading === "remove"}
                  className="text-muted-foreground mt-1"
                >
                  {loading === "remove" ? (
                    <span className="size-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <FolderMinus className="size-4 shrink-0" />
                  )}
                  Remove from project
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

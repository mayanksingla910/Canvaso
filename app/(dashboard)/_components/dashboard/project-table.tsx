"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProjectRow, useProjects } from "@/hooks/useBoards";
import { timeAgo } from "@/lib/timeAgo";
import axios from "axios";
import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EditableName from "./editable-name";

function ProjectTable() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { projects, isLoading, refresh } = useProjects();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/projects/${id}`);
      toast.success("Project deleted");
      refresh();
    } catch {
      toast.error("Failed to delete project");
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Loading projects…
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No projects yet. Create one above!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-60">Name</TableHead>
          {!isMobile && <TableHead className="w-32">Created</TableHead>}
          <TableHead className="w-28">Edited</TableHead>
          {!isMobile && (
            <TableHead className="text-center w-14">Author</TableHead>
          )}
          <TableHead className="w-14" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project: ProjectRow) => (
          <TableRow
            key={project.id}
            onClick={() => router.push(`/projects/${project.id}`)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium max-w-60 overflow-clip">
              <EditableName
                id={project.id}
                name={project.name}
                endpoint="/api/projects"
                swrKeys="/api/projects"
              />
            </TableCell>
            {!isMobile && (
              <TableCell
                title={new Date(project.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              >
                {timeAgo(project.createdAt)}
              </TableCell>
            )}
            <TableCell
              title={new Date(project.editedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            >
              {timeAgo(project.editedAt)}
            </TableCell>
            {!isMobile && (
              <TableCell className="">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={project.author.image ?? ""}
                    alt={project.author.name}
                  />
                  <AvatarFallback className="">
                    {project.author.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
            )}
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => handleDelete(e, project.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ProjectTable;

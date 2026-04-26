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
import { timeAgo } from "@/lib/timeAgo";
import { router } from "better-auth/api";
import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

type project = {
  id: string;
  name: string;
  createdAt: Date;
  editedAt: Date;
  author: typeof user;
};

const projects: project[] = [
  {
    id: "INV001",
    name: "My First Project",
    createdAt: new Date("2026-04-03"),
    editedAt: new Date("2025-03-20"),
    author: user,
  },
  {
    id: "INV002",
    name: "My Second Project",
    createdAt: new Date("2026-04-03"),
    editedAt: new Date("2025-03-20"),
    author: user,
  },
];

function ProjectTable() {
  const isMobile = useIsMobile();
  const router = useRouter();

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
        {projects.map((project) => (
          <TableRow key={project.id} onClick={() => router.push(`/projects/${project.id}`)}>
            <TableCell className="font-medium max-w-60 overflow-clip">
              {project.name}
            </TableCell>
            {!isMobile && (
              <TableCell
                title={project.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              >
                {timeAgo(project.createdAt)}
              </TableCell>
            )}
            <TableCell
              title={project.editedAt.toLocaleDateString("en-US", {
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
                    src={project.author.avatar}
                    alt={project.author.name}
                  />
                  <AvatarFallback className="">
                    {project.author.name.slice(0, 2).toUpperCase()}
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
                  <DropdownMenuItem variant="destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>More...</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export default ProjectTable;

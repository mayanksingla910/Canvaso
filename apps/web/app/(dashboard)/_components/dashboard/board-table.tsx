"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/delete-dialog";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { BoardRow, useBoards } from "@/hooks/useBoards";
import { timeAgo } from "@/lib/timeAgo";
import axios from "axios";
import { FolderInput, FolderPen, MoreHorizontalIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EditableName from "./editable-name";
import { mutate } from "swr";
import { ProjectCommand } from "./project-command";

interface BoardTableProps {
  boards?: BoardRow[];
  isLoading?: boolean;
  swrKey?: string;
}

function BoardTable({ boards: propBoards, isLoading: propLoading, swrKey }: BoardTableProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { boards: fetchedBoards, isLoading: fetchLoading, refresh } = useBoards();

  const boards = propBoards ?? fetchedBoards;
  const isLoading = propLoading ?? fetchLoading;
  const revalidationKey = swrKey ?? "/api/boards";

  const revalidate = () => {
    mutate(revalidationKey);
    mutate("/api/boards");
    if (!propBoards) refresh();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/boards/${id}`);
    toast.success("Board deleted");
    revalidate();
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Loading boards…
      </div>
    );
  }

  if (!boards.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No boards yet. Create one above!
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
          {!isMobile && <TableHead className="text-center w-14">Author</TableHead>}
          <TableHead className="w-14" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {boards.map((board: BoardRow) => (
          <TableRow
            key={board.id}
            onClick={() => router.push(`/${board.id}`)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium max-w-60 overflow-clip">
              <EditableName
                id={board.id}
                name={board.name}
                endpoint="/api/boards"
                swrKeys={["/api/boards", revalidationKey]}
              />
            </TableCell>
            {!isMobile && (
              <TableCell
                title={new Date(board.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              >
                {timeAgo(new Date(board.createdAt))}
              </TableCell>
            )}
            <TableCell
              title={new Date(board.editedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            >
              {timeAgo(new Date(board.editedAt))}
            </TableCell>
            {!isMobile && (
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={board.author.image ?? ""} alt={board.author.name} />
                  <AvatarFallback>{board.author.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </TableCell>
            )}
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontalIcon />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">

                  <ProjectCommand
                    boardId={board.id}
                    boardName={board.name}
                    currentProjectId={board.projectId}
                    revalidationKeys={[revalidationKey, "/api/boards"]}
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {board.projectId ? (
                          <><FolderPen className="size-4" /> Change project</>
                        ) : (
                          <><FolderInput className="size-4" /> Add to project</>
                        )}
                      </DropdownMenuItem>
                    }
                  />

                  <DropdownMenuSeparator />

                  <DeleteDialog
                    type="board"
                    name={board.name}
                    onDelete={() => handleDelete(board.id)}
                    trigger={
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => e.preventDefault()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default BoardTable;
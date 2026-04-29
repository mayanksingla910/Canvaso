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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { BoardRow, useBoards } from "@/hooks/useBoards";
import { timeAgo } from "@/lib/timeAgo";
import axios from "axios";
import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EditableName from "./editable-name";
import { mutate } from "swr";

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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    try {
      await axios.delete(`/api/boards/${id}`);
      toast.success("Board deleted");
      mutate(revalidationKey);
      if (!propBoards) refresh();
    } catch {
      toast.error("Failed to delete board");
    }
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
          {!isMobile && (
            <TableHead className="text-center w-14">Author</TableHead>
          )}
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
                {timeAgo(board.createdAt)}
              </TableCell>
            )}
            <TableCell
              title={new Date(board.editedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            >
              {timeAgo(board.editedAt)}
            </TableCell>
            {!isMobile && (
              <TableCell className="">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={board.author.image ?? ""}
                    alt={board.author.name}
                  />
                  <AvatarFallback className="">
                    {board.author.name[0].toUpperCase()}
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
                    onClick={(e) => handleDelete(e, board.id)}
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

export default BoardTable;

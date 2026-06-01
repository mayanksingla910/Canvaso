"use client";

import Board from "@/components/board";
import { useBoardSync } from "@/hooks/useBoardSync";
import { useCollaboration } from "@/hooks/useCollaboration";

export default function BoardCanvas({ boardId }: { boardId: string }) {
  useBoardSync(boardId);
  useCollaboration(boardId);
  return <Board />;
}
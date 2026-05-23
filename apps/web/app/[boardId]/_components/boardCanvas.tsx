"use client";

import Board from "@/components/board";
import { useBoardSync } from "@/hooks/useBoardSync";

export default function BoardCanvas({ boardId }: { boardId: string }) {
  useBoardSync(boardId);
  return <Board />;
}
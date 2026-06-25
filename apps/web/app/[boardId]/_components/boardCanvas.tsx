"use client";

import Board from "@/components/board";
import { useBoardSync } from "@/hooks/useBoardSync";
import { useCollaboration } from "@/hooks/useCollaboration";
import { getUserColor } from "@/hooks/useCursors";
import ShareBoardModal from "./share-board-modal";
import { CollaborationContext } from "./CollaborationContext";
import { useEffect, useState } from "react";
import { useToolStore } from "@/store/useToolStore";
import { authClient } from "@/lib/auth-client";
import axios from "axios";

interface BoardCanvasProps {
  boardId: string;
  role: "owner" | "editor" | "viewer";
  token: string | null;
  isAuthenticated: boolean;
}

export default function BoardCanvas({
  boardId,
  role,
  token,
  isAuthenticated,
}: BoardCanvasProps) {
  const [joined, setJoined] = useState(!token || !isAuthenticated);
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id ?? null;
  const userName = session?.user?.name ?? null;

  useBoardSync(boardId, { token });

  const { awarenessRef } = useCollaboration(boardId, {
    userId,
    // Logged-in users connect with userId only — they're saved as collaborators
    // via the join route. Token is only needed for unauthenticated guests.
    token: userId ? null : token,
    enabled: !isPending && joined,
  });

  // Set local awareness state (name + color) so peers can show our cursor label
  useEffect(() => {
    const awareness = awarenessRef.current;
    if (!awareness || !userId) return;
    awareness.setLocalStateField("user", {
      name: userName ?? "User",
      color: getUserColor(userId),
    });
  }, [awarenessRef, userId, userName]);

  // Gate all drawing tools for viewers
  useEffect(() => {
    const store = useToolStore.getState();
    if (role === "viewer") store.setReadonly(true);
    return () => store.setReadonly(false);
  }, [role]);

  // Promote token-based access to permanent collaborator
  useEffect(() => {
    if (!token || !isAuthenticated) {
      setJoined(true);
      return;
    }
    axios
      .post(`/api/boards/${boardId}/join`, { token })
      .then(() => setJoined(true))
      .catch(() => setJoined(true));
  }, [boardId, token, isAuthenticated]);

  return (
    <CollaborationContext.Provider value={{ awarenessRef, userId, userName }}>
      
        <div className="fixed top-5 right-5 sm:right-10 z-20">
          <ShareBoardModal boardId={boardId} role={role} />
        </div>
      <Board readonly={role === "viewer"} />
    </CollaborationContext.Provider>
  );
}
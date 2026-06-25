
"use client";

import { Awareness } from "y-protocols/awareness";
import { createContext, useContext, RefObject } from "react";

interface CollaborationContextValue {
  awarenessRef: RefObject<Awareness | null>;
  userId: string | null;
  userName: string | null;
}

export const CollaborationContext = createContext<CollaborationContextValue>({
  awarenessRef: { current: null },
  userId: null,
  userName: null,
});

export function useCollaborationContext() {
  return useContext(CollaborationContext);
}
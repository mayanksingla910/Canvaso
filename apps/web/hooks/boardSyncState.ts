
const syncedBoards = new Set<string>();

export function markBoardSynced(boardId: string) {
  syncedBoards.add(boardId);
}

export function isBoardSynced(boardId: string) {
  return syncedBoards.has(boardId);
}

export function clearBoardSynced(boardId: string) {
  syncedBoards.delete(boardId);
}
import { prisma } from "@canvaso/database";

export type BoardRole = "owner" | "editor" | "viewer";

export async function resolveRole(
  boardId: string,
  userId: string | null,
  token: string | null,
): Promise<BoardRole | null> {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return null;

  if (userId && board.authorId === userId) return "owner";

  if (userId) {
    const collab = await prisma.boardCollaborator.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (collab) return collab.role as BoardRole;
  }

  if (token) {
    const link = await prisma.boardShareLink.findUnique({
      where: { token },
    });
    if (
      link &&
      link.boardId === boardId &&
      link.isActive &&
      (!link.expiresAt || link.expiresAt > new Date())
    ) {
      return link.role as BoardRole;
    }
  }

  return null;
}

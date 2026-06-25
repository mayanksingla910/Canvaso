import { prisma } from "@canvaso/database";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ boardId: string; userId?: string }> };

async function assertOwner(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.authorId !== userId) return null;
  return board;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, userId } = await params;
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const board = await assertOwner(boardId, session.user.id);
  if (!board) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { role } = await req.json();

  const collaborator = await prisma.boardCollaborator.update({
    where: { boardId_userId: { boardId: boardId, userId: userId } },
    data: { role },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json({ collaborator });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, userId } = await params;

  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const board = await assertOwner(boardId, session.user.id);
  if (!board) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.boardCollaborator.delete({
    where: { boardId_userId: { boardId: boardId, userId: userId } },
  });

  return NextResponse.json({ ok: true });
}

import { prisma } from "@canvaso/database";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ boardId: string; userId?: string }> };

async function assertOwner(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.authorId !== userId) return null;
  return board;
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;

  const board = await assertOwner(boardId, session.user.id);
  if (!board) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, role } = await req.json();
  if (!email || !role)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  if (session.user.email === email) {
    return NextResponse.json(
      { error: "You are already the owner" },
      { status: 400 },
    );
  }

  const invitee = await prisma.user.findUnique({ where: { email } });
  if (!invitee) {
    return NextResponse.json(
      { error: "No user with that email" },
      { status: 404 },
    );
  }

  const collaborator = await prisma.boardCollaborator.upsert({
    where: { boardId_userId: { boardId: boardId, userId: invitee.id } },
    update: { role },
    create: { boardId: boardId, userId: invitee.id, role },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json({ collaborator });
}

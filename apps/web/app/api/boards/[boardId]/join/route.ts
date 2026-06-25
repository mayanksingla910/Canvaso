import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@canvaso/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;
  const { token } = await req.json();

  if (!token)
    return NextResponse.json({ error: "Token required" }, { status: 400 });

  const link = await prisma.boardShareLink.findUnique({ where: { token } });

  if (
    !link ||
    !link.isActive ||
    link.boardId !== boardId ||
    (link.expiresAt && link.expiresAt < new Date())
  ) {
    return NextResponse.json(
      { error: "Invalid or expired link" },
      { status: 403 },
    );
  }

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (board?.authorId === session.user.id) {
    return NextResponse.json({ ok: true, role: "owner" });
  }

  const existing = await prisma.boardCollaborator.findUnique({
    where: { boardId_userId: { boardId, userId: session.user.id } },
  });

  if (!existing) {
    await prisma.boardCollaborator.create({
      data: { boardId, userId: session.user.id, role: link.role },
    });
  }

  return NextResponse.json({ ok: true, role: existing?.role ?? link.role });
}

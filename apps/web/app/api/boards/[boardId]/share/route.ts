import { prisma } from "@canvaso/database";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

type Params = { params: Promise<{ boardId: string }> };

function generateShareToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function assertOwner(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.authorId !== userId) return null;
  return board;
}

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;

  const [board, link, collaborators] = await Promise.all([
    prisma.board.findUnique({
      where: { id: boardId },
      select: {
        authorId: true,
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
    prisma.boardShareLink.findFirst({
      where: { boardId: boardId, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.boardCollaborator.findMany({
      where: { boardId: boardId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
  ]);

  if (!board)
    return NextResponse.json({ error: "Board not found" }, { status: 404 });

  return NextResponse.json({
    link: link ?? null,
    owner: board.author,
    collaborators,
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;

  const board = await assertOwner(boardId, session.user.id);
  if (!board) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { role = "viewer" } = await req.json();

  await prisma.boardShareLink.updateMany({
    where: { boardId: boardId },
    data: { isActive: false },
  });

  const link = await prisma.boardShareLink.create({
    data: {
      boardId: boardId,
      token: generateShareToken(),
      role,
      isActive: true,
    },
  });

  return NextResponse.json({ link });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;

  const board = await assertOwner(boardId, session.user.id);
  if (!board) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { role, isActive } = await req.json();

  const existing = await prisma.boardShareLink.findFirst({
    where: { boardId: boardId },
    orderBy: { createdAt: "desc" },
  });

  if (!existing)
    return NextResponse.json({ error: "No link found" }, { status: 404 });

  const shouldRotate = isActive === false;

  const link = await prisma.boardShareLink.update({
    where: { id: existing.id },
    data: {
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(shouldRotate && { token: generateShareToken() }),
    },
  });

  return NextResponse.json({ link });
}

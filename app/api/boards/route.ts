import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boards = await prisma.board.findMany({
    where: {
      authorId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      editedAt: true,
      author: { select: { id: true, name: true, image: true } },
      projectId: true
    },
    orderBy: { editedAt: "desc" },
  });

  return NextResponse.json({ boards });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { name, projectId } = body;
  const [board] = await prisma.$transaction([
    prisma.board.create({
      data: {
        name: name?.trim() ?? "New Board",
        authorId: session.user.id,
        viewport: { x: 0, y: 0, zoom: 1 },
        pageSize: { width: 1920, height: 1080, label: "HD", isInfinite: true },
        projectId: projectId ?? null,
      },
    }),
    ...(projectId
      ? [
          prisma.project.update({
            where: { id: projectId },
            data: { editedAt: new Date() },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ board }, { status: 201 });
}

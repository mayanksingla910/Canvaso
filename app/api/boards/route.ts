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
    },
    orderBy: { editedAt: "desc" },
  });

  return NextResponse.json({boards});
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {name, projectId, viewport, pageSize} = body;
  const board = await prisma.board.create({
    data: {
      name: name?.trim() ?? "New Board",
      authorId: session.user.id,
      viewport: { x: 0, y: 0, zoom: 1 },
      pageSize: pageSize ?? { width: 1920, height: 1080, label: "HD", isInfinite: true },
      projectId: projectId ?? null,
      
    },
  });

  return NextResponse.json({board}, { status: 201 });
}
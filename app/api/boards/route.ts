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

  const {name, viewport, pageSize} = body;
  const board = await prisma.board.create({
    data: {
      name: name ?? "New Board",
      authorId: session.user.id,
      viewport: viewport ?? [0, 0, 100, 100],
      pageSize: pageSize ?? [100, 100],
    },
  });

  return NextResponse.json({board});
}
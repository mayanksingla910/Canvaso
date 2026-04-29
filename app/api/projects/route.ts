import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
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

  return NextResponse.json({projects});
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {name} = body;
  const project = await prisma.project.create({
    data: {
      name: name?.trim() ?? "New Project",
      authorId: session.user.id,
    },
  });

  return NextResponse.json({project}, {status: 201});
}
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId, authorId: session.user.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      editedAt: true,
      author: { select: { id: true, name: true, image: true } },
      boards: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          editedAt: true,
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { editedAt: "desc" },
      },
    },
  });

  if (!project)
    return NextResponse.json({ error: "Not Found" }, { status: 404 });

  return NextResponse.json(project);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const { name } = await req.json();

  if (!name?.trim())
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const project = await prisma.project.update({
    where: { id: projectId, authorId: session.user.id },
    data: { name: name.trim() },
    select: { id: true, name: true },
  });

  return NextResponse.json({ project });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  await prisma.project.delete({
    where: { id: projectId, authorId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}

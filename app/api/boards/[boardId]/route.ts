import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  CanvasElement,
  CanvasElementSchema,
  ViewportSchema,
} from "@/types/canvas";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId, authorId: session.user.id },
    include: { elements: { where: { isDeleted: false } } },
  });

  if (!board)
    return NextResponse.json({ error: "Board not found" }, { status: 404 });

  const elements: Record<string, CanvasElement> = {};

  for (const el of board.elements) {
    const raw = {
      id: el.id,
      type: el.type,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      angle: el.angle,
      opacity: el.opacity,
      strokeColor: el.strokeColor,
      strokeWidth: el.strokeWidth,
      strokeStyle: el.strokeStyle,
      fillColor: el.fillColor,
      strokeSharpness: el.strokeSharpness,
      isLocked: el.isLocked,
      isHidden: el.isHidden,
      boundElements: el.boundElements,
      updatedAt: el.updatedAt.getTime(),
      createdAt: el.createdAt.getTime(),
      ...(typeof el.props === "object" && el.props !== null ? el.props : {}),
    };

    const parsed = CanvasElementSchema.safeParse(raw);
    if (parsed.success) {
      elements[el.id] = parsed.data;
    } else {
      console.warn(
        `[GET board] Skipping invalid element ${el.id}:`,
        parsed.error.flatten(),
      );
    }
  }

  return NextResponse.json({
    id: board.id,
    name: board.name,
    viewport: board.viewport,
    pageSize: board.pageSize,
    elements,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId, authorId: session.user.id },
    select: { id: true },
  });
  if (!board)
    return NextResponse.json({ error: "Board not found" }, { status: 404 });

  const body = await req.json();
  const { deletedIds = [], viewport: rawViewport } = body;
  const rawElements: unknown[] = Object.values(body.elements ?? {});

  const viewportResult = ViewportSchema.safeParse(rawViewport);
  if (!viewportResult.success) {
    return NextResponse.json(
      { error: "Invalid viewport", details: viewportResult.error.flatten() },
      { status: 400 },
    );
  }

  const validElements: CanvasElement[] = [];
  for (const raw of rawElements) {
    const result = CanvasElementSchema.safeParse(raw);
    if (result.success) {
      validElements.push(result.data);
    } else {
      const id = (raw as Record<string, unknown>)?.id ?? "unknown";
      console.warn(
        `[PUT board] Skipping invalid element ${id}:`,
        result.error.flatten(),
      );
    }
  }

  const BASE_FIELDS = new Set([
    "id",
    "type",
    "x",
    "y",
    "width",
    "height",
    "angle",
    "opacity",
    "strokeColor",
    "strokeWidth",
    "strokeStyle",
    "fillColor",
    "strokeSharpness",
    "isLocked",
    "isHidden",
    "isSelected",
    "boundElements",
    "createdAt",
    "updatedAt",
  ]);

  function splitElement(el: CanvasElement): {
    base: Record<string, unknown>;
    props: Prisma.InputJsonValue;
  } {
    const base: Record<string, unknown> = {};
    const props: Record<string, Prisma.InputJsonValue> = {};
    for (const [key, val] of Object.entries(el)) {
      if (BASE_FIELDS.has(key)) {
        base[key] = val;
      } else {
        props[key] = val as Prisma.InputJsonValue;
      }
    }
    return { base, props };
  }

  await prisma.$transaction([
    ...(deletedIds.length > 0
      ? [
          prisma.boardElement.updateMany({
            where: { boardId, id: { in: deletedIds } },
            data: { isDeleted: true },
          }),
        ]
      : []),

    ...validElements.map((el) => {
      const { base, props } = splitElement(el);
      return prisma.boardElement.upsert({
        where: { id: el.id },
        create: {
          id: el.id,
          boardId,
          type: base.type as string,
          x: base.x as number,
          y: base.y as number,
          width: base.width as number,
          height: base.height as number,
          angle: (base.angle as number) ?? 0,
          opacity: (base.opacity as number) ?? 1,
          strokeColor: base.strokeColor as string,
          strokeWidth: (base.strokeWidth as number) ?? 2,
          strokeStyle: (base.strokeStyle as string) ?? "solid",
          fillColor: (base.fillColor as string) ?? "transparent",
          strokeSharpness: (base.strokeSharpness as number) ?? 100,
          isLocked: (base.isLocked as boolean) ?? false,
          isHidden: (base.isHidden as boolean) ?? false,
          boundElements: (base.boundElements as string[]) ?? [],
          props,
        },
        update: {
          x: base.x as number,
          y: base.y as number,
          width: base.width as number,
          height: base.height as number,
          angle: base.angle as number,
          opacity: base.opacity as number,
          strokeColor: base.strokeColor as string,
          strokeWidth: base.strokeWidth as number,
          strokeStyle: base.strokeStyle as string,
          fillColor: base.fillColor as string,
          strokeSharpness: base.strokeSharpness as number,
          isLocked: base.isLocked as boolean,
          isHidden: base.isHidden as boolean,
          boundElements: base.boundElements as string[],
          props,
          isDeleted: false,
        },
      });
    }),

    prisma.board.update({
      where: { id: boardId },
      data: { viewport: viewportResult.data },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;
  const { name } = await req.json();

  if (!name?.trim())
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const board = await prisma.board.update({
    where: { id: boardId, authorId: session.user.id },
    data: { name: name.trim() },
    select: { id: true, name: true },
  });

  return NextResponse.json({ board });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;

  await prisma.board.delete({
    where: { id: boardId, authorId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}

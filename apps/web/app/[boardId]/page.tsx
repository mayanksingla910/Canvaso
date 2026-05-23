import { notFound } from "next/navigation";
import BoardCanvas from "./_components/boardCanvas";
import { prisma } from "@canvaso/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) notFound();

  const board = await prisma.board.findUnique({
    where: { id: boardId, authorId: session?.user.id },
  });

  if (!board) notFound();

  return <BoardCanvas boardId={boardId} />;
}

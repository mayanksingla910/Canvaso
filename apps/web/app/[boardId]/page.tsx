import BoardCanvas from "./_components/boardCanvas";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { resolveRole } from "@/lib/resolveRole";

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function BoardPage({
  params,
  searchParams,
}: BoardPageProps) {
  const { boardId } = await params;
  const { token = null } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  const role = await resolveRole(boardId, userId, token);

  if (!role) {
    if (!userId && token) {
      redirect(`/login?next=/${boardId}?token=${token}`);
    }
    if (!userId) {
      redirect(`/login?next=/${boardId}`);
    }
    notFound();
  }

  return (
    <BoardCanvas
      boardId={boardId}
      role={role}
      token={token}
      isAuthenticated={!!userId}
    />
  );
}
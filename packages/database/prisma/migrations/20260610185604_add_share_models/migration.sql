-- CreateEnum
CREATE TYPE "ShareRole" AS ENUM ('viewer', 'editor');

-- CreateTable
CREATE TABLE "board_share_link" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "ShareRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "board_share_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_collaborator" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ShareRole" NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_share_link_token_key" ON "board_share_link"("token");

-- CreateIndex
CREATE INDEX "board_share_link_token_idx" ON "board_share_link"("token");

-- CreateIndex
CREATE INDEX "board_share_link_boardId_idx" ON "board_share_link"("boardId");

-- CreateIndex
CREATE INDEX "board_collaborator_userId_idx" ON "board_collaborator"("userId");

-- CreateIndex
CREATE INDEX "board_collaborator_boardId_idx" ON "board_collaborator"("boardId");

-- CreateIndex
CREATE UNIQUE INDEX "board_collaborator_boardId_userId_key" ON "board_collaborator"("boardId", "userId");

-- AddForeignKey
ALTER TABLE "board_share_link" ADD CONSTRAINT "board_share_link_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_collaborator" ADD CONSTRAINT "board_collaborator_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_collaborator" ADD CONSTRAINT "board_collaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

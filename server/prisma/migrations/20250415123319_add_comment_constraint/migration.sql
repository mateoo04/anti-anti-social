/*
  Warnings:

  - A unique constraint covering the columns `[type,toUserId,fromUserId,postId,commentId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Notification_type_toUserId_fromUserId_postId_key";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "commentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_type_toUserId_fromUserId_postId_commentId_key" ON "Notification"("type", "toUserId", "fromUserId", "postId", "commentId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[type,toUserId,fromUserId,postId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Notification_type_toUserId_fromUserId_postId_key" ON "Notification"("type", "toUserId", "fromUserId", "postId");

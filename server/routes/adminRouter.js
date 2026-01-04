const { Router } = require("express");
const adminController = require("../controllers/adminController");

const adminRouter = Router({ mergeParams: true });

adminRouter.get("/", adminController.getStats);

adminRouter.patch("/users/:userId/restrict", adminController.setRestricted);

adminRouter.patch("/users/:userId/admin", adminController.setAdmin);

module.exports = adminRouter;

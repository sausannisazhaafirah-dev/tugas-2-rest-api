import { Router } from "express";
import { MenuItemController } from "../controllers/menuItemController.ts";
import { validate } from "../middlewares/validate.ts";
import {
  createMenuItemSchema,
  menuItemIdParamSchema,
  menuItemQuerySchema,
  updateMenuItemSchema,
} from "../schemas/menuItemSchema.ts";

const menuItemRouter = Router();
const menuItemController = new MenuItemController();

menuItemRouter.get(
  "/",
  validate(menuItemQuerySchema, "query"),
  menuItemController.getMenuItems,
);
menuItemRouter.post(
  "/",
  validate(createMenuItemSchema, "body"),
  menuItemController.createMenuItem,
);
menuItemRouter.get(
  "/:id",
  validate(menuItemIdParamSchema, "params"),
  menuItemController.getMenuItemById,
);
menuItemRouter.put(
  "/:id",
  validate(menuItemIdParamSchema, "params"),
  validate(updateMenuItemSchema, "body"),
  menuItemController.updateMenuItem,
);
menuItemRouter.delete(
  "/:id",
  validate(menuItemIdParamSchema, "params"),
  menuItemController.deleteMenuItem,
);

export { menuItemRouter };
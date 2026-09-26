import type { Request, Response } from "express";
import { MenuItemService } from "../services/menuItemService.ts";
import { getValidated } from "../middlewares/validate.ts";
import type {
  CreateMenuItemInput,
  MenuItemIdParam,
  MenuItemQuery,
  UpdateMenuItemInput,
} from "../schemas/menuItemSchema.ts";

export class MenuItemController {
  private menuItemService: MenuItemService;

  constructor(menuItemService: MenuItemService = new MenuItemService()) {
    this.menuItemService = menuItemService;
  }

  getMenuItems = async (_req: Request, res: Response): Promise<void> => {
    const query = getValidated<MenuItemQuery>(res, "query");
    const data = await this.menuItemService.getAllMenuItems(query);
    res.status(200).json({ status: "success", data });
  };

  getMenuItemById = async (_req: Request, res: Response): Promise<void> => {
    const { id } = getValidated<MenuItemIdParam>(res, "params");
    const data = await this.menuItemService.getMenuItemById(id);
    res.status(200).json({ status: "success", data });
  };

  createMenuItem = async (_req: Request, res: Response): Promise<void> => {
    const body = getValidated<CreateMenuItemInput>(res, "body");
    const data = await this.menuItemService.createMenuItem(body);
    res.status(201).json({ status: "success", data });
  };

  updateMenuItem = async (_req: Request, res: Response): Promise<void> => {
    const { id } = getValidated<MenuItemIdParam>(res, "params");
    const body = getValidated<UpdateMenuItemInput>(res, "body");
    const data = await this.menuItemService.updateMenuItem(id, body);
    res.status(200).json({ status: "success", data });
  };

  deleteMenuItem = async (_req: Request, res: Response): Promise<void> => {
    const { id } = getValidated<MenuItemIdParam>(res, "params");
    const data = await this.menuItemService.deleteMenuItem(id);
    res.status(200).json({ status: "success", data });
  };
}
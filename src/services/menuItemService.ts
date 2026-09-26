import { MenuItemRepository } from "../repositories/menuItemRepository.ts";
import { StallRepository } from "../repositories/stallRepository.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { AppError } from "../errors/AppError.ts";
import type {
  CreateMenuItemInput,
  MenuItemQuery,
  UpdateMenuItemInput,
} from "../schemas/menuItemSchema.ts";

export class MenuItemService {
  private menuItemRepository: MenuItemRepository;
  private stallRepository: StallRepository;

  constructor(
    menuItemRepository: MenuItemRepository = new MenuItemRepository(),
    stallRepository: StallRepository = new StallRepository(),
  ) {
    this.menuItemRepository = menuItemRepository;
    this.stallRepository = stallRepository;
  }

  private async ensureStallExists(stallId: number) {
    const stall = await this.stallRepository.findById(stallId);
    if (!stall) throw new NotFoundError("Warung tidak ditemukan");
  }

  async getAllMenuItems(query: MenuItemQuery) {
    return this.menuItemRepository.findAllWithStall(query.stallId);
  }

  async getMenuItemById(id: number) {
    const row = await this.menuItemRepository.findByIdWithStall(id);
    if (!row) throw new NotFoundError("Menu tidak ditemukan");
    return row;
  }

  async createMenuItem(input: CreateMenuItemInput) {
    await this.ensureStallExists(input.stallId);
    const row = await this.menuItemRepository.create(input);
    if (!row) throw new AppError(500, "Menu gagal dibuat");
    return this.getMenuItemById(row.id);
  }

  async updateMenuItem(id: number, input: UpdateMenuItemInput) {
    if (Object.keys(input).length === 0) {
      throw new AppError(400, "Minimal satu field harus diisi");
    }
    if (input.stallId !== undefined) await this.ensureStallExists(input.stallId);
    const row = await this.menuItemRepository.update(id, input);
    if (!row) throw new NotFoundError("Menu tidak ditemukan");
    return this.getMenuItemById(id);
  }

  async deleteMenuItem(id: number) {
    const existing = await this.getMenuItemById(id); // 404 bila tidak ada
    await this.menuItemRepository.remove(id);
    return existing;
  }
}
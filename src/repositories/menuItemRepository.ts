import { eq } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { menuItems, stalls } from "../db/schema.ts";
import type {
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from "../schemas/menuItemSchema.ts";

// Kolom hasil JOIN MENU_ITEMS + STALLS.
const menuWithStallColumns = {
  id: menuItems.id,
  stallId: menuItems.stallId,
  stallName: stalls.name,
  stallLocation: stalls.location,
  name: menuItems.name,
  price: menuItems.price,
  isAvailable: menuItems.isAvailable,
};

export class MenuItemRepository {
  // Dipakai StallService untuk GET /stalls/:id/menus (jangan dihapus).
  async findByStallId(stallId: number) {
    const db = await getDb();
    return db.select().from(menuItems).where(eq(menuItems.stallId, stallId));
  }

  // JOIN: setiap menu ikut membawa nama & lokasi warungnya.
  async findAllWithStall(stallId?: number) {
    const db = await getDb();
    return db
      .select(menuWithStallColumns)
      .from(menuItems)
      .innerJoin(stalls, eq(menuItems.stallId, stalls.id))
      .where(stallId !== undefined ? eq(menuItems.stallId, stallId) : undefined)
      .orderBy(menuItems.id);
  }

  async findByIdWithStall(id: number) {
    const db = await getDb();
    const rows = await db
      .select(menuWithStallColumns)
      .from(menuItems)
      .innerJoin(stalls, eq(menuItems.stallId, stalls.id))
      .where(eq(menuItems.id, id));
    return rows[0];
  }

  async create(input: CreateMenuItemInput) {
    const db = await getDb();
    const rows = await db
      .insert(menuItems)
      .output()
      .values({
        stallId: input.stallId,
        name: input.name,
        price: input.price,
        isAvailable: input.isAvailable ?? true,
      });
    return rows[0];
  }

  async update(id: number, input: UpdateMenuItemInput) {
    const db = await getDb();
    const rows = await db
      .update(menuItems)
      .set({
        ...(input.stallId !== undefined ? { stallId: input.stallId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.isAvailable !== undefined ? { isAvailable: input.isAvailable } : {}),
      })
      .where(eq(menuItems.id, id))
      .output();
    return rows[0];
  }

  async remove(id: number) {
    const db = await getDb();
    const rows = await db.delete(menuItems).where(eq(menuItems.id, id)).output();
    return rows[0];
  }
}
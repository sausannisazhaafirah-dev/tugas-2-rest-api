import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// ------------------------------------------------------------------ params
export const menuItemIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "id harus berupa angka" })
    .int("id harus bilangan bulat")
    .positive("id harus lebih dari 0")
    .openapi({ example: 1, description: "ID menu" }),
});

// ------------------------------------------------------------------- query
export const menuItemQuerySchema = z.object({
  stallId: z.coerce
    .number({ invalid_type_error: "stallId harus berupa angka" })
    .int("stallId harus bilangan bulat")
    .positive("stallId harus lebih dari 0")
    .optional()
    .openapi({ description: "Filter menu berdasarkan ID warung", example: 1 }),
});

// -------------------------------------------------------------------- body
export const createMenuItemSchema = z
  .object({
    stallId: z
      .number({
        required_error: "stallId wajib diisi",
        invalid_type_error: "stallId harus berupa angka",
      })
      .int("stallId harus bilangan bulat")
      .positive("stallId harus lebih dari 0")
      .openapi({ example: 1, description: "ID warung pemilik menu" }),
    name: z
      .string({ required_error: "name wajib diisi" })
      .trim()
      .min(3, "name minimal 3 karakter")
      .max(100, "name maksimal 100 karakter")
      .openapi({ example: "Es Jeruk Peras", description: "Nama menu" }),
    price: z
      .number({
        required_error: "price wajib diisi",
        invalid_type_error: "price harus berupa angka",
      })
      .int("price harus bilangan bulat")
      .min(0, "price tidak boleh negatif")
      .openapi({ example: 6000, description: "Harga dalam rupiah" }),
    isAvailable: z
      .boolean({ invalid_type_error: "isAvailable harus true/false" })
      .optional()
      .openapi({ example: true, description: "Status tersedia (default true)" }),
  })
  .strict();

// Semua field opsional untuk PUT (update sebagian).
export const updateMenuItemSchema = createMenuItemSchema.partial();

// ------------------------------------------------------------------ types
export type MenuItemIdParam = z.infer<typeof menuItemIdParamSchema>;
export type MenuItemQuery = z.infer<typeof menuItemQuerySchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
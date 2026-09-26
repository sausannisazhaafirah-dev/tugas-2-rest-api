import {
  createMenuItemSchema,
  menuItemIdParamSchema,
  menuItemQuerySchema,
  updateMenuItemSchema,
} from "../schemas/menuItemSchema.ts";
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  createStallSchema,
  idParamSchema,
  stallQuerySchema,
  updateStallSchema,
} from '../schemas/stallSchema.ts';

const registry = new OpenAPIRegistry();

// ----------------------------------------------------------------- schema
// Komponen schema untuk RESPONS (dibuat khusus di sini). Schema untuk BODY
// (createStallSchema, updateStallSchema) sudah didefinisikan di stallSchema.ts
// dan hanya "didaftarkan" agar dipakai ulang lewat $ref.
const stallSchema = registry.register(
  'Stall',
  z.object({
    id: z.number().openapi({ example: 1 }),
    ownerId: z.number().openapi({ example: 2 }),
    name: z.string().openapi({ example: 'Warung Bu Tini' }),
    category: z.string().nullable().openapi({ example: 'Kwetiau' }),
    location: z.string().nullable().openapi({ example: 'Kantin FKIP' }),
    description: z.string().nullable().openapi({ example: 'Kedai kwetiau goreng & kuah' }),
    avgRating: z.number().openapi({ example: 4.5 }),
    reviewCount: z.number().openapi({ example: 2 }),
    isPopular: z.boolean().openapi({ example: false }),
  }),
);

const menuSchema = registry.register(
  'Menu',
  z.object({
    id: z.number().openapi({ example: 1 }),
    stallId: z.number().openapi({ example: 2 }),
    name: z.string().openapi({ example: 'Kwetiau Goreng Spesial' }),
    price: z.number().openapi({ example: 15000 }),
    isAvailable: z.boolean().openapi({ example: true }),
  }),
);

const errorSchema = registry.register(
  'ErrorResponse',
  z.object({
    status: z.string().openapi({ example: 'fail' }),
    message: z.string().openapi({ example: 'Validasi gagal' }),
    errors: z
      .array(z.object({ field: z.string(), message: z.string() }))
      .optional()
      .openapi({ example: [{ field: 'name', message: 'name minimal 3 karakter' }] }),
  }),
);

// Schema body yang DIPAKAI VALIDASI di-handler juga didaftarkan sebagai komponen
// (single source of truth: satu schema bertugas untuk validasi + dokumentasi).
// Nilai kembalian `register` dipakai sebagai referensi ($ref) di requestBody.
const stallInput = registry.register('StallInput', createStallSchema);
const stallUpdate = registry.register('StallUpdate', updateStallSchema);

const stallListResponse = registry.register(
  'StallListResponse',
  z.object({
    status: z.literal('success'),
    meta: z.object({
      page: z.number().openapi({ example: 1 }),
      limit: z.number().openapi({ example: 10 }),
      total: z.number().openapi({ example: 10 }),
    }),
    data: z.array(stallSchema),
  }),
);

const stallDetailResponse = registry.register(
  'StallDetailResponse',
  z.object({
    status: z.literal('success'),
    data: stallSchema,
  }),
);

const menuListResponse = registry.register(
  'MenuListResponse',
  z.object({
    status: z.literal('success'),
    data: z.array(menuSchema),
  }),
);

// ------------------------------------------------------------------ routes
registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Cek kesehatan server & database',
  responses: {
    200: {
      description: 'Server dan database terhubung',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('success'),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/stalls',
  summary: 'Daftar warung',
  description: 'Daftar warung dengan filter `search`/`category` dan pagination.',
  request: { query: stallQuerySchema },
  responses: {
    200: {
      description: 'Daftar warung + meta pagination',
      content: { 'application/json': { schema: stallListResponse } },
    },
    400: {
      description: 'Query parameter tidak valid',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/stalls',
  summary: 'Tambah warung',
  request: {
    body: {
      description: 'Data warung baru',
      content: { 'application/json': { schema: stallInput } },
    },
  },
  responses: {
    201: {
      description: 'Warung berhasil dibuat',
      content: { 'application/json': { schema: stallDetailResponse } },
    },
    400: {
      description: 'Body tidak valid',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/stalls/{id}',
  summary: 'Detail warung',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Detail warung',
      content: { 'application/json': { schema: stallDetailResponse } },
    },
    400: {
      description: 'Parameter id tidak valid',
      content: { 'application/json': { schema: errorSchema } },
    },
    404: {
      description: 'Warung tidak ditemukan',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/v1/stalls/{id}',
  summary: 'Update warung',
  request: {
    params: idParamSchema,
    body: {
      description: 'Data warung yang diubah (boleh sebagian)',
      content: { 'application/json': { schema: stallUpdate } },
    },
  },
  responses: {
    200: {
      description: 'Warung ter-update',
      content: { 'application/json': { schema: stallDetailResponse } },
    },
    400: {
      description: 'Body/parameter tidak valid',
      content: { 'application/json': { schema: errorSchema } },
    },
    404: {
      description: 'Warung tidak ditemukan',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/stalls/{id}',
  summary: 'Hapus warung',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Warung terhapus',
      content: { 'application/json': { schema: stallDetailResponse } },
    },
    400: {
      description: 'Parameter id tidak valid',
      content: { 'application/json': { schema: errorSchema } },
    },
    404: {
      description: 'Warung tidak ditemukan',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/stalls/{id}/menus',
  summary: 'Daftar menu sebuah warung',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Daftar menu milik warung',
      content: { 'application/json': { schema: menuListResponse } },
    },
    400: {
      description: 'Parameter id tidak valid',
      content: { 'application/json': { schema: errorSchema } },
    },
    404: {
      description: 'Warung tidak ditemukan',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

// ----------------------------------------------------------------- generate
// Dokumen OpenAPI 3.0 dihasilkan IN-MEMORY (tanpa file), lalu disajikan
// swagger-ui-express di /docs — selalu sinkron dengan schema terbaru.
// =============================================================== MENU_ITEMS
const errRes = (description: string) => ({
  description,
  content: { "application/json": { schema: errorSchema } },
});

const menuItemWithStall = registry.register(
  "MenuItemWithStall",
  z.object({
    id: z.number().openapi({ example: 1 }),
    stallId: z.number().openapi({ example: 1 }),
    stallName: z.string().openapi({ example: "Warung Bu Tini" }),
    stallLocation: z.string().nullable().openapi({ example: "Kantin FKIP" }),
    name: z.string().openapi({ example: "Kwetiau Goreng Spesial" }),
    price: z.number().openapi({ example: 15000 }),
    isAvailable: z.boolean().openapi({ example: true }),
  }),
);
const menuItemInput = registry.register("MenuItemInput", createMenuItemSchema);
const menuItemUpdate = registry.register("MenuItemUpdate", updateMenuItemSchema);
const menuItemList = z.object({ status: z.literal("success"), data: z.array(menuItemWithStall) });
const menuItemDetail = z.object({ status: z.literal("success"), data: menuItemWithStall });

registry.registerPath({
  method: "get",
  path: "/api/v1/menu-items",
  tags: ["Menu Items"],
  summary: "Daftar menu (JOIN warung)",
  request: { query: menuItemQuerySchema },
  responses: {
    200: { description: "Daftar menu + nama warung", content: { "application/json": { schema: menuItemList } } },
    400: errRes("Query tidak valid"),
  },
});
registry.registerPath({
  method: "post",
  path: "/api/v1/menu-items",
  tags: ["Menu Items"],
  summary: "Tambah menu",
  request: { body: { content: { "application/json": { schema: menuItemInput } } } },
  responses: {
    201: { description: "Menu dibuat", content: { "application/json": { schema: menuItemDetail } } },
    400: errRes("Body tidak valid"),
    404: errRes("Warung tidak ditemukan"),
  },
});
registry.registerPath({
  method: "get",
  path: "/api/v1/menu-items/{id}",
  tags: ["Menu Items"],
  summary: "Detail menu (JOIN warung)",
  request: { params: menuItemIdParamSchema },
  responses: {
    200: { description: "Detail menu", content: { "application/json": { schema: menuItemDetail } } },
    404: errRes("Menu tidak ditemukan"),
  },
});
registry.registerPath({
  method: "put",
  path: "/api/v1/menu-items/{id}",
  tags: ["Menu Items"],
  summary: "Update menu",
  request: {
    params: menuItemIdParamSchema,
    body: { content: { "application/json": { schema: menuItemUpdate } } },
  },
  responses: {
    200: { description: "Menu ter-update", content: { "application/json": { schema: menuItemDetail } } },
    400: errRes("Body/parameter tidak valid"),
    404: errRes("Menu atau warung tidak ditemukan"),
  },
});
registry.registerPath({
  method: "delete",
  path: "/api/v1/menu-items/{id}",
  tags: ["Menu Items"],
  summary: "Hapus menu",
  request: { params: menuItemIdParamSchema },
  responses: {
    200: { description: "Menu terhapus", content: { "application/json": { schema: menuItemDetail } } },
    404: errRes("Menu tidak ditemukan"),
  },
});
const generator = new OpenApiGeneratorV3(registry.definitions);


export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Review Kantin API',
    version: '1.0.0',
    description:
      'Dokumentasi OpenAPI 3.0 yang dibangkitkan otomatis dari schema zod ' +
      '(@asteasolutions/zod-to-openapi) — satu sumber kebenaran untuk validasi dan dokumentasi.',
  },
  servers: [{ url: 'http://localhost:3000' }],
});
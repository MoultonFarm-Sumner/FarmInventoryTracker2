import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Product model
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fieldLocation: text("field_location").notNull(),
  currentStock: integer("current_stock").notNull().default(0),
  unit: text("unit").notNull(),
  productionNotes: text("production_notes"),
  retailNotes: text("retail_notes"),
  imageUrl: text("image_url"),
  dateAdded: timestamp("date_added").notNull().defaultNow(),
});

// Inventory history model
export const inventoryHistory = pgTable("inventory_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  previousStock: integer("previous_stock").notNull(),
  change: integer("change").notNull(),
  newStock: integer("new_stock").notNull(),
  updatedBy: text("updated_by").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Field locations table
export const fieldLocations = pgTable("field_locations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

// Product insert schema
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  dateAdded: true,
});

// Inventory History insert schema
export const insertInventoryHistorySchema = createInsertSchema(inventoryHistory).omit({
  id: true,
  timestamp: true,
});

// Field location insert schema
export const insertFieldLocationSchema = createInsertSchema(fieldLocations).omit({
  id: true,
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type InventoryHistory = typeof inventoryHistory.$inferSelect;
export type InsertInventoryHistory = z.infer<typeof insertInventoryHistorySchema>;

export type FieldLocation = typeof fieldLocations.$inferSelect;
export type InsertFieldLocation = z.infer<typeof insertFieldLocationSchema>;

// Extended schema for form validation
export const productFormSchema = insertProductSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  fieldLocation: z.string().min(1, "Field location is required"),
  currentStock: z.number().min(0, "Stock cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
});

import { pgTable, timestamp, text, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { orderItems, restaurants } from ".";
import { relations } from "drizzle-orm";

export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn((): string => { return createId() }),
  name: text("name").notNull(),
  description: text("description"),
  priceInCents: integer("price_in_cents").notNull(),
  restaurantId: text("restaurant_id").notNull().references(() => restaurants.id, {
     onDelete: "cascade" 
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const productRelations = relations(products, ({ one,many }) => ({
  restaurant: one(restaurants, {
    fields: [products.restaurantId],
    references: [restaurants.id],
    relationName: "product_restaurant"
  }),
  orderItems: many(orderItems),
}));
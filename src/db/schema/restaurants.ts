import { pgTable, timestamp, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users, products, orders } from ".";
import { relations } from "drizzle-orm";

export const restaurants = pgTable("restaurants", {
  id: text("id").primaryKey().$defaultFn((): string => { return createId() }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  managerId: text("manager_id").references(() => users.id, { 
    onDelete: 'set null',
   }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const restaurantRelations = relations(restaurants, ({ one,many }) => ({
  manager: one(users, {
    fields: [restaurants.managerId],
    references: [users.id],
    relationName: "restaurant_manager",
  }),
  products: many(products),
  orders: many(orders),
}));


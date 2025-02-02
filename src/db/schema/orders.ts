import { pgTable, timestamp, text, pgEnum, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { orderItems, restaurants, users } from ".";
import { relations } from "drizzle-orm";

export const orderStatusEnum = pgEnum("order_status", [
    "pending", 
    "processing", 
    "delivering",
    "delivered",
    "cancelled"
  ]);

export const orders = pgTable("orders", {
  id: text("id").primaryKey().$defaultFn((): string => { return createId() }),
  customerId: text("customer_id").references(() => users.id, {
    onDelete: "set null" 
  }),
  restaurantId: text("restaurant_id").notNull().references(() => restaurants.id, {
    onDelete: "cascade" 
  }),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalInCents: integer("total_in_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const orderRelations = relations(orders, ({ one,many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
    relationName: "order_customer",
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
    relationName: "order_restaurant",
  }),
  orderItems: many(orderItems),
}));
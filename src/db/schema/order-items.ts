import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { orders, products } from ".";
import { relations } from "drizzle-orm";

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey().$defaultFn((): string => { return createId() }),
  orderId: text("order_id").notNull().references(() => orders.id, {
    onDelete: "cascade" 
  }),
  productId: text("product_id").references(() => products.id, {
    onDelete: "set null" 
  }),
  quantity: integer("quantity").notNull(),
  priceInCents: integer("price_in_cents").notNull()
});

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
    relationName: "order_item_order",
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
    relationName: "order_item_product",
  }),
}));


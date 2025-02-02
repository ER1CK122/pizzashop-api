import { pgEnum, pgTable, timestamp, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { orders } from ".";
import { restaurants } from ".";

export const userRolesEnum = pgEnum("user_roles", ["manager", "customer"]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn((): string => { return createId() }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  role: userRolesEnum("role").notNull().default("customer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userRelations = relations(users, ({ many, one }) => ({
  managedRestaurants: one(restaurants, {
    fields: [users.id],
    references: [restaurants.managerId],
    relationName: "managed_restaurants",
  }),
  orders: many(orders)
}));


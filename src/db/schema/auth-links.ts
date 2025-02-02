import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from ".";
import { relations } from "drizzle-orm";

export const authLinks = pgTable("auth_links", {
  id: text("id").primaryKey().$defaultFn((): string => { return createId() }),
  code: text("code").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, {
    onDelete: "cascade"
  }),
  createdAt: timestamp("created_at").defaultNow()
});

export const authLinksRelations = relations(authLinks, ({ one }) => ({
  user: one(users, {
    fields: [authLinks.userId],
    references: [users.id],
    relationName: "auth_links_user",
  }),
}));

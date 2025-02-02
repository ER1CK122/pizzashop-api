import { Elysia, t } from "elysia";
import { auth } from "../auth";
import { db } from "../../db/connections";
import { ErrorUnauthorized } from "../errors/erro-unauthorized";
import { createSelectSchema } from "drizzle-typebox";
import { orders, users } from "../../db/schema";
import { eq, and, ilike, count, desc, sql } from "drizzle-orm";


export const getOrders = new Elysia()
.use(auth)
.get("/orders", async ({ getCurrentUser, set, query }) => {
  const { restaurantId } = await getCurrentUser();
  const { customerName, orderId, status, pageIndex } = query;

  if (!restaurantId) {
    set.status = 401;
    throw new ErrorUnauthorized();
  }

  const baseQuery = db
    .select({
      orderId: orders.id,
      customerName: users.name,
      total: orders.totalInCents,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.customerId))
    .where(
      and(
        eq(orders.restaurantId, restaurantId), 
        orderId ? ilike(orders.id, `%${orderId}%`) : undefined,
        status ? eq(orders.status, status) : undefined,
        customerName ? ilike(users.name, `%${customerName}%`) : undefined,
      )
    );

    const [amountOfOrdersQuery, allOrders] = await Promise.all ([
      db.select({count: count()}).from(baseQuery.as("baseQuery")),
      db
        .select()
        .from(baseQuery.as("baseQuery"))
        .offset(pageIndex * 10)
        .limit(10)
        .orderBy((fields) => {
          return [
            sql`CASE ${fields.status} 
              WHEN 'pending' THEN 1
              WHEN 'processing' THEN 2
              WHEN 'delivering' THEN 3
              WHEN 'delivered' THEN 4
              WHEN 'cancelled' THEN 99
            END`,
            desc(fields.createdAt),

          ]
        })
    ])

    const amountOfOrders = amountOfOrdersQuery[0].count;

    return {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: amountOfOrders,
      }
    }
},
{
  query: t.Object({

    customerName: t.Optional(t.String()),
    orderId: t.Optional(t.String()),
    status: t.Optional(createSelectSchema(orders).properties.status),
    pageIndex: t.Numeric({ minimum: 0 }),
  }),
});
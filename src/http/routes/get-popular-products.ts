import { Elysia } from "elysia";
import { auth } from "../auth";
import { db } from "../../db/connections";
import { ErrorUnauthorized } from "../errors/erro-unauthorized";
import { orderItems, orders, products } from "../../db/schema";
import { desc, eq, sum } from "drizzle-orm";

export const getPopularProducts = new Elysia()
.use(auth)
.get("/metrics/popular-products", async ({ getCurrentUser, set }) => {
  const { restaurantId } = await getCurrentUser();

  if (!restaurantId) {
    throw new ErrorUnauthorized();
  }

  const popularProducts = await db
    .select({
      productName: products.name,
      amount: sum(orderItems.quantity).mapWith(Number),
    })
    .from(orderItems)
    .leftJoin(orders, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orders.restaurantId, restaurantId))
    .groupBy(products.name)
    .orderBy((fields) => {
      return desc(fields.amount);
    })
    .limit(5);


  return popularProducts;
});
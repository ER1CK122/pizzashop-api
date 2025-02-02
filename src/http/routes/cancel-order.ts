import { Elysia, t } from "elysia";
import { auth } from "../auth";
import { ErrorUnauthorized } from "../errors/erro-unauthorized";
import { db } from "../../db/connections";
import { orders } from "../../db/schema";
import { eq } from "drizzle-orm";

export const cancelOrder = new Elysia()
.use(auth)
.patch("/orders/:orderId/cancel", async ({ getCurrentUser, params, set }) => {
  const { orderId } = params;
  const { restaurantId } = await getCurrentUser();
   

  if (!restaurantId) {
    throw new ErrorUnauthorized();
  }

  const order = await db.query.orders.findFirst({
    where: (fields, { eq, and }) => and(
      eq(fields.id, orderId),
      eq(fields.restaurantId, restaurantId),
    ),
  });

  if (!order) {
    set.status = 400;
    return {
      message: "Order not found",
    };
  }


  if (!["pending", "processing"].includes(order.status)) {
    set.status = 400;
    return {
      message: "You can only cancel orders after dispatch"
    };

  }

  await db
    .update(orders)
    .set({ status: "cancelled" })
    .where(eq(orders.id, orderId));


  return {
    message: "Order cancelled",
  };

},
{
  params: t.Object({

    orderId: t.String(),
  }),
});

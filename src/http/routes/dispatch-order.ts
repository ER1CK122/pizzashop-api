import { Elysia, t } from "elysia";
import { auth } from "../auth";
import { ErrorUnauthorized } from "../errors/erro-unauthorized";
import { db } from "../../db/connections";
import { orders } from "../../db/schema";
import { eq } from "drizzle-orm";

export const dispatchOrder = new Elysia()
.use(auth)
.patch("/orders/:orderId/dispatch", async ({ getCurrentUser, params, set }) => {
  const { orderId } = params;
  const { restaurantId } = await getCurrentUser();

   
  if (!restaurantId) {
    throw new ErrorUnauthorized();
  }

  const order = await db.query.orders.findFirst({
    where: (fields, { eq }) => eq(fields.id, orderId),
  });

  if (!order) {
    set.status = 400;
    return {
      message: "Order not found",
    };
  }


  if (order.status !== "processing") {
    set.status = 400;
    return {
      message: "You can only dispatch processing orders",
    };
  }

  await db
    .update(orders)
    .set({ status: "delivering" })
    .where(eq(orders.id, orderId));


  return {
    message: "Order dispatched",
  };

},
{
  params: t.Object({

    orderId: t.String(),
  }),
});

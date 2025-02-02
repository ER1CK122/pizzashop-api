import { Elysia, t } from "elysia";
import { auth } from "../auth";
import { ErrorUnauthorized } from "../errors/erro-unauthorized";
import { db } from "../../db/connections";
import { orders } from "../../db/schema";
import { eq } from "drizzle-orm";

export const deliverOrder = new Elysia()
.use(auth)
.patch("/orders/:orderId/deliver", async ({ getCurrentUser, params, set }) => {
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

  if (order.status !== "delivering") {
    set.status = 400;
    return {
      message: "You can only deliver orders that are being delivered",
    };
  }



  await db
    .update(orders)
    .set({ status: "delivered" })
    .where(eq(orders.id, orderId));


  return {
    message: "Order delivered",
  };

},
{
  params: t.Object({

    orderId: t.String(),
  }),
});

import { Elysia, t } from "elysia";
import { auth } from "../auth";
import { ErrorUnauthorized } from "../errors/erro-unauthorized";
import { db } from "../../db/connections";
import chalk from "chalk";


export const getOrderDetaisl = new Elysia()
.use(auth)
.get("/orders/:orderId", async ({ getCurrentUser, params, set }) => {
  const { orderId } = params;
  const { restaurantId } = await getCurrentUser();
  
  if (!restaurantId) {
    return new ErrorUnauthorized();
  }

  const order = await db.query.orders.findFirst({
    where(fields, { eq, and }) {
      return and( 
        eq(fields.id, orderId),
        eq(fields.restaurantId, restaurantId),
      )
    },
    columns: {
      id: true,
      status: true,
      totalInCents: true,
      createdAt: true,
    }
  });


  console.log(chalk.blue("order", order));

  if (!order) {
    set.status = 400;
    return {
      message: "Order not found",
    };
  }

  return order;
},
{
  params: t.Object({
    orderId: t.String(),
  }),
});
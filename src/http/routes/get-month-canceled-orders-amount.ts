import Elysia from "elysia";
import { auth } from "../auth";
import { ErrorUnauthorized } from "../errors/erro-unauthorized";
import dayjs from "dayjs";
import { db } from "../../db/connections";
import { orders } from "../../db/schema";
import { and, count, eq, gte, sql } from "drizzle-orm";


export const getMonthCanceledOrdersAmount = new Elysia()
.use(auth)
.get("/metrics/month-canceled-orders-amount", async ({ getCurrentUser }) => {
  const { restaurantId } = await getCurrentUser();

  if (!restaurantId) {
    throw new ErrorUnauthorized();
  }
  
  const today = dayjs();
  const lastMonth = today.subtract(1, "month");
  const startOfLastMonth = lastMonth.startOf("month");

  const ordersPerMonth = await db
    .select({
      monthWithYear: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM')`,
      amount: count(),
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        eq(orders.status, "cancelled"),
        gte(orders.createdAt, startOfLastMonth.toDate()),
      )

    )
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`);


    const lastMonthWithYear = lastMonth.format("YYYY-MM");
    const currentMonthWithYear = today.format("YYYY-MM");
    
    const currentMonthOrdersAmount = ordersPerMonth.find((ordersPerMonth) => {
      return  ordersPerMonth.monthWithYear === currentMonthWithYear
    });

    const lastMonthOrdersAmount = ordersPerMonth.find((ordersPerMonth) => { 
      return ordersPerMonth.monthWithYear === lastMonthWithYear
    });


    const diffFromLastMonth = currentMonthOrdersAmount && lastMonthOrdersAmount 
      ? (currentMonthOrdersAmount.amount * 100) / lastMonthOrdersAmount.amount
      : null;


    return { 
      amount: currentMonthOrdersAmount?.amount, 
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : null,
    };
});

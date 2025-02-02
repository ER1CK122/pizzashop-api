import Elysia from "elysia";
import { auth } from "../auth";
import { ErrorUnauthorized } from "../errors/erro-unauthorized";
import dayjs from "dayjs";
import { db } from "../../db/connections";
import { orders } from "../../db/schema";
import { and, eq, gte, sql, sum } from "drizzle-orm";

export const getMonthReceipt = new Elysia()
.use(auth)
.get("/metrics/month-receipt", async ({ getCurrentUser }) => {
  const { restaurantId } = await getCurrentUser();

  if (!restaurantId) {
    throw new ErrorUnauthorized();
  }
  
  const today = dayjs();
  const lastMonth = today.subtract(1, "month");
  const startOfLastMonth = lastMonth.startOf("month");

  const monthsReceipt = await db
    .select({
      monthWithYear: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM')`,
      receipt: sum(orders.totalInCents).mapWith(Number),
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, startOfLastMonth.toDate()),
      )
    )
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`)

    const lastMonthWithYear = lastMonth.format("YYYY-MM");
    const currentMonthWithYear = today.format("YYYY-MM");
  
    const currentMonthReceipt = monthsReceipt.find((monthReceipt) => {
      return  monthReceipt.monthWithYear === currentMonthWithYear
    });

    const lastMonthReceipt = monthsReceipt.find((monthReceipt) => { 
      return monthReceipt.monthWithYear === lastMonthWithYear
    });

    const diffFromLastMonth = currentMonthReceipt && lastMonthReceipt 
      ? (currentMonthReceipt.receipt * 100) / lastMonthReceipt.receipt
      : null;

    return { 
      receipt: currentMonthReceipt?.receipt, 
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : null,
  };
});

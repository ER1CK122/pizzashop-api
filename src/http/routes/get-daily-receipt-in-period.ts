import { Elysia, t } from "elysia";
import { auth } from "../auth";
import { ErrorUnauthorized } from "../errors/erro-unauthorized";
import dayjs from "dayjs";
import { orders } from "../../db/schema";
import { db } from "../../db/connections";
import { and, eq, gte, lte, sql, sum } from "drizzle-orm";
import { copyFile } from "fs";

export const getDailyReceiptInPeriod = new Elysia()
.use(auth)
.get("/metrics/daily-receipt-in-period", async ({ getCurrentUser, query, set }) => {
  const { restaurantId } = await getCurrentUser();
  const { from, to } = query;

  if (!restaurantId) {
    throw new ErrorUnauthorized();
  }
  
  const startDate = from ? dayjs(from) : dayjs().subtract(7, "days");
  const endDate = to ? dayjs(to) : from ? startDate.add(7, "days") : dayjs();

  if (endDate.diff(startDate, "day") > 7) {
    set.status = 400;

    return {
      message: "Period must be less than 7 days",
    };
  }  

  const receiptPerDay = await db
    .select({
      date: sql<string>`to_char(${orders.createdAt}, 'DD/MM')`,
      receipt: sum(orders.totalInCents).mapWith(Number),
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, startDate.startOf("day").add(startDate.utcOffset(), "minutes").toDate()),
        lte(orders.createdAt, endDate.endOf("day").add(endDate.utcOffset(), "minutes").toDate()),

      )
    )
    .groupBy(sql`to_char(${orders.createdAt}, 'DD/MM')`);
  
    const orderedReceiptPerDay = receiptPerDay.sort((a, b) => {
      const [dayA, monthA] = a.date.split("/").map(Number);
      const [dayB, monthB] = b.date.split("/").map(Number);
      
      if (monthA === monthB) {
        return dayA - dayB;
      } else {
        const dateA = new Date(2025, monthA - 1);
        const dateB = new Date(2025, monthB - 1);

        return dateA.getTime() - dateB.getTime();
      }
    });

    return receiptPerDay;
},
{
  query: t.Object({
    from: t.Optional(t.String()),
    to: t.Optional(t.String()),
  }),
});
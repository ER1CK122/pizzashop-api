import { Elysia } from "elysia";
import chalk from "chalk";

import { authenticateFromLink } from "./routes/authenticate-from-link";
import { registerRestaurant } from "./routes/register-restaurant";
import { sendAuthLink } from "./routes/send-auth-link";
import { signOut } from "./routes/sign-out";
import { getProfile } from "./routes/get-profile";
import { getManagedRestaurant } from "./routes/get-managed-restaurant";
import { getOrderDetaisl } from "./routes/get-order-details";
import { approveOrder } from "./routes/approve-order";
import { deliverOrder } from "./routes/deliver-order";
import { cancelOrder } from "./routes/cancel-order";
import { dispatchOrder } from "./routes/dispatch-order";
import { getOrders } from "./routes/get-orders";
import { getMonthReceipt } from "./routes/get-month-receipt";
import { getDayOrdersAmount } from "./routes/get-day-orders-amount";
import { getMonthOrdersAmount } from "./routes/get-month-orders-amount";
import { getMonthCanceledOrdersAmount } from "./routes/get-month-canceled-orders-amount";
import { getPopularProducts } from "./routes/get-popular-products";
import { getDailyReceiptInPeriod } from "./routes/get-daily-receipt-in-period";

const app = new Elysia()
  .use(getMonthCanceledOrdersAmount)
  .use(getDailyReceiptInPeriod)
  .use(authenticateFromLink)
  .use(getManagedRestaurant)
  .use(getMonthOrdersAmount)
  .use(getDayOrdersAmount)
  .use(getPopularProducts)
  .use(registerRestaurant)
  .use(getOrderDetaisl)
  .use(getMonthReceipt)
  .use(dispatchOrder)
  .use(deliverOrder)
  .use(sendAuthLink)
  .use(approveOrder)
  .use(cancelOrder)
  .use(getProfile)
  .use(getOrders)
  .use(signOut)
  .onError(({ error, code, set }) => {
    switch (code) {
      case "VALIDATION": {
        set.status = error.status;
    
        return error.toResponse();
      }
      case "NOT_FOUND": {
        set.status = 404;

        return {
          message: "Not found",
        };
      }
      default: {
        console.log(chalk.red("Erro não tratado"));

        console.error(error);

        
        return new Response(null, { status: 500 });
      }
    }
  })
  .listen(4444, ({ url }) => { 
    console.log(chalk.green(`🚀 Servidor HTTP iniciado em ${url}`));
  });

export type App = typeof app;
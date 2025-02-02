import { Elysia } from "elysia";
import { auth } from "../auth";
import { db } from "../../db/connections";

export const getManagedRestaurant = new Elysia()
.use(auth)
.get("/managed-restaurant", async ({ getCurrentUser, set }) => {
  const { restaurantId } = await getCurrentUser();

  if (!restaurantId) {
    set.status = 404;
    throw new Error("User is not a manager");
  }

  const managedRestaurant = await db.query.restaurants.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, restaurantId);
    },
  });

  if (!managedRestaurant) {
    set.status = 404;
    throw new Error("Restaurant not found");
  }

  return managedRestaurant;
});
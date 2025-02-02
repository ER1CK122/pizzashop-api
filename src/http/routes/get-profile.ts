import { Elysia } from "elysia";
import { auth } from "../auth";
import { db } from "../../db/connections";

export const getProfile = new Elysia()
.use(auth)
.get("/me", async ({ getCurrentUser, set }) => {
  const { userId } = await getCurrentUser();

  const user = await db.query.users.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, userId);
    },
  });
  
  if (!user) {
    set.status = 404;
    throw new Error("User not found");
  }

  return user;
});
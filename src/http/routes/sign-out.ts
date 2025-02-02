import { Elysia } from "elysia";
import { auth } from "../auth";

export const signOut = new Elysia()
.use(auth)
.post("/sign-out", async ({ signOut: internalSignOut, set }) => {
  internalSignOut();
  set.status = 204;
});

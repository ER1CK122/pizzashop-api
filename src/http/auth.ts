import {  Elysia, t, type Static } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "../env";
import { ErrorUnauthorized } from "./errors/erro-unauthorized";

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
});

export const auth = new Elysia()
.error({
  UNAUTHORIZED: ErrorUnauthorized,
})
.onError(({ error, code, set }) => {
  switch (code) {
    case "UNAUTHORIZED":
      set.status = 401;
      return { code, message: error.message };
  }
})
.use(
  jwt({
    secret: env.JWT_SECRET_KEY,
    schema: jwtPayload,
  })  
)
.derive({ as: "scoped" }, ({ jwt, cookie: { auth }, set  }) => {
  return {
    signUser: async ( payload: Static<typeof jwtPayload> ) => {
      // create the token
      const token = await jwt.sign(payload);

      // set the cookie
      auth.value = token;
      auth.httpOnly = true;
      auth.path = '/';
      auth.maxAge = 60 * 60 * 24 * 7;// 7 days
    },

    signOut: () => {
      auth.remove();
    },
    
    getCurrentUser: async () => {
      const payload = await jwt.verify(auth.value);

      console.log(payload);
      console.log(auth.value);

      if (!payload) {
        throw new ErrorUnauthorized();
      }
      
      return {
        userId: payload.sub,
        restaurantId: payload.restaurantId,
      };
    }
  }
} 
);
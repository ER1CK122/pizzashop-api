import Elysia, { t } from "elysia";
import { authLinks } from "../../db/schema";
import { db} from "../../db/connections";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { auth } from "../auth";

export const authenticateFromLink = new Elysia().use(auth).get(
  "/auth-links/authenticate",
  async ({ query, set, signUser }) => {
    const { code, redirect } = query;

    // get the auth link from the code
    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code);
      },
    })

    if (!authLinkFromCode) {
      set.status = 404;
      throw new Error("Auth link not found");
    }
    
    // check if the auth link is expired
    const daysSinceAuthLinkWasCreated = dayjs().diff(
      authLinkFromCode.createdAt,
      'days'
    );

    if (daysSinceAuthLinkWasCreated > 7) {
      set.status = 410;
      throw new Error("Auth link expired, please generate a new one");
    }

    const managerRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId);
      },
    });
  
    await signUser({
      sub: authLinkFromCode.userId,
      restaurantId: managerRestaurant?.id,
    });
    
    // delete the auth link
    await db.delete(authLinks).where(eq(authLinks.code, code));

    /*
    set.headers = {
      Location: redirect
    };
    set.status = 302;
    */
  },
  { 
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
    cookie: t.Object({
      auth: t.Optional(t.String()),
    }),
  }
);


import { Elysia, t } from "elysia";
import { db } from "../../db/connections";
import { authLinks } from "../../db/schema";
import { createId } from "@paralleldrive/cuid2";
import { env } from "../../env";
import { mail } from "../../lib/mail";
import chalk from "chalk";

export const sendAuthLink = new Elysia().post(
  "/authenticate", 
  async ({ body, set }) => {
    const { email } = body;

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email);
      },
    });

    if (!userFromEmail) {
      set.status = 404;
      throw new Error("User not found");
    }

    const authLinkCode = createId();

    await db.insert(authLinks).values({
      code: authLinkCode,
      userId: userFromEmail.id,
    });

    set.status = 204;

    
    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL);

    authLink.searchParams.set('code', authLinkCode);
    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL);

    await mail.sendMail({
      from: {
        name: "Pizza Shop",
        address: "pizzashop@example.com",
      },
      to: email,
      subject: "Link de autenticação pizza shop",
      text: "Clique no link para autenticar",
      html: `<b>Clique no link para autenticar: ${authLink.toString()}</b>`,
    });

    console.log(chalk.green("Email enviado com sucesso"));
    console.log(authLink.toString());
  }, {
    body: t.Object({
      email: t.String(),
    }),
  }
);
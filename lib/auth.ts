import * as schema from "../drizzle/db/schema";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../drizzle/db";
import { admin, organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { getRestaurantsByUser } from "./actions/restaurant";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  experimental: { joins: true },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session): Promise<{ data: typeof session & { activeOrganizationId: string | null } }> => {
          const organizations = await getRestaurantsByUser(session.userId);
          const activeOrganizationId =
            Array.isArray(organizations) && organizations[0]?.id ? organizations[0].id : null;
          return {
            data: {
              ...session,
              activeOrganizationId,
            },
          };
        },
      },
    },
  },
  plugins: [
    admin(),
    organization(),
    nextCookies(), // make sure this is the last plugin in the array
  ],
});

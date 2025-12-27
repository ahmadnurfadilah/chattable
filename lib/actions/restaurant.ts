"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import slugify from "slugify";

export async function createRestaurant(values: { name: string; description: string }) {
  const data = await auth.api.createOrganization({
    body: {
      name: values.name,
      slug: slugify(values.name).toLowerCase() + "-" + Math.random().toString(36).substring(2, 8),
      logo: undefined,
    },
    headers: await headers(),
  });

  return data;
}

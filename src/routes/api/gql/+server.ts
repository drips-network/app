import type { RequestEvent, RequestHandler } from "./$types";
import { GQL_ACCESS_TOKEN, GQL_URL } from "$env/static/private";

// Proxies requests to the Drips GraphQL API, adding the Authorization header.
export const POST: RequestHandler = async ({ request }: RequestEvent) => {
  const body = await request.text();

  return await fetch(GQL_URL, {
    method: "POST",
    headers: [
      ["Authorization", `Bearer ${GQL_ACCESS_TOKEN}`],
      ["Content-Type", "application/json"],
    ],
    body,
  })
};

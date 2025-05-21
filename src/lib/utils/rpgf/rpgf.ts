import { browser } from "$app/environment";
import { get } from "svelte/store";
import getOptionalEnvVar from "../get-optional-env-var/public"
import stripTrailingSlash from "../strip-trailing-slash";
import { rpgfJwtStore } from "./siwe";
import { createRoundDraftDtoSchema } from "./schemas";

const rpgfApiUrl = getOptionalEnvVar('PUBLIC_DRIPS_RPGF_URL', true, 'RPGF functionality doesnt work.');
const rpgfInternalApiUrl = getOptionalEnvVar('PUBLIC_INTERNAL_DRIPS_RPGF_URL', true, 'RPGF functionality doesnt work.');

export async function rpgfServerCall(
  path: string,
  method: string = 'GET',
  body: unknown = null,
  f = fetch,
) {
  if (!rpgfApiUrl || !rpgfInternalApiUrl) {
    throw new Error('Required environment variables are not set');
  }

  const baseUrl = stripTrailingSlash(browser ? rpgfApiUrl : rpgfInternalApiUrl);

  const jwt = get(rpgfJwtStore);

  const res = await f(`${baseUrl}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'credentials': 'include',
      'Authorization': jwt ? `Bearer ${jwt}` : '',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    rpgfJwtStore.set(null);
  }

  return res;
}

export async function getDrafts(f = fetch) {
  const res = await rpgfServerCall('/round-drafts', 'GET', undefined, f);

  if (res.status === 200) {
    const parsed = createRoundDraftDtoSchema.array().parse(await res.json());
    return parsed;
  }

  return null;
}

export async function getDraft(f = fetch, id: string) {
  const res = await rpgfServerCall(`/round-drafts/${id}`, 'GET', undefined, f);

  if (res.status === 200) {
    const parsed = createRoundDraftDtoSchema.parse(await res.json());
    return parsed;
  }

  return null;
}

import z from 'zod';
import { error } from '@sveltejs/kit';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private.js';

const INTERCOM_ACCESS_TOKEN = getOptionalEnvVar(
  'INTERCOM_ACCESS_TOKEN',
  false,
  'Wave Campaign Lead Form will not work.',
);

export const POST = async ({ request }) => {
  const data = await request.json();

  const parsed = z
    .object({
      email: z.string().email(),
      gitHubUsername: z.string(),
      discordUsername: z.string(),
      marketingConsent: z.boolean(),
    })
    .safeParse(data);

  if (!parsed.success) {
    return new Response(JSON.stringify({ errors: parsed.error }), { status: 400 });
  }

  if (!INTERCOM_ACCESS_TOKEN) {
    return error(500, 'INTERCOM_ACCESS_TOKEN env var is required.');
  }

  try {
    // Prepare the lead data
    const leadData = {
      email: parsed.data.email,
      role: 'lead',
      custom_attributes: {
        ['GitHub Handle']: parsed.data.gitHubUsername,
        ['Discord Username']: parsed.data.discordUsername,
        ['Marketing Opt-In']: parsed.data.marketingConsent,
      },
    };

    // Send the lead data to Intercom
    const response = await fetch('https://api.eu.intercom.io/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${INTERCOM_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });
    if (!response.ok) {
      const errorBody = await response.text();

      try {
        const asJson = JSON.parse(errorBody);

        if (
          'errors' in asJson &&
          Array.isArray(asJson.errors) &&
          'code' in asJson.errors[0] &&
          asJson.errors[0].code === 'conflict'
        ) {
          // Lead already exists, we can ignore this error
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
      } catch {
        // Ignore JSON parse errors
      }

      // eslint-disable-next-line no-console
      console.error('Intercom API error:', errorBody);
      return error(500, 'Failed to save lead to Intercom.');
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error saving lead to Intercom:', err);
    return error(500, 'An unexpected error occurred.');
  }
};

import { getNotificationPreferences } from '$lib/utils/wave/notifications.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ fetch, parent, url, depends }) => {
  depends('wave:user:notifications-preferences');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const preferences = (await getNotificationPreferences(fetch)).preferences;

  return {
    preferences,
  };
};

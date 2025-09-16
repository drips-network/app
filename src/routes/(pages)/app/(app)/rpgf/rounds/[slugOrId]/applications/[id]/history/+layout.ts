import { getApplicationHistory } from '$lib/utils/rpgf/rpgf';

export const load = async ({ parent, fetch }) => {
  const { application, round } = await parent();

  const history = await getApplicationHistory(fetch, round.id, application.id);

  return {
    history,
  };
};

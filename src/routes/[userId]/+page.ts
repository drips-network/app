import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = ({ params }) => {
  throw redirect(308, `/app/${params.userId}`);
};

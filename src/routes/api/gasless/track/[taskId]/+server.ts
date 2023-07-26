import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const taskStatus = await fetch(`https://api.gelato.digital/tasks/status/${params.taskId}`);

  return new Response(await taskStatus.text());
};

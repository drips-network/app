export const GET = async () => {
  // simple ping endpoint for downtime-less deploys. railway will hit this and wait for 200
  // before directing traffic to a newly built container

  return new Response('OK');
};

import manifest from './manifest.json';

export const GET = async () => {
  return new Response(JSON.stringify(manifest), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  });
};

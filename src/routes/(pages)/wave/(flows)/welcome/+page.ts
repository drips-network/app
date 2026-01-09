export const load = async ({ url }) => {
  const backTo = url.searchParams.get('backTo') || '/wave';
  const decoded = decodeURIComponent(backTo || '');

  return {
    backTo: decoded,
  };
};

import { getOwnRepos } from '$lib/utils/wave/orgs';
import { getAllPaginated } from '$lib/utils/wave/getAllPaginated';
import { getKycStatus } from '$lib/utils/wave/kyc.js';

export const load = async ({ fetch }) => {
  const [ownRepos, kycStatus] = await Promise.all([
    getAllPaginated((page, limit, cursor) => getOwnRepos(fetch, { page, limit, cursor })),
    getKycStatus(fetch),
  ]);

  const isKycVerified =
    kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'GREEN';

  return {
    ownRepos,
    isKycVerified,
  };
};

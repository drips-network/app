import { getOwnRepos } from '$lib/utils/wave/orgs';
import { getAllPaginated } from '$lib/utils/wave/getAllPaginated';
import { getKycStatus } from '$lib/utils/wave/kyc.js';

export const load = async ({ fetch }) => {
  const [ownRepos, kycStatus] = await Promise.all([
    getAllPaginated((page, limit) => getOwnRepos(fetch, { page, limit })),
    getKycStatus(fetch),
  ]);

  const isKycVerified =
    kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'GREEN';

  return {
    ownRepos,
    isKycVerified,
  };
};

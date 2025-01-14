import type { DefaultExplorePageFeaturedProjectFragment } from './__generated__/gql.generated';
import filterCurrentChainData from '../../../../../lib/utils/filter-current-chain-data';
import isClaimed from '../../../../../lib/utils/project/is-claimed';

// This would be a great utility, but so far we rely on the generated DefaultExplorePageFeaturedProjectFragment
// type, so I'm keeping it near the type's generation.
export default function getProjectColor(project: DefaultExplorePageFeaturedProjectFragment) {
  const chainData = filterCurrentChainData(project.chainData);

  if (!isClaimed(chainData)) {
    return;
  }

  return chainData.color;
}

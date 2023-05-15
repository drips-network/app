import type { ListItem } from '../list-editor.svelte';

const unclaimedHeader: ListItem = {
  type: 'interstitial',
  label: 'Unclaimed projects',
  // TODO: "Learn More" link once docs are there
  description:
    'Projects below have 100 days to claim funds before they start streaming to a community-owned fund for FOSS development.',
};

export default unclaimedHeader;

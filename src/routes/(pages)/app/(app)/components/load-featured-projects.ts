import type { SUPPORTED_CHAIN_IDS, ValueForEachSupportedChain } from "$lib/stores/wallet/network";
import type { fetchProjects } from "./load-projects";

type FeaturedProjectConfig = {
  featuredProjectIds: string[];
};

const FEATURED_PROJECTS: ValueForEachSupportedChain<FeaturedProjectConfig> = {
  1: {
    featuredProjectIds: [
      '80927338512810702724070905882237017022089417038277884279346528518144', // svelte
      '80924437970685862336445237697146051810361983738382071874368862945280', // libgit2
      '80926915932044874567662239576164593128211047641556385561345492254720', // rollup
      '80926893484859255783823398448697429050946431358357802763937929756672', // ratatui
      '80907185984472938178947231143934051564334108789056821384881454972928', // gitoxide
      '80914552162673449833728329632154702021826817315592132431697405804544', // tanstack-query
      '80928551845018914533911124940323675679718022636490642073491274203136', // vitest
      '80928956680761126169933069488824219882230509123653596947248123478016', // websockets
    ],
  },
  80002: { featuredProjectIds :[] },
  11155420: { featuredProjectIds :[] },
  11155111: { featuredProjectIds :[] },
  31337: { featuredProjectIds :[] },
  84532: { featuredProjectIds :[] },
  314: {
    featuredProjectIds :[]
  },
  1088: {
    featuredProjectIds: []
  },
  10: {
    featuredProjectIds: []
  },
} as const;

export default async function fetchFeaturedProjects(
  chainId: (typeof SUPPORTED_CHAIN_IDS)[number],
  library: ReturnType<typeof fetchProjects>[]
) {
  // console.log('TODO')
}
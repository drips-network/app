import { redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import * as ecosystemsApi from '$lib/utils/ecosystems';
// import osoJson from '$lib/utils/csv-to-graph/__test__/data/fabricated-graph-corrected-19032025.json';

// const chicken = {
//   "name": "Ethereum Ecosystem (PR 53)",
//   "description": "Vital projects for Ethereum, based on OSS node implementations.",
//   "chainId": "31337",
//   "ownerAccountId": "1295444165478540595942340304482567097034602638723",
//   "ownerAddress": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
//   "avatar": {
//     "type": "emoji",
//     "emoji": "👽"
//   },
//   "color": "#27C537",
//   "metadata": [{
//       "icon": "Recipients",
//       "title": "MIT Licensed",
//       "text": "327",
//       "link": {
//         "href": "https://maps.app.goo.gl/cQFc5uDp1g1NQh488",
//         "label": "Castro Monte Mozinho"
//       }
//   }, {
//     "icon": "Wallet",
//     "title": "Source",
//     "text": "Based on data from",
//     "link": {
//         "href": "https://www.opensource.observer/",
//         "label": "Open Source Observer"
//     }
//   }, {
//     "icon": "Download",
//     "title": "Culinary Relations",
//     "link": {
//         "href": "https://maps.app.goo.gl/5PmHWtBCAjguoatB7",
//         "label": "Casa Da Viuva"
//     }
//   }, {
//     "icon": "Coin",
//     "title": "Fun Fact",
//     "text": "Dijkstra was apparently a huge a-hole.",
//     "link": {
//       "href": "https://drips.network",
//       "label": "Drips"
//     }
//   }],
//   "graph": osoJson
// }

export const load = async () => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    redirect(307, buildUrl('/app/connect', { backTo: '/app/ecosystems' }));
  }

  const ecosystems = await ecosystemsApi.getAll();
  // console.log(chicken)
  // if (ecosystems.length < 6) {
  //   console.log('Creating a chicken')
  //   const eco = await ecosystemsApi.create(chicken);
  //   ecosystems = await ecosystemsApi.getAll();
  // }

  // console.log(ecosystems);

  return { ecosystems };
};

export const ssr = false;

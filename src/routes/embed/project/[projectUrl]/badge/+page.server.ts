// import type { RequestHandler } from './$types';
// import DripsBadge from './drips-badge';
// import GithubBadge from './github-badge';

import { BadgeBackground, BadgeStat, BadgeStyle, BadgeText, type BadgeData, type BadgeOptions } from "./badge.js"


// import assert from '$lib/utils/assert';
// import { error } from '@sveltejs/kit';
// import loadImage from '../../loadImage';
// import getContrastColor from '$lib/utils/get-contrast-text-color';
// import satori from 'satori';
// import { html as toReactElement } from 'satori-html';
// import loadFonts from '../../loadFonts';
// import { Resvg } from '@resvg/resvg-js';
// import getBackgroundImage from '../../getBackgroundImage';
// import { gql } from 'graphql-request';
// import query from '$lib/graphql/dripsQL';
// import isClaimed from '$lib/utils/project/is-claimed';
// import type { ProjectQuery, ProjectQueryVariables } from './__generated__/gql.generated';
// import sanitize from 'sanitize-html';
// import twemoji from '$lib/utils/twemoji';
// import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
// import network from '$lib/stores/wallet/network';

export async function load({ params }): Promise<{
	badgeData: BadgeData,
	badgeOptions: BadgeOptions
}> {
	return {
		badgeData: {
			support: 12456,
			dependencies: 15,
			projectName: 'cached_resource',
			projectImageUrl: 'http://localhost:5173/api/blockies/0xe2E9b9B5d0757c26aB477A754788B19b60f2ed83'
		},
		badgeOptions: {
			style: BadgeStyle.drips,
			text: BadgeText.project,
			background: BadgeBackground.light,
			stat: BadgeStat.support,
		}
	}
}

// export const GET: RequestHandler = async ({ url, fetch, params }) => {
//   const renderedComponent = DripsBadge.render({
//     background: 'cool',
//     text: 'mcdonalds',
//     stat: 'micro!'
//   })

//   const element = toReactElement(renderedComponent.html)

//   const svg = await satori(element, {
//     height: 32,
//     width: 172,
//     fonts: await loadFonts(fetch),
//   })

//   const resvg = new Resvg(svg, {
//     fitTo: {
//       mode: 'width',
//       value: 1200,
//     },
//   });

//   const image = resvg.render().asPng();

//   return new Response(image, {
//     headers: {
//       'content-type': 'image/png',
//       'cache-control': 'public, max-age=86400', // 24 hours
//     },
//   });
// }

// embeds/project/whatever.com?background=light&buttonText=me&style=drips&stat=dependencies

// export const GET: RequestHandler = async ({ url, fetch, params }) => {
//   const { projectUrl } = params;
//   assert(projectUrl, 'Missing projectUrl param');

//   const projectQuery = gql`
//     query Project($url: String!, $chains: [SupportedChain!]) {
//       projectByUrl(url: $url, chains: $chains) {
//         source {
//           ownerName
//           repoName
//         }
//         chainData {
//           ... on UnClaimedProjectData {
//             chain
//           }
//           ... on ClaimedProjectData {
//             chain
//             avatar {
//               ... on ImageAvatar {
//                 cid
//               }
//               ... on EmojiAvatar {
//                 emoji
//               }
//             }
//             color
//             splits {
//               dependencies {
//                 __typename
//               }
//             }
//           }
//         }
//       }
//     }
//   `;

//   const res = await query<ProjectQuery, ProjectQueryVariables>(
//     projectQuery,
//     { url: projectUrl, chains: [network.gqlName] },
//     fetch,
//   );
//   const { projectByUrl: project } = res;
//   try {
//     assert(project);
//   } catch {
//     error(404);
//   }

//   const projectName = `${project.source.ownerName}/${project.source.repoName}`;

//   const projectData = filterCurrentChainData(project.chainData);

//   const emoji =
//     isClaimed(projectData) && projectData.avatar.__typename === 'EmojiAvatar'
//       ? sanitize(projectData.avatar.emoji, {
//           allowedTags: [],
//           allowedAttributes: {},
//         })
//       : 'none';

//   const cid =
//     isClaimed(projectData) && projectData.avatar.__typename === 'ImageAvatar'
//       ? projectData.avatar.cid
//       : 'none';

//   const dependenciesCount = isClaimed(projectData)
//     ? projectData.splits.dependencies.length.toString()
//     : '0';

//   const color = isClaimed(projectData) ? projectData.color : 'none';
//   const target = url.searchParams.get('target');

//   try {
//     assert(target === 'twitter' || target === 'og');
//   } catch {
//     error(400, 'Invalid or missing query params');
//   }

//   const height = target === 'twitter' ? 600 : 675;

//   const bgColor = color === 'none' ? '#5555FF' : color;
//   const contrastColor = getContrastColor(bgColor);

//   const bgTheme = contrastColor === 'black' ? 'dark' : 'light';
//   const boxIconDataURI = await loadImage(`/assets/share/box-${bgTheme}.png`, fetch);

//   const textColor = contrastColor === 'black' ? '#333333' : '#FFFFFF';

//   const dependenciesString = dependenciesCount === '1' ? 'Dependency' : 'Dependencies';

//   const twemojiElem = (emoji !== 'none' && twemoji(emoji)) ?? undefined;
//   const twemojiSrc = (twemojiElem && /src\s*=\s*"(.+?)"/g.exec(twemojiElem)?.[1]) ?? undefined;

//   const twemojiImg = twemojiSrc && (await (await fetch(twemojiSrc)).text());

//   const resizedTwemojImg =
//     typeof twemojiImg === 'string'
//       ? twemojiImg.replace('<svg', '<svg height="60%" width="60%"')
//       : '';

//   const avatarHtml =
//     isClaimed(projectData) && projectData.avatar.__typename === 'ImageAvatar'
//       ? `<div style="display: flex; align-items: center; justify-content: center; height: 128px; width: 128px; border-radius: 64px; background-color: white; ">
//         <img height="100%" width="100%" src="https://drips.network/api/custom-avatars/${cid}" style="border-radius: 50%; border: 1px solid black" />
//       </div>`
//       : `<div style="display: flex; align-items: center; justify-content: center; height: 128px; width: 128px; border-radius: 64px; background-color: white;">
//           ${resizedTwemojImg}
//         </div>`;

//   const svg = await satori(
//     toReactElement(`<div style="display: flex; background-color: ${bgColor}">
//       ${getBackgroundImage(bgColor, textColor, target)}
//       <div style="position: absolute; bottom: 40px; left: 40px; right: 200px; display: flex; flex-direction: column; color: ${textColor}; gap: 24px;">
//         <span style="font-family: Inter; font-size: 40px">Project</span>
//         <div style="display: flex; gap: 32px;">
//         ${avatarHtml}
//           <span style="font-family: Redaction; width: 1000px; font-size: 90px; display: block; line-clamp: 2;">${projectName}</span>
//         </div>
//         <div style="display: flex; gap: 24px; align-items: center; opacity: ${
//           dependenciesCount === '0' ? '0' : '1'
//         }">
//           <img src="${boxIconDataURI}" height="64px" width="64px" />
//           <span style="font-family: Inter; font-size: 40px">${dependenciesCount} ${dependenciesString}</span>
//         </div>
//       </div>
//     </div>`),
//     {
//       width: 1200,
//       height: height,
//       fonts: await loadFonts(fetch),
//     },
//   );

//   const resvg = new Resvg(svg, {
//     fitTo: {
//       mode: 'width',
//       value: 1200,
//     },
//   });

//   const image = resvg.render();

//   return new Response(image.asPng(), {
//     headers: {
//       'content-type': 'image/png',
//       'cache-control': 'public, max-age=86400', // 24 hours
//     },
//   });
// };

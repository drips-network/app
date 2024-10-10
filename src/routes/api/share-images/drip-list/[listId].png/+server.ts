import type { RequestHandler } from './$types';
import assert from '$lib/utils/assert';
import { error } from '@sveltejs/kit';
import loadImage from '../../loadImage';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { html as toReactElement } from 'satori-html';
import loadFonts from '../../loadFonts';
import getBackgroundImage from '../../getBackgroundImage';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';
import * as multiplayer from '$lib/utils/multiplayer';
import twemoji from '$lib/utils/twemoji';
import network from '$lib/stores/wallet/network';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
  const listId = params.listId;
  assert(listId, 'Missing listId param');

  let listName: string;
  let recipientsCount: string | undefined = undefined;

  if (multiplayer.isVotingRoundId(listId)) {
    const votingRound = await multiplayer.getVotingRound(listId, fetch);

    try {
      assert(votingRound);
      listName = votingRound.name;
    } catch {
      error(404);
    }
  } else {
    const dripListQuery = gql`
      query DripList($listId: ID!, $chain: SupportedChain!) {
        dripList(id: $listId, chain: $chain) {
          name
          splits {
            __typename
          }
        }
      }
    `;

    const res = await query<DripListQuery, DripListQueryVariables>(
      dripListQuery,
      { listId, chain: network.gqlName },
      fetch,
    );
    const { dripList } = res;

    try {
      assert(dripList);
      listName = dripList.name;
      recipientsCount = dripList.splits.length.toString();
    } catch {
      error(404);
    }
  }

  const target = url.searchParams.get('target');

  try {
    assert(target === 'twitter' || target === 'og');
  } catch {
    error(400, 'Invalid or missing target param');
  }

  const height = target === 'twitter' ? 600 : 675;

  const dripListIconDataURI = await loadImage('/assets/share/dripList.png', fetch);

  const recipientsString = recipientsCount === '1' ? 'Recipient' : 'Recipients';

  const svg = await satori(
    toReactElement(`<div style="display: flex; background-color: #5555FF;">
      ${getBackgroundImage('#5555FF', 'white', target)}
      <div style="position: absolute; bottom: 40px; left: 40px; right: 200px; display: flex; flex-direction: column; color: white; gap: 24px;">
         <span style="font-family: Inter; font-size: 40px">Drip List</span>
         <span style="font-family: Redaction; font-size: 90px; display: block; line-clamp: 2;">${listName}</span>
         <div style="display: flex; gap: 24px; align-items: center">
         ${
           recipientsCount
             ? `
              <img src="${dripListIconDataURI}" height="64px" width="64px" />
              <span style="font-family: Inter; font-size: 40px">${recipientsCount} ${recipientsString}</span>`
             : ''
         }
         </div>
       </div>
    </div>`),
    {
      width: 1200,
      height: height,
      fonts: await loadFonts(fetch),
      loadAdditionalAsset: async (code, segment) => {
        if (code !== 'emoji') return '';

        const parsed = twemoji(segment);

        // eww!
        const twemojiUrl = /<img[^>]+src="(http:\/\/[^">]+)"/g.exec(parsed);

        if (twemojiUrl) {
          const res = await loadImage(twemojiUrl[1], fetch, 'data:image/svg+xml;base64,');
          return res;
        }

        return '';
      },
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const image = resvg.render();

  return new Response(image.asPng(), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=86400', // 24 hours
    },
  });
};

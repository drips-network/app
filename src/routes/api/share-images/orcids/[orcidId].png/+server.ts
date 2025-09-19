import type { RequestHandler } from './$types';
import assert from '$lib/utils/assert';
import { error } from '@sveltejs/kit';
import loadImage from '../../loadImage';
import satori from 'satori';
import { html as toReactElement } from 'satori-html';
import loadFonts from '../../loadFonts';
import { Resvg } from '@resvg/resvg-js';
import getBackgroundImage from '../../getBackgroundImage';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type { OrcidQuery, OrcidQueryVariables } from './__generated__/gql.generated';
import network from '$lib/stores/wallet/network';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
  const { orcidId } = params;
  assert(orcidId, 'Missing orcidId param');

  const projectQuery = gql`
    query Orcid($orcid: String!, $chain: SupportedChain!) {
      orcidLinkedIdentityByOrcid(orcid: $orcid, chain: $chain) {
        chain
        areSplitsValid
        isClaimed
        support {
          __typename
        }
      }
    }
  `;

  const res = await query<OrcidQuery, OrcidQueryVariables>(
    projectQuery,
    { orcid: orcidId, chain: network.gqlName },
    fetch,
  );

  const { orcidLinkedIdentityByOrcid: orcidAccount } = res;
  try {
    assert(orcidAccount);
  } catch {
    error(404);
  }

  const orcidName = `Unknown`;
  const supportersCount = orcidAccount.support.length;

  const target = url.searchParams.get('target');
  try {
    assert(target === 'twitter' || target === 'og');
  } catch {
    error(400, 'Invalid or missing query params');
  }
  const height = target === 'twitter' ? 600 : 675;

  const [orcidDataURI, heartDataURI] = await Promise.all([
    loadImage(`/assets/share/orcid.png`, fetch),
    loadImage(`/assets/share/heart.png`, fetch),
  ]);

  const bgColor = 'rgba(85, 85, 255, 1)';
  const textColor = '#FFFFFF';

  const supportersString = supportersCount === 0 ? 'Support' : 'Supporters';

  const svg = await satori(
    toReactElement(`<div style="display: flex; background-color: ${bgColor}">
      ${getBackgroundImage(bgColor, textColor, target)}
      <div style="position: absolute; bottom: 40px; left: 40px; right: 200px; display: flex; flex-direction: column; color: ${textColor}; gap: 24px;">
        <span style="font-family: Inter; font-size: 40px">ORCID iD</span>
        <div style="display: flex; gap: 32px;">
          <span style="font-family: Redaction; width: 1000px; font-size: 90px; display: block; line-clamp: 2;">${orcidName}</span>
        </div>
        <div style="display: flex; gap: 24px; align-items: center; opacity: ${
          supportersCount === 0 ? '0' : '1'
        }">
          <img src="${orcidDataURI}" height="64px" width="64px" />
          <span style="font-family: Inter; font-size: 40px">${orcidId}</span>
          <img src="${heartDataURI}" height="64px" width="64px" />
          <span style="font-family: Inter; font-size: 40px">${supportersCount} ${supportersString}</span>
        </div>
      </div>
    </div>`),
    {
      width: 1200,
      height: height,
      fonts: await loadFonts(fetch),
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const image = resvg.render();

  return new Response(new Uint8Array(image.asPng()), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=86400', // 24 hours
    },
  });
};

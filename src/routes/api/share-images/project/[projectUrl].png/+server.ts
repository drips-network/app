import type { RequestHandler } from './$types';
import assert from '$lib/utils/assert';
import { error } from '@sveltejs/kit';
import loadImage from '../../loadImage';
import getContrastColor from '$lib/utils/get-contrast-text-color';
import satori from 'satori';
import { html as toReactElement } from 'satori-html';
import loadFonts from '../../loadFonts';
import { Resvg } from '@resvg/resvg-js';
import getBackgroundImage from '../../getBackgroundImage';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import isClaimed from '$lib/utils/project/is-claimed';
import type { ProjectQuery, ProjectQueryVariables } from './__generated__/gql.generated';
import sanitize from 'sanitize-html';
import twemoji from '$lib/utils/twemoji';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
  const { projectUrl } = params;
  assert(projectUrl, 'Missing projectUrl param');

  const projectQuery = gql`
    query Project($url: String!) {
      projectByUrl(url: $url) {
        ... on ClaimedProject {
          source {
            ownerName
            repoName
          }
          avatar {
            ... on ImageAvatar {
              cid
            }
            ... on EmojiAvatar {
              emoji
            }
          }
          color
          splits {
            dependencies {
              __typename
            }
          }
        }
        ... on UnclaimedProject {
          source {
            ownerName
            repoName
          }
        }
      }
    }
  `;

  const res = await query<ProjectQuery, ProjectQueryVariables>(
    projectQuery,
    { url: projectUrl },
    fetch,
  );
  const { projectByUrl: project } = res;
  try {
    assert(project);
  } catch {
    throw error(404);
  }

  const projectName = `${project.source.ownerName}/${project.source.repoName}`;

  const emoji =
    isClaimed(project) && project.avatar.__typename === 'EmojiAvatar'
      ? sanitize(project.avatar.emoji, {
          allowedTags: [],
          allowedAttributes: {},
        })
      : 'none';

  const cid =
    isClaimed(project) && project.avatar.__typename === 'ImageAvatar' ? project.avatar.cid : 'none';

  const dependenciesCount = isClaimed(project)
    ? project.splits.dependencies.length.toString()
    : '0';

  const color = isClaimed(project) ? project.color : 'none';
  const target = url.searchParams.get('target');

  try {
    assert(target === 'twitter' || target === 'og');
  } catch (e) {
    throw error(400, 'Invalid or missing query params');
  }

  const height = target === 'twitter' ? 600 : 675;

  const bgColor = color === 'none' ? '#5555FF' : color;
  const contrastColor = getContrastColor(bgColor);

  const bgTheme = contrastColor === 'black' ? 'dark' : 'light';
  const boxIconDataURI = await loadImage(`/assets/share/box-${bgTheme}.png`, fetch);

  const textColor = contrastColor === 'black' ? '#333333' : '#FFFFFF';

  const dependenciesString = dependenciesCount === '1' ? 'Dependency' : 'Dependencies';

  const twemojiElem = (emoji !== 'none' && twemoji(emoji)) ?? undefined;
  const twemojiSrc = (twemojiElem && /src\s*=\s*"(.+?)"/g.exec(twemojiElem)?.[1]) ?? undefined;

  const twemojiImg = twemojiSrc && (await (await fetch(twemojiSrc)).text());

  const resizedTwemojImg =
    typeof twemojiImg === 'string'
      ? twemojiImg.replace('<svg', '<svg height="60%" width="60%"')
      : '';

  const avatarHtml =
    isClaimed(project) && project.avatar.__typename === 'ImageAvatar'
      ? `<div style="display: flex; align-items: center; justify-content: center; height: 128px; width: 128px; border-radius: 64px; background-color: white; ">
        <img height="100%" width="100%" src="https://drips.network/api/custom-avatars/${cid}" style="border-radius: 50%; border: 1px solid black" />
      </div>`
      : `<div style="display: flex; align-items: center; justify-content: center; height: 128px; width: 128px; border-radius: 64px; background-color: white;">
          ${resizedTwemojImg}
        </div>`;

  const svg = await satori(
    toReactElement(`<div style="display: flex; background-color: ${bgColor}">
      ${getBackgroundImage(bgColor, textColor, target)}
      <div style="position: absolute; bottom: 40px; left: 40px; right: 200px; display: flex; flex-direction: column; color: ${textColor}; gap: 24px;">
        <span style="font-family: Inter; font-size: 40px">Project</span>
        <div style="display: flex; gap: 32px;">
        ${avatarHtml}
          <span style="font-family: Redaction; width: 1000px; font-size: 90px; display: block; line-clamp: 2;">${projectName}</span>
        </div>
        <div style="display: flex; gap: 24px; align-items: center; opacity: ${
          dependenciesCount === '0' ? '0' : '1'
        }">
          <img src="${boxIconDataURI}" height="64px" width="64px" />
          <span style="font-family: Inter; font-size: 40px">${dependenciesCount} ${dependenciesString}</span>
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

  return new Response(image.asPng(), {
    headers: {
      'content-type': 'image/png',
    },
  });
};

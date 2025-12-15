import emoji from '$lib/utils/emoji/emoji.js';
import possibleColors from '$lib/utils/project/possible-colors.js';
import twemoji from '$lib/utils/twemoji.js';
import { error } from '@sveltejs/kit';

export const load = async ({ url }) => {
  const bgColorParam = `#${url.searchParams.get('bgColor')}`;
  const emojiParam = url.searchParams.get('emoji');

  if (!emoji.find((e) => e.unicode === emojiParam)) {
    throw error(404, 'Unknown emoji');
  }

  if (![...possibleColors, '#FFFFFF'].includes(bgColorParam ?? '')) {
    throw error(404, 'Unknown bgColor');
  }

  const rendered = twemoji(emojiParam || '😀');

  return {
    emoji: rendered,
    bgColor: bgColorParam,
  };
};

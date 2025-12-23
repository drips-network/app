export enum RenderTarget {
  OG,
  TWITTER,
}

export const DIMENSIONS: Record<RenderTarget, { width: number; height: number }> = {
  [RenderTarget.OG]: { width: 1200, height: 630 },
  [RenderTarget.TWITTER]: { width: 1200, height: 675 },
};

export enum ShareImageType {
  WAVE_PROGRAM = 'wave-program',
  PROJECT = 'project',
  DRIP_LIST = 'drip-list',
  ECOSYSTEM = 'ecosystem',
  ORCID = 'orcid',
  RPGF_ROUND = 'rpgf-round',
  STREAM = 'stream',
}

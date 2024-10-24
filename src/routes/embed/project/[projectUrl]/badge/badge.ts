import type { ProjectAvatarFragment } from '$lib/components/project-avatar/__generated__/gql.generated';

export enum BadgeStyle {
  github = 'github',
  drips = 'drips',
}

export enum BadgeText {
  project = 'project',
  me = 'me',
  us = 'us',
}

export enum BadgeBackground {
  dark = 'dark',
  light = 'light',
  blue = 'blue',
}

export enum BadgeStat {
  support = 'support',
  dependencies = 'dependencies',
  none = 'none',
}

export type BadgeOptions = {
  style: BadgeStyle;
  text: BadgeText;
  background: BadgeBackground;
  stat: BadgeStat;
};

export type BadgeData = {
  support?: number;
  dependencies?: string;
  projectName?: string;
  projectAvatar: ProjectAvatarFragment;
};

import type { ProjectAvatarFragment } from '$lib/components/project-avatar/__generated__/gql.generated';

export enum BadgeStyle {
  github = 'github',
  drips = 'drips',
  default = drips
}

export enum BadgeText {
  project = 'project',
  me = 'me',
  us = 'us',
  default = me
}

export enum BadgeBackground {
  dark = 'dark',
  light = 'light',
  blue = 'blue',
  default = light
}

export enum BadgeStat {
  support = 'support',
  dependencies = 'dependencies',
  none = 'none',
  default = none
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

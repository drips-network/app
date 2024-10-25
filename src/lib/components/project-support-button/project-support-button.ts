import type { ProjectAvatarFragment } from '$lib/components/project-avatar/__generated__/gql.generated';

export enum SupportButtonStyle {
  github = 'github',
  drips = 'drips',
  default = drips,
}

export enum SupportButtonText {
  project = 'project',
  me = 'me',
  us = 'us',
  default = me,
}

export enum SupportButtonBackground {
  dark = 'dark',
  light = 'light',
  blue = 'blue',
  default = light,
}

export enum SupportButtonStat {
  support = 'support',
  dependencies = 'dependencies',
  none = 'none',
  default = none,
}

export type SupportButtonOptions = {
  style: SupportButtonStyle;
  text: SupportButtonText;
  background: SupportButtonBackground;
  stat: SupportButtonStat;
};

export type SupportButtonData = {
  support?: number;
  dependencies?: string;
  projectName?: string;
  projectAvatar: ProjectAvatarFragment;
};

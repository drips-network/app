import type { ProjectAvatarFragment } from '$lib/components/project-avatar/__generated__/gql.generated';
import type { Amount } from '../aggregate-fiat-estimate/aggregate-fiat-estimate';

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
  projectUrl?: string;
  // TODO: a more appropriate type
  projectAvatar: ProjectAvatarFragment & { totalEarned?: Amount[] };
};

export function getDripFill(options: SupportButtonOptions): string {
  return options.background === SupportButtonBackground.blue ? 'white' : '#5555ff';
}

export function getDependenciesStatement(dependencies: string | undefined): string {
  return dependencies && dependencies === '1'
    ? `Splitting to ${dependencies} Dependency`
    : `Splitting to ${dependencies} Dependencies`;
}

import type { ProjectData } from '$lib/graphql/__generated__/base-types';
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
  dependencies: string;
  projectName: string;
  projectUrl: string;
  projectData: ProjectData & { totalEarned?: Amount[] };
  prices: Record<string, number>;
};

export function getDripFill(options: SupportButtonOptions): string {
  return options.background === SupportButtonBackground.blue ? 'white' : '#5555ff';
}

export function getDependenciesStatement(dependencies: string | undefined): string {
  return dependencies && dependencies === '1'
    ? `Splitting to ${dependencies} Dependency`
    : `Splitting to ${dependencies} Dependencies`;
}

export const getSupportButtonOptions = (url: URL): SupportButtonOptions => {
  return {
    style:
      SupportButtonStyle[url.searchParams.get('style') as SupportButtonStyle] ||
      SupportButtonStyle.default,
    text:
      SupportButtonText[url.searchParams.get('text') as SupportButtonText] ||
      SupportButtonText.default,
    background:
      SupportButtonBackground[url.searchParams.get('background') as SupportButtonBackground] ||
      SupportButtonBackground.default,
    stat:
      SupportButtonStat[url.searchParams.get('stat') as SupportButtonStat] ||
      SupportButtonStat.default,
  };
};

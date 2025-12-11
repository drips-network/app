import type Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
import { getIssues } from '$lib/utils/wave/issues';
import {
  issueFilters,
  issueSortByOptionsSchema,
  type IssueFilters,
  type IssueSortByOption,
} from '$lib/utils/wave/types/issue';
import { getOwnWaveRepos, getWaves } from '$lib/utils/wave/waves';
import { redirect } from '@sveltejs/kit';
import type { ComponentProps } from 'svelte';

export const issuesPageLayoutLoad = async (
  {
    fetch,
    url,
    depends,
    parent,
    params,
  }: {
    fetch: typeof global.fetch;
    url: URL;
    depends: (...deps: `${string}:${string}`[]) => void;
    parent: () => Promise<{ user: WaveLoggedInUser | null }>;
    params: { issueId?: string };
  },
  config: (user: WaveLoggedInUser | null) => {
    requireLogin?: boolean;
    preappliedFilters?: IssueFilters;
    defaultFilters?: IssueFilters;
    pathPrefix: string;
    viewKey: string;
    filtersMode: 'maintainer' | 'contributor' | 'wave';
    breadcrumbs: ComponentProps<typeof Breadcrumbs>['crumbs'];
    availableSortByOptions?: IssueSortByOption[];
    allowAddToWave?: boolean;
    headMetaTitle: string;
    showNewApplicationsBadge?: boolean;
  },
) => {
  depends('wave:issues');

  const { user } = await parent();

  const {
    requireLogin,
    preappliedFilters,
    pathPrefix,
    filtersMode,
    breadcrumbs,
    viewKey,
    availableSortByOptions,
    allowAddToWave,
    headMetaTitle = 'Issues',
    defaultFilters,
    showNewApplicationsBadge,
  } = config(user);

  if (requireLogin) {
    if (!user) {
      throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
    }
  }

  // handle filters

  const filtersParam = url.searchParams.get('filters');
  const filtersParamDecoded = filtersParam ? atob(filtersParam) : null;
  const filtersParamParseResult = issueFilters
    .nullable()
    .safeParse(filtersParamDecoded ? JSON.parse(filtersParamDecoded) : null);

  if (!filtersParamParseResult.success) {
    // redirect to same page without invalid filters
    const currentParams = new URLSearchParams(url.search);
    currentParams.delete('filters');

    throw redirect(302, `${url.pathname}${currentParams.toString()}`);
  }

  const filters: IssueFilters = filtersParamParseResult.data || {};

  // if there are no current filters, apply default filters
  if (Object.keys(filters).length === 0 && defaultFilters) {
    Object.assign(filters, defaultFilters);
  }

  // Apply any preapplied filters from the layout config
  Object.assign(filters, preappliedFilters ?? {});

  // handle sorting

  const sortByParam = url.searchParams.get('sortBy');
  const sortByParamParseResult = issueSortByOptionsSchema.nullable().safeParse(sortByParam);

  if (!sortByParamParseResult.success) {
    // redirect to same page without invalid sortBy
    const currentParams = new URLSearchParams(url.search);
    currentParams.delete('sortBy');

    throw redirect(302, `${url.pathname}${currentParams.toString()}`);
  }

  const sortBy = sortByParamParseResult.data ?? 'updatedAt';

  // fetch data

  const [issues, waveRepos, waves] = await Promise.all([
    getIssues(fetch, { limit: 10 }, filters, sortBy),
    // todo(wave): pagination
    user ? (await getOwnWaveRepos(fetch, { limit: 100 })).data : [],
    // todo(wave): Only fetch waves included in the issues list
    (await getWaves(fetch, { limit: 100 })).data,
  ]);

  const isViewingIssue = params.issueId !== undefined;

  return {
    issues,
    appliedFilters: filters,
    appliedSort: sortBy,
    waveRepos,
    waves,
    pathPrefix,
    ownUserId: user?.id ?? null,
    noOfPreappliedFilters: Object.keys(preappliedFilters ?? {}).length,
    filtersMode,
    breadcrumbs,
    viewKey,
    availableSortByOptions: availableSortByOptions ?? ['updatedAt', 'createdAt'],
    allowAddToWave: allowAddToWave ?? false,
    isViewingIssue,
    headMetaTitle,
    showNewApplicationsBadge,

    waveHeaderBackground: false,
  };
};

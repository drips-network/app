import fuzzysort from 'fuzzysort';

import tokens from '$lib/stores/tokens';
import type { TokenInfoWrapper } from '$lib/stores/tokens/tokens.store';
import { get } from 'svelte/store';
import { isAddress } from 'ethers/lib/utils';
import { isSupportedGitUrl } from '$lib/utils/is-valid-git-url';
import GitProjectService from '$lib/utils/project/GitProjectService';

export enum SearchItemType {
  PROFILE,
  TOKEN,
  REPO,
}

interface MatchStrings {
  primary?: string;
  secondary?: string;
  tertiary?: string;
}

export type Item =
  | {
      type: SearchItemType.PROFILE;
      matchStrings: MatchStrings;
      item: {
        address?: string;
        name?: string;
        dripsAccountId?: string;
      };
    }
  | {
      type: SearchItemType.TOKEN;
      matchStrings: MatchStrings;
      item: TokenInfoWrapper;
    }
  | {
      type: SearchItemType.REPO;
      matchStrings: MatchStrings;
      item: {
        forge: string;
        repoName: string;
        username: string;
        url: string;
      };
    };

function searchMatchStringsForToken(token: TokenInfoWrapper): MatchStrings {
  const { name, symbol, address } = token.info;

  return {
    primary: name,
    secondary: symbol,
    tertiary: address,
  };
}

let searchItems: Item[] = [];

export function updateSearchItems(accountId: string | undefined) {
  const tokensVal = get(tokens);

  const currentTokens = (accountId && tokensVal) || [];

  searchItems = [
    ...currentTokens.map<Item>((token) => ({
      type: SearchItemType.TOKEN,
      matchStrings: searchMatchStringsForToken(token),
      item: token,
    })),
  ];
}

export default function search(input: string | undefined) {
  if (!input) return [];

  if (isSupportedGitUrl(input)) {
    const { username, repoName } = GitProjectService.deconstructUrl(input);

    searchItems.push({
      type: SearchItemType.REPO,
      matchStrings: {
        primary: input,
      },
      item: {
        forge: 'github',
        username,
        repoName,
        url: input,
      },
    });
  }

  if (
    input?.endsWith('.eth') &&
    searchItems.findIndex((i) => i.type === SearchItemType.PROFILE && i.item.name === input) === -1
  ) {
    searchItems.push({
      type: SearchItemType.PROFILE,
      matchStrings: {
        primary: input,
      },
      item: {
        name: input,
      },
    });
  }

  if (
    isAddress(input) &&
    searchItems.findIndex((i) => i.type === SearchItemType.PROFILE && i.item.address === input) ===
      -1
  ) {
    searchItems.push({
      type: SearchItemType.PROFILE,
      matchStrings: {
        primary: input,
      },
      item: {
        address: input,
      },
    });
  }

  // Input is exclusively numeric, which means it may be a drips user ID
  if (
    /^\d+$/.test(input) &&
    searchItems.findIndex(
      (i) => i.type === SearchItemType.PROFILE && i.item.dripsAccountId === input,
    ) === -1
  ) {
    searchItems.push({
      type: SearchItemType.PROFILE,
      matchStrings: {
        primary: input,
      },
      item: {
        dripsAccountId: input,
      },
    });
  }

  return fuzzysort.go(input, searchItems, {
    keys: ['matchStrings.primary', 'matchStrings.secondary', 'matchStrings.tertiary'],
    limit: 20,
  });
}

import fuzzysort from 'fuzzysort';

import streams from '$lib/stores/streams';
import type { Stream } from '$lib/stores/streams/types';
import tokens from '$lib/stores/tokens';
import type { TokenInfoWrapper } from '$lib/stores/tokens/tokens.store';
import { get } from 'svelte/store';
import ens from '$lib/stores/ens';
import { isAddress } from 'ethers/lib/utils';
import { AddressDriverClient } from 'radicle-drips';
import { isValidGitUrl } from '$lib/utils/is-valid-git-url';
import GitProjectService from '$lib/utils/project/GitProjectService';

export enum SearchItemType {
  PROFILE,
  STREAM,
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
      type: SearchItemType.STREAM;
      matchStrings: MatchStrings;
      item: Stream;
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

function searchMatchStringsForStream(stream: Stream): MatchStrings {
  const { name } = stream;
  const { dripId } = stream.streamConfig;

  const strings = [];
  if (name) strings.push(name);

  return {
    primary: dripId,
    secondary: name,
  };
}

function searchMatchStringsForToken(token: TokenInfoWrapper): MatchStrings {
  const { name, symbol, address } = token.info;

  return {
    primary: name,
    secondary: symbol,
    tertiary: address,
  };
}

let searchItems: Item[] = [];

interface AddressAccountIdPair {
  address: string;
  accountId?: string;
}

export function updateSearchItems(accountId: string | undefined) {
  const tokensVal = get(tokens);
  const ensVal = get(ens);
  const { accounts } = get(streams);

  const streamsForCurrentUser = accountId ? streams.getStreamsForUser(accountId) : undefined;
  const currentStreams = streamsForCurrentUser
    ? [...streamsForCurrentUser.incoming, ...streamsForCurrentUser.outgoing]
    : [];
  const currentTokens = (accountId && tokensVal) || [];

  const addresses: AddressAccountIdPair[] = Object.keys(accounts).map((a) => ({
    address: AddressDriverClient.getUserAddress(a),
    accountId: a,
  }));

  addresses.push(
    ...Object.keys(ensVal).reduce<AddressAccountIdPair[]>((acc, val) => {
      return addresses.find((v) => v.address.toLowerCase() === val.toLowerCase())
        ? acc
        : [
            ...acc,
            {
              address: val,
            },
          ];
    }, []),
  );

  searchItems = [
    ...currentStreams.map<Item>((stream) => ({
      type: SearchItemType.STREAM,
      matchStrings: searchMatchStringsForStream(stream),
      item: stream,
    })),
    ...currentTokens.map<Item>((token) => ({
      type: SearchItemType.TOKEN,
      matchStrings: searchMatchStringsForToken(token),
      item: token,
    })),
    ...addresses.map<Item>((v) => ({
      type: SearchItemType.PROFILE,
      matchStrings: {
        primary: ensVal[v.address]?.name,
        secondary: v.address,
        tertiary: v.accountId,
      },
      item: {
        address: v.address,
        name: ensVal[v.address]?.name,
        dripsAccountId: v.accountId,
      },
    })),
  ];
}

export default function search(input: string | undefined) {
  if (!input) return [];

  if (isValidGitUrl(input)) {
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

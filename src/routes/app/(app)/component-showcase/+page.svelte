<script lang="ts">
  import PlusIcon from '$lib/components/icons/Plus.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import ThumbsUp from '$lib/components/icons/ThumbsUp.svelte';
  import UserIcon from '$lib/components/icons/User.svelte';
  import EyeOpen from '$lib/components/icons/EyeOpen.svelte';

  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items as ListItems } from '$lib/components/list-select/list-select.types';
  import Button from '$lib/components/button/button.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Amount from '$lib/components/amount/amount.svelte';
  import ExampleTable from './examples/example-table.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { makeStep } from '$lib/components/stepper/types';
  import Step_1 from './examples/example-stepper-steps/step-1.svelte';
  import Step_2 from './examples/example-stepper-steps/step-2.svelte';
  import SuccessStep from './examples/example-stepper-steps/success-step.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import ProjectCard from '$lib/components/project-card/project-card.svelte';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SplitsComponent, { type Splits } from '$lib/components/splits/splits.svelte';
  import VisualPercentageEditor from '$lib/components/visual-percentage-editor/visual-percentage-editor.svelte';
  import SplitsIcon from '$lib/components/icons/Splits.svelte';
  import DripsLogo from '$lib/components/header/drips-logo.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Toggleable from '$lib/components/toggleable/toggleable.svelte';
  import {
    Forge,
    ProjectVerificationStatus,
    type Project,
    type Source,
    Driver,
  } from '$lib/graphql/__generated__/base-types';
  import highlightStore from '$lib/stores/highlight/highlight.store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import PropsOnlyButton from '$lib/components/button/props-only-button.svelte';
  import User from '$lib/components/icons/User.svelte';

  // Button
  let disabled = false;

  // List Select
  let selectedTokens: string[];
  let searchable = true;
  let multiselect = false;
  let exampleListItems: ListItems = {
    radicle: {
      type: 'selectable',
      label: 'Radicle',
      text: 'RAD',
      image: 'https://s2.coinmarketcap.com/static/img/coins/200x200/6843.png',
    },
    uniswap: {
      type: 'selectable',
      label: 'Uniswap',
      text: 'UNI',
      image: 'https://s2.coinmarketcap.com/static/img/coins/200x200/7083.png',
    },
    dai: {
      type: 'selectable',
      label: 'DAI',
      text: 'DAI',
      image: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    },
    'test-action': {
      type: 'action',
      label: 'Add a custom token',
      image: {
        component: PlusIcon,
        props: {},
      },
      handler: () => undefined,
    },
  };

  // Amount
  let amount = '1000000000000000000';
  let tokenAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';

  // Project Badge
  let projectVerified = true;
  type SourceType = 'github';
  let sourceType: SourceType = 'github';

  const SOURCE_CONFIGS: { [key in SourceType]: Source } = {
    github: {
      __typename: 'Source',
      forge: Forge.GitHub,
      repoName: 'svelte-stepper',
      ownerName: 'efstajas',
      url: 'https://github.com/efstajas/svelte-stepper.git',
    },
  };

  // Splits

  let draftMode = false;

  const MOCK_PROJECT_1: Project = {
    __typename: 'ClaimedProject',
    latestMetadataIpfsHash: '',
    totalEarned: [],
    withdrawableBalances: [],
    support: [],
    verificationStatus: ProjectVerificationStatus.Claimed,
    account: {
      __typename: 'RepoDriverAccount',
      accountId: '0',
      driver: Driver.Repo,
    },
    owner: {
      __typename: 'AddressDriverAccount',
      driver: Driver.Address,
      accountId: '0',
      address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
    },
    source: {
      __typename: 'Source',
      forge: Forge.GitHub,
      repoName: 'svelte-stepper',
      ownerName: 'efstajas',
      url: 'https://github.com/efstajas/svelte-stepper.git',
    },
    avatar: {
      __typename: 'EmojiAvatar',
      emoji: '🚶',
    },
    emoji: '🚶',
    color: '#fcc842',
    splits: { __typename: 'Splits', maintainers: [], dependencies: [] },
    claimedAt: 1234,
  };

  const MOCK_PROJECT_2: Project = {
    __typename: 'ClaimedProject',
    latestMetadataIpfsHash: '',
    totalEarned: [],
    withdrawableBalances: [],
    support: [],
    verificationStatus: ProjectVerificationStatus.Claimed,
    account: {
      __typename: 'RepoDriverAccount',
      accountId: '0',
      driver: Driver.Repo,
    },
    owner: {
      __typename: 'AddressDriverAccount',
      driver: Driver.Address,
      accountId: '0',
      address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
    },
    source: {
      __typename: 'Source',
      forge: Forge.GitHub,
      repoName: 'svelte-stored-writable',
      ownerName: 'efstajas',
      url: 'https://github.com/efstajas/svelte-stepper.git',
    },
    avatar: {
      __typename: 'EmojiAvatar',
      emoji: '💾',
    },
    emoji: '💾',
    color: '#FF0000',
    splits: { __typename: 'Splits', maintainers: [], dependencies: [] },
    claimedAt: 1234,
  };

  const mockSplits: Splits = [
    {
      __typename: 'ProjectReceiver',
      project: MOCK_PROJECT_1,
      weight: 62500,
    },
    {
      __typename: 'DripListReceiver',
      dripList: {
        __typename: 'DripList',
        account: {
          __typename: 'NftDriverAccount',
          accountId: '1234',
        },
        name: 'Some other Drip List',
        owner: {
          __typename: 'AddressDriverAccount',
          address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
        },
      },
      weight: 62500,
    },
    {
      __typename: 'AddressReceiver',
      account: {
        __typename: 'AddressDriverAccount',
        address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
      },
      weight: 62500,
    },
    {
      __typename: 'SplitGroup',
      name: 'Dependencies',
      list: [
        {
          __typename: 'ProjectReceiver',
          project: MOCK_PROJECT_2,
          weight: 62500,
        },
        {
          __typename: 'SplitGroup',
          name: 'Some nested stuff',
          list: [
            {
              __typename: 'DripListReceiver',
              dripList: {
                __typename: 'DripList',
                name: 'A different Drip List',
                owner: {
                  __typename: 'AddressDriverAccount',
                  address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
                },
                account: {
                  __typename: 'NftDriverAccount',
                  accountId: '1235',
                },
              },
              weight: 62500,
            },
            {
              __typename: 'ProjectReceiver',
              project: MOCK_PROJECT_1,
              weight: 62500,
            },
            {
              __typename: 'AddressReceiver',
              account: {
                __typename: 'AddressDriverAccount',
                address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
              },
              weight: 62500,
            },
            {
              __typename: 'AddressReceiver',
              account: {
                __typename: 'AddressDriverAccount',
                address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
              },
              weight: 62500,
            },
            {
              __typename: 'ProjectReceiver',
              project: MOCK_PROJECT_2,
              weight: 62500,
            },
            {
              __typename: 'ProjectReceiver',
              project: MOCK_PROJECT_1,
              weight: 62500,
            },
            {
              __typename: 'AddressReceiver',
              account: {
                __typename: 'AddressDriverAccount',
                address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
              },
              weight: 62500,
            },
            {
              __typename: 'AddressReceiver',
              account: {
                __typename: 'AddressDriverAccount',
                address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
              },
              weight: 62500,
            },
          ],
        },
        {
          __typename: 'AddressReceiver',
          account: {
            __typename: 'AddressDriverAccount',
            address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
          },
          weight: 62500,
        },
        {
          __typename: 'ProjectReceiver',
          project: MOCK_PROJECT_2,
          weight: 62500,
        },
      ],
    },
    {
      __typename: 'AddressReceiver',
      account: {
        __typename: 'AddressDriverAccount',
        address: '0xbaf6dc2e647aeb6f510f9e318856a1bcd66c5e19',
      },
      weight: 62500,
    },
  ];

  // Visual Percentage Editor

  const DEFAULT_PERCENTAGES = { 'option-1': 50, 'option-2': 45, 'option-3': 5 };

  // Section
  let sectionLoaded = false;
  let sectionEmpty = false;
  let sectionError = false;
  let sectionCollapsable = false;
  let sectionCollapsed = false;

  // List editor

  let isEditable = true;
  let weightsMode = true;
  let allowAddresses = true;
  let allowProjects = true;
  let allowDripLists = true;
</script>

<HeadMeta />

<h1>Component showcase</h1>

<div class="showcase-item">
  <h2>Date input</h2>
  <DateInput
    value={new Date()}
    timePrecision="minute"
    format="yyyy-MM-dd HH:mm"
    placeholder="yyyy-MM-dd HH:mm"
  />
</div>

<div class="showcase-item">
  <h2>List Editor</h2>
  <div>
    <input id="is-editable-checkbox" type="checkbox" bind:checked={isEditable} />
    <label for="is-editable-checkbox">Editable</label>
  </div>
  <div>
    <input id="percentages-mode-checkbox" type="checkbox" bind:checked={weightsMode} />
    <label for="percentages-mode-checkbox">Weights mode</label>
  </div>
  <div>
    <input id="allow-eth-addresses-checkbox" type="checkbox" bind:checked={allowAddresses} />
    <label for="allow-eth-addresses-checkbox">Allow ETH addresses</label>
  </div>
  <div>
    <input id="allow-projects-checkbox" type="checkbox" bind:checked={allowProjects} />
    <label for="allow-projects-checkbox">Allow projects</label>
  </div>
  <div>
    <input id="allow-drip-lists-checkbox" type="checkbox" bind:checked={allowDripLists} />
    <label for="allow-drip-lists-checkbox">Allow drip lists</label>
  </div>
  <ListEditor
    weights={{ 1234: 1000000 }}
    items={{
      1234: {
        type: 'address',
        address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
        rightComponent: {
          component: PropsOnlyButton,
          props: {
            label: 'Right button',
            onClick: () => alert('action done'),
            buttonProps: {
              icon: User,
              size: 'small',
            },
          },
        },
      },
    }}
    {isEditable}
    {allowAddresses}
    {allowDripLists}
    {allowProjects}
    {weightsMode}
  />
</div>

<div class="showcase-item">
  <h2>Highlight</h2>
  <Button
    on:click={() =>
      highlightStore.highlight({
        title: 'Highlight title',
        description: 'Description here',
        element: document.querySelectorAll("[data-highlightid='search']")[0],
        borderRadius: '2rem',
        paddingPx: 0,
      })}>Attach highlight to search button</Button
  >
  <Button
    on:click={() =>
      highlightStore.highlight({
        title: 'Collect received funds',
        description: 'You can collect funds to your wallet here.',
        element: document.querySelectorAll("[data-highlightid='global-collect']")[0],
        borderRadius: '2rem 0 2rem 2rem',
        paddingPx: 8,
      })}
    disabled={!$walletStore.connected}>Attach highlight to collect button</Button
  >
</div>

<div class="showcase-item">
  <h2>Toggleable</h2>
  <Toggleable>Toggleable content</Toggleable>
</div>

<div class="showcase-item">
  <h2>Section</h2>
  <div>
    <input id="section-loaded-checkbox" type="checkbox" bind:checked={sectionLoaded} />
    <label for="section-loaded-checkbox">Loaded</label>
  </div>
  <div>
    <input id="section-empty-checkbox" type="checkbox" bind:checked={sectionEmpty} />
    <label for="section-empty-checkbox">Empty</label>
  </div>
  <div>
    <input id="section-error-checkbox" type="checkbox" bind:checked={sectionError} />
    <label for="section-error-checkbox">Error</label>
  </div>
  <div>
    <input id="section-collapsable-checkbox" type="checkbox" bind:checked={sectionCollapsable} />
    <label for="section-collapsable-checkbox">Collapsable</label>
  </div>
  <div>
    <input id="section-collapsed-checkbox" type="checkbox" bind:checked={sectionCollapsed} />
    <label for="section-collapsed-checkbox">Collapsed</label>
  </div>
  <Section
    bind:collapsable={sectionCollapsable}
    bind:collapsed={sectionCollapsed}
    header={{
      icon: UserIcon,
      label: 'Section header',
    }}
    skeleton={{
      horizontalScroll: true,
      loaded: sectionLoaded,
      empty: sectionEmpty,
      error: sectionError,
    }}
  >
    <div style:background-color="red" style:min-height="150px">
      <span style:white-space="nowrap"
        >hello this is the section content! it's wiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiide so
        that we can test the horizontal scrolling</span
      >
      <Button>A button for testing the tab index functionality</Button>
    </div>
  </Section>
</div>

<div class="showcase-item">
  <h2>Share button</h2>
  <ShareButton url="https://wikipedia.com/" text="Check this out:" />
</div>

<div class="showcase-item">
  <h2>Visual Percentage Editor</h2>
  <VisualPercentageEditor
    items={[
      {
        id: 'option-1',
        label: 'Maintainers',
        overflowIcon: UserIcon,
      },
      {
        id: 'option-2',
        label: 'Dependencies',
        overflowIcon: SplitsIcon,
      },
      {
        id: 'option-3',
        label: 'Drips',
        overflowIcon: DripsLogo,
      },
    ]}
    percentages={DEFAULT_PERCENTAGES}
  />
</div>

<div class="showcase-item">
  <h2>Splits</h2>
  <div>
    <input id="splits-draft-mode" type="checkbox" bind:checked={draftMode} />
    <label for="splits-draft-mode">Draft</label>
  </div>
  <SplitsComponent list={mockSplits} draft={draftMode} />
</div>

<div class="showcase-item" style="max-width: 16rem">
  <h2>Project Card</h2>
  <PrimaryColorThemer colorHex="#fcc842">
    <ProjectCard
      project={{
        __typename: 'ClaimedProject',
        source: SOURCE_CONFIGS.github,
        avatar: {
          __typename: 'EmojiAvatar',
          emoji: '🚶',
        },
        color: '#fcc842',
      }}
    />
  </PrimaryColorThemer>
</div>

<div class="showcase-item">
  <h2>Project Badge</h2>
  <div>
    <div>
      <input id="project-verified-checkbox" type="checkbox" bind:checked={projectVerified} />
      <label for="project-verified-checkbox">Verified</label>
    </div>
    <div class="dropdown-wrapper">
      <p>Source type:</p>
      <Dropdown
        options={Object.keys(SOURCE_CONFIGS).map((k) => ({
          value: k,
          title: k,
        }))}
        bind:value={sourceType}
      />
    </div>
  </div>
  <PrimaryColorThemer colorHex="#fcc842">
    <ProjectBadge
      project={projectVerified
        ? {
            __typename: 'ClaimedProject',
            owner: {
              __typename: 'AddressDriverAccount',
              address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
            },
            source: SOURCE_CONFIGS[sourceType],
            avatar: {
              __typename: 'EmojiAvatar',
              emoji: '🚶',
            },
            color: '#fcc842',
          }
        : {
            __typename: 'UnclaimedProject',
            source: SOURCE_CONFIGS[sourceType],
          }}
    />
  </PrimaryColorThemer>
</div>

<div class="showcase-item">
  <h2>Button</h2>
  <div>
    <input id="button-disabled-checkbox" type="checkbox" bind:checked={disabled} />
    <label for="button-disabled-checkbox">Disabled</label>
  </div>
  <Button {disabled} icon={PlusIcon}>Example button</Button>
</div>

<div class="showcase-item">
  <h2>List Select</h2>
  <div>
    <div>
      <input id="searchable-checkbox" type="checkbox" bind:checked={searchable} />
      <label for="searchable-checkbox">Searchable</label>
    </div>
    <div>
      <input id="multiselect-checkbox" type="checkbox" bind:checked={multiselect} />
      <label for="multiselect-checkbox">Multi-select</label>
    </div>
    <p>
      Selected tokens: {selectedTokens}
    </p>
  </div>
  <div class="list-container">
    <ListSelect
      items={exampleListItems}
      bind:selected={selectedTokens}
      {searchable}
      {multiselect}
    />
  </div>
</div>

<div class="showcase-item">
  <h2>Section header</h2>
  <SectionHeader
    label="Hello"
    icon={ThumbsUp}
    actions={[
      {
        label: 'Trigger existential crisis',
        icon: UserIcon,
        handler: () => undefined,
      },
      {
        label: 'Witness',
        icon: EyeOpen,
        handler: () => undefined,
      },
    ]}
  />
</div>

<div class="showcase-item">
  <h2>Stepper</h2>
  <div class="stepper-wrapper">
    <Stepper
      steps={[
        makeStep({
          component: Step_1,
          props: {
            testProp: 'test prop value',
          },
        }),
        makeStep({
          component: Step_2,
          props: undefined,
        }),
        makeStep({
          component: SuccessStep,
          props: undefined,
        }),
      ]}
    />
  </div>
</div>

<div class="showcase-item">
  <h2>Amount</h2>
  <div>
    <p>Amount</p>
    <TextInput bind:value={amount} />
    <p>Token Address</p>
    <TextInput bind:value={tokenAddress} />
  </div>
  <p>Output:</p>
  <Amount
    amount={{
      amount: BigInt(amount),
      tokenAddress,
    }}
  />
</div>

<div class="showcase-item">
  <h2>Table</h2>
  <ExampleTable />
</div>

<style>
  h1 {
    color: var(--color-primary);
    margin-bottom: 2rem;
  }

  h2 {
    color: var(--color-primary);
    margin-bottom: 0.5rem;
  }

  .list-container {
    margin-top: 1rem;
    width: 32rem;
    height: 32rem;
    overflow: scroll;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    border-radius: 0.5rem;
  }

  .showcase-item {
    margin-bottom: 3rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .stepper-wrapper {
    border: 1px solid var(--color-foreground);
    border-radius: 0.5rem;
  }

  .dropdown-wrapper {
    white-space: nowrap;
    max-width: 24rem;
    display: flex;
    gap: 1rem;
    align-items: center;
  }
</style>

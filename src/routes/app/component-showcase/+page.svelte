<script lang="ts">
  import PlusIcon from 'radicle-design-system/icons/Plus.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import ThumbsUp from 'radicle-design-system/icons/ThumbsUp.svelte';
  import User from 'radicle-design-system/icons/User.svelte';
  import EyeOpen from 'radicle-design-system/icons/EyeOpen.svelte';

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
  import ProjectBadge, { type Source } from '$lib/components/project-badge/project-badge.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';

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
  type SourceType = 'github' | 'gitlab' | 'radicle' | 'generic';
  let sourceType: SourceType = 'github';

  const SOURCE_CONFIGS: { [key in SourceType]: Source } = {
    github: {
      type: 'github',
      repoName: 'svelte-stepper',
      ownerName: 'efstajas',
      url: 'https://github.com/efstajas/svelte-stepper.git',
    },
    gitlab: {
      type: 'gitlab',
      repoName: 'svelte-stepper',
      ownerName: 'efstajas',
      host: 'gitlab.com',
      url: 'https://gitlab.com/efstajas/svelte-stepper.git',
    },
    radicle: {
      type: 'radicle',
      repoName: 'svelte-stepper',
      seed: 'https://some-seed.radicle.xyz',
      rid: 'rad:29488291001389859',
      url: 'https://some-seed.radicle.xyz/rad:29488291001389859',
    },
    generic: {
      type: 'generic',
      repoName: 'svelte-stepper',
      url: 'https://some-host.com/svelte-stepper.git',
    },
  };
</script>

<h1>Component showcase</h1>

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
  <ProjectBadge
    project={projectVerified
      ? {
          gitDriverAccount: {
            userId: '0',
            driver: 'git',
          },
          owner: {
            driver: 'address',
            userId: '0',
            address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
          },
          source: SOURCE_CONFIGS[sourceType],
          emoji: '🚶',
          color: '#f5e342',
        }
      : {
          gitDriverAccount: {
            userId: '0',
            driver: 'git',
          },
          source: SOURCE_CONFIGS[sourceType],
          owner: undefined,
        }}
  />
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
        icon: User,
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

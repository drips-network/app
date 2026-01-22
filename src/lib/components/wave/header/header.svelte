<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Flyout from '$lib/components/flyout/flyout.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import Drip from '$lib/components/illustrations/drip.svelte';
  import SupportButton from '$lib/components/intercom/support-button.svelte';
  import NotificationsButton from '$lib/components/notifications/notifications-button.svelte';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
  import type { ComponentProps } from 'svelte';
  import GithubUserBadge from '../github-user-badge/github-user-badge.svelte';
  import Nav from '../nav/nav.svelte';
  import UserMenu from './components/user-menu.svelte';
  import Hamburger from '$lib/components/icons/Hamburger.svelte';
  import { page } from '$app/state';
  import Github from '$lib/components/icons/Github.svelte';

  let {
    user,
    pointsBalance,
    noBackground = false,
    mobileNavItems,
    hidePoints = false,
  }: {
    user: WaveLoggedInUser | null;
    pointsBalance: number | null;
    noBackground?: boolean;
    mobileNavItems: ComponentProps<typeof Nav>['items'] | null;
    hidePoints?: boolean;
  } = $props();

  const viewWidth = $derived($breakpointsStore?.dimensions.width);
  const mobileMode = $derived(viewWidth ? viewWidth <= 1024 : false);

  function handleMobileUserMenuClick() {
    if (!mobileMode) return;
    if (!user) return;

    cupertinoPaneStore.openSheet(UserMenu, { user, noBackground: true });
  }
</script>

<header class:noBackground>
  <div class="left">
    {#if mobileMode && mobileNavItems}
      <button
        onclick={() =>
          cupertinoPaneStore.openSheet(Nav, {
            items: mobileNavItems,
            collapsed: false,
            mode: 'hamburger',
          })}
        aria-label="Open navigation menu"
      >
        <Hamburger />
      </button>
    {/if}

    <a class="typo-header-3 logo" href="/wave">
      <div class="desktop-only" style:height="100%">
        <svg
          width="140"
          height="17"
          viewBox="0 0 140 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 16.2297H8.22722C15.5746 16.2297 17.1746 11.931 17.1746 8.15771C17.1746 4.19141 15.199 0.278717 8.22722 0.278717H0V16.2297ZM5.50233 4.88819H7.39453C11.1172 4.88819 11.46 7.05358 11.46 8.18987C11.46 9.32616 11.1335 11.6202 7.39453 11.6202H5.50233V4.88819Z"
            fill="var(--color-primary)"
          />
          <path
            d="M24.1143 4.41653H27.6441C28.5584 4.41653 28.885 4.92035 28.885 5.58498C28.885 6.2496 28.5584 6.75342 27.6441 6.75342H24.1143V4.41653ZM24.1143 10.9556H26.6644C28.4441 10.9556 29.0645 11.9632 29.0645 13.6784V16.2297C29.0645 16.2297 33.8079 16.2297 34.5995 16.2297V12.0918C34.5995 10.0337 33.6199 8.6401 31.9055 8.18987C32.9178 7.84684 34.5506 6.83918 34.5506 4.43797C34.5506 1.5222 32.6729 0.278717 29.6197 0.278717H18.612V16.2297H24.1143V10.9556Z"
            fill="var(--color-primary)"
          />
          <path
            d="M41.9079 0.278717H36.4219V16.2297H41.9079V0.278717Z"
            fill="var(--color-primary)"
          />
          <path
            d="M54.0622 11.5987C58.6176 11.5987 59.9401 8.81161 59.9401 5.87441C59.9401 2.89433 58.6502 0.278717 54.0622 0.278717H43.7912V16.2297H49.2936V11.5987H54.0622ZM49.2936 4.65236H52.9683C53.9316 4.65236 54.2582 5.18835 54.2582 5.89585C54.2582 6.58191 53.9316 7.13934 52.9683 7.13934H49.2936V4.65236Z"
            fill="var(--color-primary)"
          />
          <path
            d="M69.1261 16.5298C75.7876 16.5298 78 13.6569 78 10.8912C78 7.63244 76.2693 6.04592 71.5833 5.87441L69.2648 5.81009C67.2076 5.74577 66.7831 5.33842 66.7831 4.71668V4.69524C66.7831 4.11638 67.0851 3.68759 68.9791 3.68759C71.0364 3.68759 71.3058 4.58804 71.3547 5.16691H77.5592V5.01683C77.5592 2.37978 75.208 3.8147e-06 68.9056 3.8147e-06C63.1421 3.8147e-06 60.6276 2.13323 60.6276 4.94179C60.6276 7.45021 61.7542 9.81926 66.6361 9.99078L69.0526 10.0765C71.3547 10.1837 71.5833 10.6983 71.5833 11.3629V11.4058C71.5833 12.0704 71.1588 12.6921 69.1995 12.6921C67.0606 12.6921 66.7831 11.4915 66.7341 10.7412H60.4317V10.9341C60.4317 12.9923 62.0563 16.5298 69.1261 16.5298Z"
            fill="var(--color-primary)"
          />
          <g opacity="0.7">
            <path
              d="M133.702 16.4745C132.503 16.4745 131.467 16.2253 130.595 15.7269C129.728 15.2232 129.061 14.5119 128.593 13.5929C128.126 12.6687 127.892 11.581 127.892 10.3296C127.892 9.09911 128.126 8.01915 128.593 7.08976C129.066 6.15518 129.725 5.42828 130.571 4.90907C131.418 4.38466 132.412 4.12246 133.554 4.12246C134.292 4.12246 134.987 4.24188 135.642 4.48072C136.301 4.71436 136.882 5.07781 137.386 5.57106C137.895 6.06432 138.295 6.69256 138.585 7.45581C138.876 8.21386 139.022 9.11729 139.022 10.1661V11.0306H129.216V9.13027H136.319C136.314 8.59029 136.197 8.11001 135.969 7.68945C135.74 7.2637 135.421 6.92881 135.011 6.68478C134.606 6.44075 134.133 6.31873 133.593 6.31873C133.017 6.31873 132.511 6.45892 132.075 6.73929C131.638 7.01448 131.298 7.37792 131.054 7.82964C130.815 8.27616 130.693 8.76682 130.688 9.30161V10.9605C130.688 11.6562 130.815 12.2533 131.07 12.7518C131.324 13.245 131.68 13.6241 132.137 13.8889C132.594 14.1485 133.129 14.2783 133.741 14.2783C134.151 14.2783 134.523 14.2211 134.855 14.1069C135.187 13.9875 135.475 13.8136 135.719 13.5851C135.963 13.3567 136.148 13.0737 136.272 12.7362L138.905 13.0321C138.739 13.7279 138.422 14.3354 137.955 14.8546C137.493 15.3686 136.901 15.7684 136.179 16.054C135.457 16.3343 134.632 16.4745 133.702 16.4745Z"
              fill="var(--color-primary)"
            />
            <path
              d="M126.862 4.27822L122.602 16.2409H119.487L115.227 4.27822H118.233L120.982 13.1646H121.107L123.864 4.27822H126.862Z"
              fill="var(--color-primary)"
            />
            <path
              d="M107.454 16.4823C106.696 16.4823 106.013 16.3473 105.406 16.0773C104.804 15.8021 104.326 15.3972 103.973 14.8624C103.625 14.3276 103.451 13.6682 103.451 12.8842C103.451 12.2092 103.576 11.651 103.825 11.2097C104.074 10.7684 104.414 10.4153 104.845 10.1505C105.276 9.88572 105.761 9.68582 106.301 9.55083C106.847 9.41064 107.41 9.3094 107.992 9.24709C108.692 9.1744 109.261 9.1095 109.697 9.05239C110.133 8.99008 110.45 8.89662 110.647 8.77201C110.85 8.64221 110.951 8.44231 110.951 8.17232V8.12559C110.951 7.53888 110.777 7.08457 110.429 6.76266C110.081 6.44075 109.58 6.27979 108.926 6.27979C108.236 6.27979 107.688 6.43036 107.283 6.7315C106.883 7.03265 106.613 7.38831 106.473 7.79849L103.84 7.42465C104.048 6.69776 104.391 6.09028 104.868 5.60222C105.346 5.10896 105.93 4.74032 106.621 4.49629C107.311 4.24707 108.075 4.12246 108.911 4.12246C109.487 4.12246 110.061 4.18996 110.632 4.32495C111.203 4.45995 111.725 4.68321 112.197 4.99474C112.67 5.30107 113.049 5.71904 113.334 6.24864C113.625 6.77823 113.77 7.44023 113.77 8.23462V16.2409H111.06V14.5976H110.967C110.795 14.9299 110.554 15.2414 110.242 15.5322C109.936 15.8177 109.549 16.0488 109.082 16.2253C108.62 16.3966 108.077 16.4823 107.454 16.4823ZM108.186 14.4107C108.752 14.4107 109.243 14.299 109.658 14.0758C110.074 13.8473 110.393 13.5462 110.616 13.1723C110.845 12.7985 110.959 12.3909 110.959 11.9496V10.5399C110.871 10.6126 110.72 10.6801 110.507 10.7424C110.299 10.8047 110.066 10.8592 109.806 10.906C109.547 10.9527 109.29 10.9942 109.035 11.0306C108.781 11.0669 108.56 11.0981 108.373 11.124C107.953 11.1812 107.576 11.2746 107.244 11.4044C106.912 11.5342 106.649 11.7159 106.457 11.9496C106.265 12.178 106.169 12.474 106.169 12.8374C106.169 13.3567 106.359 13.7487 106.738 14.0135C107.117 14.2783 107.6 14.4107 108.186 14.4107Z"
              fill="var(--color-primary)"
            />
            <path
              d="M86.6324 16.2409L82.1308 0.290672H85.2383L88.1122 12.0119H88.2601L91.3287 0.290672H94.1558L97.2321 12.0197H97.3723L100.246 0.290672H103.354L98.8521 16.2409H96.0016L92.8084 5.04926H92.6838L89.4829 16.2409H86.6324Z"
              fill="var(--color-primary)"
            />
          </g>
        </svg>
      </div>
      <div class="mobile-only">
        <Drip height="1.5rem" />
      </div>
    </a>
  </div>

  <div class="right">
    {#if user}
      <NotificationsButton {user} />
    {/if}

    <SupportButton {user} />

    {#if user}
      {#if !hidePoints}
        <Button href="/wave/points" variant="caution" size="small" icon={Trophy}>
          {pointsBalance ?? 0}
        </Button>
      {/if}

      <Flyout
        disabled={mobileMode}
        noPadding
        width="16rem"
        onclickWhileDisabled={handleMobileUserMenuClick}
      >
        {#snippet trigger()}
          <GithubUserBadge {user} size={32} hideName link={!mobileMode} />
        {/snippet}

        {#snippet content()}
          <UserMenu {user} />
        {/snippet}
      </Flyout>
    {:else if !page.route.id?.startsWith('/(pages)/wave/(flows)/login')}
      <Button href="/wave/login?backTo={page.url.pathname + page.url.search}" icon={Github}>
        Log in
      </Button>
    {/if}
  </div>
</header>

<style>
  .logo {
    height: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    line-height: 0;
    color: var(--color-primary);
  }

  header {
    height: 4.5rem;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    padding-bottom: 1rem;
    justify-content: space-between;
    background: linear-gradient(
      180deg,
      var(--color-background) 0%,
      var(--color-background) 80%,
      transparent 100%
    );
    view-transition-name: header;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  header.noBackground {
    background: transparent;
  }

  header .right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .mobile-only {
    display: none;
  }

  .desktop-only {
    display: block;
  }

  @media (max-width: 1024px) {
    header {
      height: 3.5rem;
      padding: 0 1rem 0.5rem 1rem;
    }

    header.noBackground {
      background: linear-gradient(
        180deg,
        var(--color-background) 0%,
        var(--color-background) 90%,
        transparent 100%
      );
    }

    .mobile-only {
      display: block;
    }

    .desktop-only {
      display: none;
    }
  }
</style>

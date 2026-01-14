// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  // interface Locals {}

  interface PageData {
    /**
     * If true, the app layout while display a top-level spinner while
     * app stores are initializing. Disable for fully SSR'd views with a
     * load function.
     */
    blockWhileInitializing?: false;

    /**
     * If false, the app will redirect to the explore page.
     */
    preservePathOnNetworkChange?: boolean;

    /** If true, the /wave route header will have a transparent background
     * and pass through clicks. */
    waveHeaderBackground?: false;

    /** If true, flow will fill the screen rather than be constrained to a small centered window */
    waveFullscreenFlow?: boolean;
  }

  interface Locals {
    waveAccessToken?: string;
    waveRefreshToken?: string;
  }

  // interface PageError {}
  // interface Platform {}
}

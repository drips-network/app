import { browser } from '$app/environment';
import storedWritable from '@efstajas/svelte-stored-writable';
import { z } from 'zod';

/**
 * If true, the app will display additional dev-only information, such as
 * account IDs on address profiles, project profiles, and Drip Lists.
 */
export default storedWritable('developer-mode', z.boolean(), false, !browser);

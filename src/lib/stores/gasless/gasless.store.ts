import { browser } from '$app/environment';
import storedWritable from '@efstajas/svelte-stored-writable';
import { z } from 'zod';
import network from '../wallet/network';
import { get, writable } from 'svelte/store';
import walletStore from '../wallet/wallet.store';

/**
 * If true, the app will use gasless project claiming and collecting of earnings on supported
 * networks.
 */
export default network.gaslessClaimAndCollect && !get(walletStore).safe
  ? storedWritable('gasless-claims-and-collects', z.boolean(), true, !browser)
  : writable(false);

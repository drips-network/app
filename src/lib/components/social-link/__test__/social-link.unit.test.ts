import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import SocialLink, { isNetwork } from '../social-link.svelte';

describe('social-link.svelte', () => {
  it('validates supported network identifiers with isNetwork', () => {
    expect(isNetwork('org.telegram')).toBe(true);
    expect(isNetwork('com.discord')).toBe(true);
    expect(isNetwork('com.instagram')).toBe(true);
    expect(isNetwork('email')).toBe(true);
    expect(isNetwork('com.twitter')).toBe(true);
    expect(isNetwork('com.github')).toBe(true);
    expect(isNetwork('url')).toBe(true);
    expect(isNetwork('ethereum')).toBe(true);
    expect(isNetwork('unknown.social')).toBe(false);
  });

  it('renders Telegram link with handle stripped of leading @ and routed via /external', () => {
    render(SocialLink, {
      props: {
        network: 'org.telegram',
        value: '@dripsdev',
      },
    });

    const link = screen.getByRole('link', { name: '@dripsdev' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe(
      `/external/${encodeURIComponent('https://t.me/dripsdev')}`,
    );
  });

  it('renders Discord user link routed via /external', () => {
    render(SocialLink, {
      props: {
        network: 'com.discord',
        value: '123456789012345678',
      },
    });

    const link = screen.getByRole('link', { name: '123456789012345678' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe(
      `/external/${encodeURIComponent('https://discord.com/users/123456789012345678')}`,
    );
  });

  it('renders Instagram link with handle stripped of leading @ and routed via /external', () => {
    render(SocialLink, {
      props: {
        network: 'com.instagram',
        value: '@dripsnetwork',
      },
    });

    const link = screen.getByRole('link', { name: '@dripsnetwork' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe(
      `/external/${encodeURIComponent('https://instagram.com/dripsnetwork')}`,
    );
  });

  it('renders direct mailto link for email without routing through /external', () => {
    render(SocialLink, {
      props: {
        network: 'email',
        value: 'support@drips.network',
      },
    });

    const link = screen.getByRole('link', { name: 'support@drips.network' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('mailto:support@drips.network');
  });

  it('correctly handles mailto: prefix in email record and displays clean email address', () => {
    render(SocialLink, {
      props: {
        network: 'email',
        value: 'mailto:contact@example.com',
      },
    });

    const link = screen.getByRole('link', { name: 'contact@example.com' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('mailto:contact@example.com');
  });

  it('preserves full URL if user provided full URL in ENS record', () => {
    render(SocialLink, {
      props: {
        network: 'org.telegram',
        value: 'https://t.me/custom_channel',
      },
    });

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe(
      `/external/${encodeURIComponent('https://t.me/custom_channel')}`,
    );
  });
});

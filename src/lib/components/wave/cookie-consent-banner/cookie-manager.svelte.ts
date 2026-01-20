import { browser } from '$app/environment';
import z from 'zod';

export enum ConsentType {
  AUTHENTICATION = 'authentication',
  IN_APP_NOTIFICATIONS = 'in_app_notifications',
  INTERCOM = 'intercom',
  FARO = 'faro',
}

type ConsentTypeDefinition = {
  value: ConsentType;
  label: string;
  description: string;
  required: boolean;
};

export const REQUIRED_CONSENTS: ConsentTypeDefinition[] = [
  {
    value: ConsentType.AUTHENTICATION,
    label: 'Authentication',
    description:
      'The strictly necessary refresh- and access-token cookies enable user login and session management on Drips Wave. Authentication-related cookies are set only on the Drips Wave website and read only by Public Goods Association (Drips) systems to authenticate your requests after a login.',
    required: true,
  },
  {
    value: ConsentType.IN_APP_NOTIFICATIONS,
    label: 'In-app notifications',
    description:
      'Cookies set and read by Noti-Fire Apps Ltd. ("Novu") are used on the Drips Wave website to enable use of the "Novu" real-time notification system. These cookies are strictly necessary to manage and display real-time notifications, an integral part of the Drips Wave experience. The cookies are set only when you log in with an account.',
    required: true,
  },
];

export const OPTIONAL_CONSENTS: ConsentTypeDefinition[] = [
  {
    value: ConsentType.INTERCOM,
    label: 'Intercom support chat',
    description:
      'This cookie, set and read by Intercom, Inc. in the EU, enables the Intercom chat widget on the Drips Wave website to provide user support and assistance. It is used to identify you as a returning user and to store your chat history with our support team. Important: Even if initially disabled, Intercom cookies become strictly necessary and are enabled if you later explicitly open the chat widget.',
    required: false,
  },
  {
    value: ConsentType.FARO,
    label: 'Faro Monitoring',
    description:
      'Grafana Faro by Raintank Inc., dba Grafana Labs helps us track errors and performance issues on our website to improve user experience. It collects data about how you interact with our site, but does not collect personally-identifiable information. Grafana Faro uses cookie-like technologies to consolidate user sessions. Note: After turning this off, you may need to refresh the page to fully disable Faro monitoring.',
    required: false,
  },
];

export const CONSENT_TYPES: ConsentTypeDefinition[] = [...REQUIRED_CONSENTS, ...OPTIONAL_CONSENTS];

export default (() => {
  if (!browser) return;

  const consentMap: Record<ConsentType, boolean> = $state({
    [ConsentType.AUTHENTICATION]: true,
    [ConsentType.IN_APP_NOTIFICATIONS]: true,
    [ConsentType.INTERCOM]: false,
    [ConsentType.FARO]: false,
  });

  // load from localstorage
  const storedConsent = localStorage.getItem('cookie-consent');
  let consentRestored = false;

  const parsed = z
    .partialRecord(z.enum(ConsentType), z.boolean())
    .safeParse(storedConsent ? JSON.parse(storedConsent) : {});

  if (parsed.success) {
    Object.entries(parsed.data).forEach(([key, value]) => {
      consentMap[key as ConsentType] = value as boolean;
    });

    consentRestored = true;
  } else {
    // eslint-disable-next-line no-console
    console.warn('Failed to parse cookie consent from localStorage:', parsed.error);

    // clear invalid data
    localStorage.removeItem('cookie-consent');
  }

  function setConsent(type: ConsentType, value: boolean) {
    // check that type is valid and not required
    const consentType = CONSENT_TYPES.find((ct) => ct.value === type);
    if (!consentType) {
      throw new Error(`Invalid consent type: ${type}`);
    }
    if (consentType.required && value === false) {
      throw new Error(`Cannot change required consent type: ${type}`);
    }

    consentMap[type] = value;

    localStorage.setItem('cookie-consent', JSON.stringify(consentMap));
  }

  function acceptAll() {
    Object.keys(consentMap).forEach((key) => {
      consentMap[key as ConsentType] = true;
    });

    localStorage.setItem('cookie-consent', JSON.stringify(consentMap));
  }

  function rejectAllNonEssential() {
    Object.entries(consentMap).forEach(([key, _]) => {
      const consentType = CONSENT_TYPES.find((ct) => ct.value === key);
      if (consentType && !consentType.required) {
        consentMap[key as ConsentType] = false;
      }
    });

    localStorage.setItem('cookie-consent', JSON.stringify(consentMap));
  }

  /** tracks whether the user has interacted with cookie banner */
  let cookiesConfigured = $state(false);

  // restore from localstorage
  const storedCookiesConfigured = localStorage.getItem('cookies-configured');
  if (storedCookiesConfigured === 'true' && consentRestored) {
    cookiesConfigured = true;
  } else {
    cookiesConfigured = false;
  }

  function setCookiesConfigured() {
    localStorage.setItem('cookies-configured', 'true');
    cookiesConfigured = true;
  }

  return {
    consentMap,
    setConsent,
    acceptAll,
    rejectAllNonEssential,
    get cookiesConfigured() {
      return cookiesConfigured;
    },
    setCookiesConfigured,
  };
})();

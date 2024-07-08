<script lang="ts">
  import IconWrapper from '../IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#627EEA" />
    <g clip-path="url(#clip0_9588_174484)">
      <path
        d="M11.9982 2.5L11.8672 2.93285V15.4933L11.9982 15.6204L17.9964 12.1741L11.9982 2.5Z"
        fill="#C1CCF6"
      />
      <path d="M11.9982 2.5L6 12.1741L11.9982 15.6204V9.52399V2.5Z" fill="white" />
      <path
        d="M11.9982 16.7243L11.9244 16.8118V21.2861L11.9982 21.4957L18 13.2797L11.9982 16.7243Z"
        fill="#C1CCF6"
      />
      <path d="M11.9982 21.4957V16.7243L6 13.2797L11.9982 21.4957Z" fill="white" />
      <path d="M11.9982 15.6204L17.9963 12.1741L11.9982 9.52402V15.6204Z" fill="#8198EE" />
      <path d="M6.00006 12.1741L11.9982 15.6204V9.52402L6.00006 12.1741Z" fill="#C1CCF6" />
    </g>
    <defs>
      <clipPath id="clip0_9588_174484">
        <rect width="12" height="19" fill="white" transform="translate(6 2.5)" />
      </clipPath>
    </defs>
  </svg>
</IconWrapper>

<script lang="ts">
  import IconWrapper from '../IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_9588_174527)">
      <path
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill="#0453FC"
      />
      <g clip-path="url(#clip1_9588_174527)">
        <path
          d="M11.9061 20.8433C16.842 20.8433 20.8433 16.849 20.8433 11.9217C20.8433 6.99436 16.842 3 11.9061 3C7.22322 3 3.38154 6.59536 3 11.1717H14.813V12.6716H3C3.38154 17.248 7.22322 20.8433 11.9061 20.8433Z"
          fill="white"
        />
      </g>
    </g>
    <defs>
      <clipPath id="clip0_9588_174527">
        <rect width="24" height="24" fill="white" />
      </clipPath>
      <clipPath id="clip1_9588_174527">
        <rect width="18" height="18" fill="white" transform="translate(3 3)" />
      </clipPath>
    </defs>
  </svg>
</IconWrapper>

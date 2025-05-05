<script lang="ts">
  export let x = '0';
  export let y = '0';
</script>

<div class="sparkle" style:transform="translate({x}, {y})">
  {@html `<svg width="40" height="39" viewBox="0 0 40 39" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4.26466 19.3921C12.038 20.9532 18.1612 27.0787 19.7225 34.8545C21.2837 27.0787 27.407 20.9532 35.1803 19.3921C27.407 17.831 21.2837 11.7055 19.7225 3.92969C18.1612 11.7055 12.038 17.831 4.26466 19.3921Z" fill="var(--color-background)" stroke="var(--color-primary)" stroke-width="1.98723" stroke-linejoin="round"/>
  </svg>
  `}
</div>

<style>
  div {
    z-index: 10;
    position: absolute;
    width: fit-content;
    height: fit-content;
  }
</style>

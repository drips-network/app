<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 13.6253 3.95569 15.1428 4.74617 16.4333C4.99865 16.4139 5.24995 16.3904 5.5 16.3627V11C5.5 10.7239 5.72386 10.5 6 10.5H8C8.27614 10.5 8.5 10.7239 8.5 11V15.8231C8.83641 15.7385 9.16981 15.6465 9.5 15.547V9C9.5 8.72386 9.72386 8.5 10 8.5H12C12.2761 8.5 12.5 8.72386 12.5 9V14.4021C12.838 14.2445 13.1714 14.0787 13.5 13.905V7C13.5 6.72386 13.7239 6.5 14 6.5H16C16.2761 6.5 16.5 6.72386 16.5 7V12.0017C17.7384 11.0714 18.8778 10.0163 19.8994 8.85509C18.6489 5.71683 15.5827 3.5 12 3.5ZM2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C16.1203 2.5 19.6268 5.12283 20.9433 8.7884C21.004 8.95753 20.9693 9.14626 20.8524 9.28273C19.5166 10.8417 17.9802 12.2236 16.283 13.3885C16.1299 13.4936 15.9313 13.5052 15.7671 13.4187C15.6028 13.3322 15.5 13.1619 15.5 12.9763V7.5H14.5V14.204C14.5 14.3869 14.4001 14.5553 14.2395 14.6429C13.577 15.0044 12.8951 15.3349 12.1958 15.6325C12.0414 15.6982 11.8642 15.6821 11.7242 15.5895C11.5842 15.497 11.5 15.3403 11.5 15.1724V9.5H10.5V15.9154C10.5 16.133 10.3593 16.3256 10.152 16.3917C9.48325 16.6052 8.80148 16.7895 8.10821 16.9431C7.96019 16.976 7.80528 16.9398 7.68704 16.8449C7.56879 16.75 7.5 16.6066 7.5 16.455V11.5H6.5V16.8061C6.5 17.0573 6.31366 17.2695 6.06459 17.3019C5.55332 17.3685 5.03694 17.4187 4.516 17.4519C4.33709 17.4633 4.16577 17.378 4.06698 17.2284C3.07654 15.7285 2.5 13.9308 2.5 12ZM21.1259 10.7476C21.3148 10.811 21.448 10.9805 21.465 11.179C21.4882 11.4497 21.5 11.7235 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C9.64944 21.5 7.49714 20.6457 5.8386 19.2312C5.68701 19.1019 5.62664 18.895 5.68493 18.7045C5.74321 18.514 5.90904 18.3763 6.10701 18.3539C11.8377 17.7076 16.9314 14.955 20.5953 10.887C20.7286 10.739 20.9371 10.6842 21.1259 10.7476ZM7.44425 19.1774C8.76097 20.015 10.3234 20.5 12 20.5C16.5425 20.5 20.2527 16.9368 20.4881 12.453C17.0237 15.9245 12.501 18.3412 7.44425 19.1774Z"
  />
</IconWrapper>

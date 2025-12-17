<script lang="ts">
  import { onMount } from 'svelte';

  const uid = crypto.randomUUID();

  onMount(() => {
    // 1. BLINK LOGIC
    const eyelids = document.querySelectorAll<SVGPathElement>(`.eyelid-${uid}`);

    function blink() {
      eyelids.forEach((eyelid) => {
        eyelid.style.transform = 'translateY(30%)';
        setTimeout(() => {
          eyelid.style.transform = 'translateY(0%)';
        }, 200);
      });
    }

    let blinkTimeout: number;

    function scheduleBlink() {
      blinkTimeout = Math.random() * 4000 + 2000;
      setTimeout(() => {
        blink();
        scheduleBlink();
      }, blinkTimeout);
    }

    blink();
    scheduleBlink();

    // 2. PUPIL TRACKING LOGIC
    const pupils = document.querySelectorAll<SVGElement>(`.pupil-${uid}`);

    // Configuration
    const MAX_MOVEMENT = 2.5; // Restricted movement because pupils are large
    const DAMPING = 15;

    function handleMouseMove(e: MouseEvent) {
      pupils.forEach((pupil) => {
        const rect = pupil.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        const theta = Math.atan2(deltaY, deltaX);
        const distance = Math.min(Math.hypot(deltaX, deltaY) / DAMPING, MAX_MOVEMENT);

        const x = Math.cos(theta) * distance;
        const y = Math.sin(theta) * distance;

        pupil.style.transform = `translate(${x}px, ${y}px)`;
      });
    }

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(blinkTimeout);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });
</script>

<svg viewBox="0 0 82 81" fill="none" xmlns="http://www.w3.org/2000/svg">
  <mask
    id="mask0_19307_1424"
    style="mask-type:alpha"
    maskUnits="userSpaceOnUse"
    x="0"
    y="0"
    width="82"
    height="81"
  >
    <path
      d="M30.7749 16.492L16.4963 16.492L16.4963 38.3708C14.789 37.5621 12.9049 37.1984 11.0193 37.3134C5.23459 37.6664 0.500059 42.6536 0.500059 48.494C0.500059 54.2894 5.18973 59.3189 11.0193 59.6746C12.9049 59.7897 14.789 59.426 16.4963 58.6173L16.4963 80.5L30.7749 80.5L51.0254 80.5L65.3039 80.5L65.3039 58.6173C67.0112 59.426 68.8953 59.7897 70.781 59.6746C76.6105 59.3189 81.3002 54.2894 81.3002 48.494C81.3002 42.6536 76.5656 37.6664 70.781 37.3134C68.8953 37.1984 67.0112 37.5621 65.3039 38.3708L65.3039 16.492L51.0254 16.492C51.8332 14.7847 52.1961 12.9009 52.0805 11.0157C51.7231 5.1876 46.6943 0.499998 40.9001 0.499998C35.106 0.499998 30.0772 5.1876 29.7197 11.0157C29.6041 12.9009 29.9671 14.7847 30.7749 16.492Z"
      fill="#C0C0FF"
      stroke="#28333D"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </mask>
  <g mask="url(#mask0_19307_1424)">
    <path
      d="M30.7749 16.492L16.4963 16.492L16.4963 38.3708C14.789 37.5621 12.9049 37.1984 11.0193 37.3134C5.23459 37.6664 0.500059 42.6536 0.500059 48.494C0.500059 54.2894 5.18973 59.3189 11.0193 59.6746C12.9049 59.7897 14.789 59.426 16.4963 58.6173L16.4963 80.5L30.7749 80.5L51.0254 80.5L65.3039 80.5L65.3039 58.6173C67.0112 59.426 68.8953 59.7897 70.781 59.6746C76.6105 59.3189 81.3002 54.2894 81.3002 48.494C81.3002 42.6536 76.5656 37.6664 70.781 37.3134C68.8953 37.1984 67.0112 37.5621 65.3039 38.3708L65.3039 16.492L51.0254 16.492C51.8332 14.7847 52.1961 12.9009 52.0805 11.0157C51.7231 5.1876 46.6943 0.499998 40.9001 0.499998C35.106 0.499998 30.0772 5.1876 29.7197 11.0157C29.6041 12.9009 29.9671 14.7847 30.7749 16.492Z"
      fill="#C0C0FF"
      stroke="#28333D"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <mask
      id="mask1_19307_1424"
      style="mask-type:alpha"
      maskUnits="userSpaceOnUse"
      x="27"
      y="64"
      width="28"
      height="28"
    >
      <circle cx="40.9001" class="mouth-mask" cy="78.1796" r="13.5975" fill="#D9D9D9" />
      <circle
        cx="40.9001"
        class="mouth-mask"
        cy="78.1796"
        r="13.5975"
        fill="black"
        fill-opacity="0.2"
      />
    </mask>
    <g mask="url(#mask1_19307_1424)">
      <rect
        x="25.3743"
        y="60.5662"
        width="31.0519"
        height="19.9338"
        fill="#5555FF"
        stroke="#28333D"
      />
      <rect
        x="32.3994"
        y="59.7678"
        width="8.50073"
        height="16.3648"
        rx="3"
        fill="white"
        stroke="#28333D"
      />
      <rect
        x="40.9001"
        y="59.7678"
        width="8.50073"
        height="16.3648"
        rx="3"
        fill="white"
        stroke="#28333D"
      />
    </g>
    <circle cx="40.9001" cy="78.1796" r="14.0975" stroke="#28333D" class="mouth-mask" />

    <circle cx="31.1964" cy="39.9079" r="9.20374" fill="white" stroke="#28333D" />
    <circle cx="50.6039" cy="39.9079" r="9.20374" fill="white" stroke="#28333D" />

    <circle cx="31.1964" cy="39.9079" r="5.82225" fill="#28333D" class="pupil-{uid}" />
    <circle cx="50.6039" cy="39.9079" r="5.82225" fill="#28333D" class="pupil-{uid}" />

    <mask
      id="mask2_19307_1424"
      style="mask-type:alpha"
      maskUnits="userSpaceOnUse"
      x="21"
      y="30"
      width="20"
      height="20"
    >
      <circle cx="31.1964" cy="39.9079" r="9.70374" fill="white" />
    </mask>
    <g mask="url(#mask2_19307_1424)">
      <rect
        x="18.3606"
        y="-6.06747"
        width="25.6715"
        height="36.5434"
        fill="#28333D"
        class="eyelid eyelid-{uid}"
      />
    </g>
    <mask
      id="mask3_19307_1424"
      style="mask-type:alpha"
      maskUnits="userSpaceOnUse"
      x="40"
      y="30"
      width="21"
      height="20"
    >
      <circle cx="50.6039" cy="39.9079" r="9.70374" fill="white" />
    </mask>
    <g mask="url(#mask3_19307_1424)">
      <rect
        x="37.7681"
        y="-6.07001"
        width="25.6715"
        height="36.5434"
        fill="#28333D"
        class="eyelid eyelid-{uid}"
      />
    </g>
  </g>
</svg>

<style>
  .eyelid {
    transform: translateY(0%);
    transform-origin: center top;
    transition: transform 0.2s ease-in-out;
  }

  .mouth-mask {
    animation: slowGrowAndShrink 6s ease-in-out infinite;
    transform-origin: center bottom;
  }

  @keyframes slowGrowAndShrink {
    0%,
    100% {
      transform: scale(1.05);
    }
    50% {
      transform: scale(0.9);
    }
  }
</style>

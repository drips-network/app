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
    const MAX_MOVEMENT = 4; // Max pixels the pupil can move (keep it small for subtlety)
    const DAMPING = 15; // Lower = more responsive, Higher = moves less relative to mouse

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

<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M40 0.5H79.5V40C79.5 61.8152 61.8152 79.5 40 79.5H2C1.17157 79.5 0.5 78.8284 0.5 78V40C0.5 18.1848 18.1848 0.5 40 0.5Z"
    fill="#C0C0FF"
    stroke="#28333D"
  />
  <path
    d="M63.9717 64.1299H55.4541V75.9384L61.3227 73.3509C64.5239 78.1991 68.7047 78.7075 70.3949 78.3557L73.258 78.1855C76.3764 78.2127 75.7532 75.8363 75.0518 74.6447C77.8942 74.0727 77.156 72.3182 76.4316 71.5124C78.9152 70.6136 78.4323 68.3461 77.6734 67.4949C79.5706 67.3247 80.088 64.1299 77.6734 64.1299H67.6698C71.0503 59.6073 68.8426 57.0086 67.6698 56.4979C66.7315 56.0893 65.8531 56.5319 65.5311 56.8043L63.9717 64.1299Z"
    fill="#C0C0FF"
  />
  <path
    d="M55.3181 76.4204L61.1991 73.2846C62.7989 75.6865 67.2965 80.0232 72.488 78.1551M55.3181 63.8773H64.1058L65.593 56.7383C69.6977 55.4166 70.6255 60.9904 67.6209 63.8773H74.5143"
    stroke="#28333D"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <rect
    x="72.4243"
    y="63.879"
    width="6.80907"
    height="3.69536"
    rx="1.84768"
    fill="#C0C0FF"
    stroke="#28333D"
  />
  <rect
    x="71.8169"
    y="67.5744"
    width="6.80907"
    height="3.69536"
    rx="1.84768"
    fill="#C0C0FF"
    stroke="#28333D"
  />
  <rect
    x="71.2094"
    y="71.2698"
    width="6.80907"
    height="3.69536"
    rx="1.84768"
    fill="#C0C0FF"
    stroke="#28333D"
  />
  <rect
    x="69.4141"
    y="74.9651"
    width="6.80907"
    height="3.69536"
    rx="1.84768"
    fill="#C0C0FF"
    stroke="#28333D"
  />

  <circle cx="28.2982" cy="36.5" r="11.7982" fill="white" stroke="#28333D" />
  <circle cx="28.2983" cy="36.5" r="2.03044" fill="#28333D" class="pupil-{uid}" />

  <circle cx="52.2982" cy="36.5" r="11.7982" fill="white" stroke="#28333D" />
  <circle cx="52.2983" cy="36.5" r="2.03044" fill="#28333D" class="pupil-{uid}" />

  <path
    d="M44.1349 54.7041C44.0237 56.8914 42.2151 58.6307 40.0001 58.6308C37.7851 58.6308 35.9766 56.8914 35.8654 54.7041H44.1349Z"
    fill="#5555FF"
    stroke="#28333D"
  />

  <mask
    id="mask0_19305_1351"
    style="mask-type:alpha"
    maskUnits="userSpaceOnUse"
    x="17"
    y="25"
    width="23"
    height="23"
  >
    <circle cx="28.2982" cy="36.5" r="11.2982" fill="white" />
  </mask>
  <g mask="url(#mask0_19305_1351)">
    <rect
      x="13.7018"
      y="-27.03409"
      width="26.5964"
      height="50.8315"
      class="eyelid eyelid-{uid}"
      fill="#28333D"
    />
  </g>
  <mask
    id="mask1_19305_1351"
    style="mask-type:alpha"
    maskUnits="userSpaceOnUse"
    x="41"
    y="25"
    width="23"
    height="23"
  >
    <circle cx="52.2982" cy="36.5" r="11.2982" fill="white" />
  </mask>
  <g mask="url(#mask1_19305_1351)">
    <rect
      x="39.7018"
      y="-27.03409"
      width="26.5964"
      height="50.8315"
      class="eyelid eyelid-{uid}"
      fill="#28333D"
    />
  </g>
</svg>

<style>
  .eyelid {
    transform: translateY(0%);
    transform-origin: center top;
    transition: transform 0.2s ease-in-out;
  }
</style>

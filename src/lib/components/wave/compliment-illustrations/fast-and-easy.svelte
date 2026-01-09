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
    const pupils = document.querySelectorAll<SVGGElement>(`.pupil-group-${uid}`);

    // Configuration
    const MAX_MOVEMENT = 3; // Smaller movement radius for this character
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

<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M59.3018 12.2695C71.4743 19.5328 78.9296 32.663 78.9297 46.8379V58.7998C78.9297 70.0818 69.7839 79.2283 58.502 79.2285H20.9277C9.64577 79.2283 0.5 70.0818 0.5 58.7998V46.8379C0.500039 32.663 7.95534 19.5328 20.1279 12.2695L39.7148 0.582031L59.3018 12.2695Z"
    fill="#C0C0FF"
    stroke="#28333D"
  />

  <circle cx="26.9779" cy="44.9819" r="12.1409" fill="white" stroke="#28333D" />
  <g class="pupil-group-{uid}">
    <circle cx="29.4908" cy="44.469" r="4.60493" fill="#28333D" />
  </g>

  <mask
    id="mask0_19305_1394"
    style="mask-type:alpha"
    maskUnits="userSpaceOnUse"
    x="15"
    y="33"
    width="24"
    height="24"
  >
    <circle cx="26.9779" cy="44.9819" r="11.6409" fill="white" />
  </mask>
  <g mask="url(#mask0_19305_1394)">
    <rect
      x="9.4967"
      y="-22.2499"
      width="32.2771"
      height="57.122"
      fill="#28333D"
      class="eyelid eyelid-{uid}"
    />
  </g>

  <circle
    cx="11.6409"
    cy="11.6409"
    r="12.1409"
    transform="matrix(-1 0 0 1 62.9005 33.3411)"
    fill="white"
    stroke="#28333D"
  />
  <g class="pupil-group-{uid}">
    <circle
      cx="4.60493"
      cy="4.60493"
      r="4.60493"
      transform="matrix(-1 0 0 1 53.3517 39.8641)"
      fill="#28333D"
    />
  </g>

  <mask
    id="mask1_19305_1394"
    style="mask-type:alpha"
    maskUnits="userSpaceOnUse"
    x="39"
    y="33"
    width="24"
    height="24"
  >
    <circle cx="51.2596" cy="44.9819" r="11.6409" fill="white" />
  </mask>
  <g mask="url(#mask1_19305_1394)">
    <rect
      x="33.7784"
      y="-22.2499"
      width="32.2771"
      height="57.122"
      fill="#28333D"
      class="eyelid eyelid-{uid}"
    />
  </g>

  <rect
    x="9.41431"
    y="53.0585"
    width="59.8552"
    height="21.5627"
    rx="10.7814"
    fill="#EAEAFF"
    stroke="#28333D"
  />
  <ellipse cx="39.3419" cy="53.0585" rx="5.89184" ry="4.78542" fill="#28333D" />
  <path
    class="mouth"
    d="M44.2029 61.137V61.5488C44.2029 65.2346 47.1909 68.2226 50.8768 68.2226C54.5626 68.2226 57.5506 65.2346 57.5506 61.5487V61.137"
    stroke="#28333D"
  />
</svg>

<style>
  .eyelid {
    transform: translateY(0%);
    transform-origin: center top;
    transition: transform 0.2s ease-in-out;
  }

  .mouth {
    animation: slowSideLeftAndRight 6s ease-in-out infinite;
  }

  @keyframes slowSideLeftAndRight {
    0%,
    100% {
      transform: translateX(0px);
    }
    50% {
      transform: translateX(-3px);
    }
  }
</style>

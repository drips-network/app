<script lang="ts">
  import { onMount } from 'svelte';

  const uid = crypto.randomUUID();

  onMount(() => {
    // 1. BLINK LOGIC
    const eyelids = document.querySelectorAll<SVGElement>(`.eyelid-${uid}`);

    function blink() {
      eyelids.forEach((eyelid) => {
        eyelid.style.transform = 'translateY(20px)';
        setTimeout(() => {
          eyelid.style.transform = 'translateY(0px)';
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

    // Config
    const MAX_MOVEMENT = 2.5; // (8.16 - 5.24) = ~2.9 is the limit. Keeping it 2.5 is safe.
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
  <defs>
    <mask id="clip-left-eye-{uid}">
      <circle cx="32.4196" cy="31.7608" r="8.16364" fill="white" />
    </mask>
    <mask id="clip-right-eye-{uid}">
      <circle cx="49.9131" cy="31.7608" r="8.16364" fill="white" />
    </mask>
  </defs>

  <path
    class="outline"
    d="M34.7732 3.68094C37.5454 -0.44949 43.6211 -0.449495 46.3933 3.68093L48.6077 6.98018C50.3037 9.50708 53.4385 10.6481 56.3619 9.8025L60.179 8.6985C64.9576 7.31638 69.6118 11.2217 69.0805 16.1678L68.6561 20.1185C68.3311 23.1444 69.9991 26.0334 72.7821 27.2649L76.4157 28.8727C80.9648 30.8856 82.0198 36.8689 78.4335 40.3163L75.5689 43.07C73.3749 45.179 72.7956 48.4643 74.136 51.1965L75.8861 54.7638C78.077 59.2299 75.0392 64.4915 70.076 64.8272L66.1115 65.0953C63.0752 65.3006 60.5197 67.4449 59.7902 70.3995L58.8378 74.2571C57.6454 79.0866 51.9362 81.1646 47.9184 78.2314L44.7092 75.8885C42.2512 74.0941 38.9153 74.0941 36.4573 75.8885L33.2481 78.2314C29.2303 81.1646 23.5211 79.0866 22.3287 74.2571L21.3763 70.3995C20.6468 67.4449 18.0913 65.3006 15.0549 65.0953L11.0905 64.8272C6.12735 64.4915 3.08952 59.2299 5.28045 54.7638L7.03049 51.1965C8.37086 48.4643 7.79157 45.179 5.59757 43.07L2.73297 40.3163C-0.853314 36.869 0.201707 30.8856 4.75078 28.8727L8.38443 27.2649C11.1674 26.0334 12.8354 23.1444 12.5104 20.1185L12.086 16.1678C11.5547 11.2217 16.2089 7.31638 20.9875 8.6985L24.8046 9.8025C27.728 10.6481 30.8628 9.50709 32.5588 6.98019L34.7732 3.68094Z"
    fill="#C0C0FF"
    stroke="#28333D"
    stroke-width="1.16623"
  />

  <circle
    cx="32.4196"
    cy="31.7608"
    r="8.16364"
    fill="white"
    stroke="#28333D"
    stroke-width="1.16623"
  />
  <circle
    cx="49.9131"
    cy="31.7608"
    r="8.16364"
    fill="white"
    stroke="#28333D"
    stroke-width="1.16623"
  />

  <g mask="url(#clip-left-eye-{uid})">
    <circle cx="32.4196" cy="31.7608" r="5.24805" fill="#28333D" class="pupil-{uid}" />
  </g>

  <g mask="url(#clip-right-eye-{uid})">
    <circle cx="49.9131" cy="31.7608" r="5.24805" fill="#28333D" class="pupil-{uid}" />
  </g>

  <mask
    id="mask-left-lid-{uid}"
    style="mask-type:alpha"
    maskUnits="userSpaceOnUse"
    x="24"
    y="23"
    width="17"
    height="17"
  >
    <circle cx="32.4196" cy="31.7608" r="8.16364" fill="white" />
  </mask>
  <g mask="url(#mask-left-lid-{uid})">
    <rect x="22" y="3" width="20" height="20" fill="#28333D" class="eyelid eyelid-{uid}" />
  </g>

  <mask
    id="mask-right-lid-{uid}"
    style="mask-type:alpha"
    maskUnits="userSpaceOnUse"
    x="41"
    y="23"
    width="17"
    height="17"
  >
    <circle cx="49.9131" cy="31.7608" r="8.16364" fill="white" />
  </mask>
  <g mask="url(#mask-right-lid-{uid})">
    <rect x="39" y="3" width="20" height="20" fill="#28333D" class="eyelid eyelid-{uid}" />
  </g>

  <circle
    cx="41.1664"
    cy="56.8348"
    r="9.91299"
    fill="#28333D"
    stroke="#28333D"
    stroke-width="1.16623"
  />
  <path
    d="M44.581 54.5023C46.7844 54.5024 48.808 55.268 50.4042 56.5453C50.4072 56.6413 50.412 56.7376 50.412 56.8344C50.412 61.9871 46.2347 66.1645 41.082 66.1645C38.878 66.1644 36.8542 65.3984 35.2578 64.1205C35.2548 64.0248 35.2509 63.9288 35.2509 63.8324C35.2509 58.6797 39.4282 54.5023 44.581 54.5023Z"
    fill="#5555FF"
  />
</svg>

<style>
  .outline {
    animation: rotate 30s linear infinite;
    transform-origin: center;
    outline-style: none;
  }

  .eyelid {
    transform: translateY(0px);
    transition: transform 0.2s ease-in-out;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
